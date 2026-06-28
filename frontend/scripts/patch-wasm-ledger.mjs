import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RPC = "https://soroban-testnet.stellar.org";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WASM_DIR = path.resolve(__dirname, "..", "public", "engine", "js");

async function getLatestLedger() {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getLatestLedger" }),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch latest ledger: HTTP ${res.status}`);
  }
  const data = await res.json();
  if (data.error) {
    throw new Error(`RPC error: ${JSON.stringify(data.error)}`);
  }
  return data.result.sequence;
}

async function main() {
  console.log("Fetching latest ledger from Stellar Testnet RPC...");
  const latest = await getLatestLedger();
  // Safe buffer: 1000 ledgers (approx 1.4 hours of history)
  const newLedger = latest - 1000;
  console.log(`Latest ledger: ${latest}. Target start ledger: ${newLedger}`);

  const files = [
    "web_bg.wasm",
    "prover-worker_bg.wasm",
    "storage-worker_bg.wasm",
  ];

  for (const file of files) {
    const filePath = path.join(WASM_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      continue;
    }

    console.log(`Patching ${file}...`);
    const buf = fs.readFileSync(filePath);
    const contentStr = buf.toString("binary");

    // We search for `"deploymentLedger":XXXXXXX` where XXXXXXX is 7 digits
    const regex = /"deploymentLedger":\d{7}/g;
    const matches = contentStr.match(regex);

    if (!matches) {
      console.log(`No deploymentLedger matching pattern found in ${file}`);
      continue;
    }

    console.log(`Found pattern: ${matches.join(", ")}`);
    const replaced = contentStr.replace(
      regex,
      `"deploymentLedger":${newLedger}`,
    );

    // Safety check: verify length did not change
    if (replaced.length !== contentStr.length) {
      console.error(
        `Error: Length mismatch after patching! Original: ${contentStr.length}, Patched: ${replaced.length}`,
      );
      process.exit(1);
    }

    fs.writeFileSync(filePath, Buffer.from(replaced, "binary"));
    console.log(`Successfully patched ${file}`);
  }

  console.log(
    "\nAll done! Restart your Next.js dev server or refresh the browser.",
  );
}

main().catch((err) => {
  console.error("Patch failed:", err);
  process.exit(1);
});
