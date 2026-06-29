// Use Edge Runtime: no cold starts, globally distributed, instant response.
export const runtime = "edge";
export const dynamic = "force-dynamic";

const UPSTREAM =
  process.env.STELLAR_RPC_UPSTREAM ?? "https://soroban-testnet.stellar.org";

// New contracts were deployed at this ledger. Any getEvents request with
// startLedger before this is for a pruned or non-existent range, so we
// rewrite it to start from our actual deployment point. This is needed
// because the WASM binary has the old deployment ledger hardcoded.
const NEW_DEPLOYMENT_LEDGER = 3329884;

const CORS_HEADERS: Record<string, string> = {
  "content-type": "application/json",
  "Cross-Origin-Resource-Policy": "cross-origin",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "no-store",
};

export async function POST(request: Request): Promise<Response> {
  let body = await request.text();

  // Rewrite getEvents requests that start before our new deployment ledger.
  // The WASM binary has the old deployment ledger (~3158xxx) hardcoded; those
  // ledgers are pruned on testnet. We transparently rewrite to the new
  // deployment start so the WASM gets a valid, real RPC response.
  try {
    const json = JSON.parse(body);
    if (
      json?.method === "getEvents" &&
      json?.params?.startLedger != null &&
      Number(json.params.startLedger) < NEW_DEPLOYMENT_LEDGER
    ) {
      console.log(
        `[RPC Proxy] Rewriting startLedger ${json.params.startLedger} → ${NEW_DEPLOYMENT_LEDGER}`,
      );
      json.params.startLedger = NEW_DEPLOYMENT_LEDGER;
      body = JSON.stringify(json);
    }
  } catch {
    // Not JSON — pass through unchanged
  }

  let lastError = "upstream unreachable";
  const startTime = Date.now();
  const maxBudgetMs = 25000; // 25 seconds total budget to align with client-side & Edge limits

  for (let attempt = 0; attempt < 2; attempt++) {
    const elapsed = Date.now() - startTime;
    const remainingMs = maxBudgetMs - elapsed;
    if (remainingMs <= 1000) {
      break; // No time left for another attempt
    }

    let upstream: Response;
    try {
      const ac = new AbortController();
      // Use the remaining budget as the timeout for this fetch
      const t = setTimeout(() => ac.abort(), remainingMs);
      try {
        upstream = await fetch(UPSTREAM, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body,
          signal: ac.signal,
        });
      } finally {
        clearTimeout(t);
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      // If it aborted due to timeout, don't sleep, just continue (it will break anyway if remaining time is small)
      if (lastError.includes("aborted") || lastError.includes("timeout")) {
        continue;
      }
      await delay(300);
      continue;
    }

    // If upstream returns rate limit or temporary server issues, we can try to retry
    if (
      upstream.status === 429 ||
      upstream.status === 502 ||
      upstream.status === 503
    ) {
      lastError = `upstream HTTP ${upstream.status}`;
      await delay(300);
      continue;
    }

    const text = await upstream.text();

    // Check if the response is not valid JSON (e.g. Cloudflare HTML / XDR binary error)
    if (!looksLikeJson(text)) {
      lastError = "upstream returned non-JSON body";
      await delay(300);
      continue;
    }

    // Check for transient RPC errors inside response JSON
    if (text.includes("Please try again") || text.includes("rate limit")) {
      lastError = `stellar RPC transient error (attempt ${attempt + 1})`;
      await delay(300);
      continue;
    }

    return new Response(text, {
      status: upstream.status,
      headers: CORS_HEADERS,
    });
  }

  console.error(`[RPC Proxy] Failed: ${lastError}`);
  return new Response(
    JSON.stringify({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32603, message: lastError },
    }),
    { status: 502, headers: CORS_HEADERS },
  );
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
    },
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function looksLikeJson(s: string): boolean {
  const t = s.trimStart();
  return t.startsWith("{") || t.startsWith("[");
}
