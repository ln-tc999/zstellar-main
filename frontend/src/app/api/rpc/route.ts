const UPSTREAM =
  process.env.STELLAR_RPC_UPSTREAM ?? "https://soroban-testnet.stellar.org";

export const dynamic = "force-dynamic";

// Keep track of the highest ledger sequence we have seen on the server to prevent
// client-side out-of-sync issues due to lagging RPC load balancer nodes.
let globalMaxLedger = 0;

// New contracts were deployed at ledger 3329884 — well within the live RPC window.
// No historical event injection or pruned-range interception is needed.
// All RPC requests pass directly to the upstream Stellar RPC.

export async function POST(request: Request): Promise<Response> {
  const body = await request.text();

  let json: {
    method?: string;
    id?: unknown;
  } | null = null;

  try {
    json = JSON.parse(body);
  } catch {
    // Ignore JSON parse errors for non-JSON payloads
  }

  const method = json?.method || "unknown";

  console.log(
    `[RPC Proxy] Request: method=${method}, id=${json?.id ?? "none"}`,
  );

  let lastError = "unknown error";

  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const upstream = await fetch(UPSTREAM, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
      });

      if (
        upstream.status === 503 ||
        upstream.status === 429 ||
        upstream.status === 502
      ) {
        lastError = `upstream status ${upstream.status}`;
        await new Promise((resolve) => setTimeout(resolve, 300));
        continue;
      }

      const text = await upstream.text();
      // biome-ignore lint/suspicious/noExplicitAny: allow any for dynamic JSON-RPC structure parsing
      let responseJson: any = null;
      try {
        responseJson = JSON.parse(text);
      } catch {
        // Non-JSON response (e.g. XDR binary from a misconfigured load-balancer node) — retry
        lastError = "upstream returned non-JSON response";
        await new Promise((resolve) => setTimeout(resolve, 300));
        continue;
      }

      // Retry on lagging node for getEvents
      if (
        responseJson?.error?.message?.includes(
          "startLedger must be within the ledger range",
        )
      ) {
        lastError = `lagging node: ${responseJson.error.message}`;
        console.warn(
          `[RPC Proxy] Lagging node returned startLedger error (attempt ${
            attempt + 1
          }). Retrying...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 300));
        continue;
      }

      // Guard getLatestLedger against lagging nodes
      if (
        method === "getLatestLedger" &&
        responseJson?.result?.sequence != null
      ) {
        const seq = Number(responseJson.result.sequence);
        if (seq < globalMaxLedger && attempt < 5) {
          lastError = `lagging getLatestLedger: got ${seq}, expected >= ${globalMaxLedger}`;
          console.warn(
            `[RPC Proxy] Lagging ledger detected: got ${seq}, expected >= ${globalMaxLedger} (attempt ${
              attempt + 1
            }). Retrying...`,
          );
          await new Promise((resolve) => setTimeout(resolve, 200));
          continue;
        }
        if (seq > globalMaxLedger) {
          globalMaxLedger = seq;
        }
        // Force the returned sequence to be at least globalMaxLedger
        if (seq < globalMaxLedger) {
          responseJson.result.sequence = globalMaxLedger;
          return new Response(JSON.stringify(responseJson), {
            status: 200,
            headers: {
              "content-type": "application/json",
              "Cross-Origin-Resource-Policy": "same-origin",
              "Cache-Control": "no-store",
            },
          });
        }
      }

      console.log(
        `[RPC Proxy] Upstream response for method=${method}, status=${upstream.status}`,
      );

      return new Response(text, {
        status: upstream.status,
        headers: {
          "content-type": "application/json",
          "Cross-Origin-Resource-Policy": "same-origin",
          "Cache-Control": "no-store",
        },
      });
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  console.error(
    `[RPC Proxy] Request failed for method=${method}: ${lastError}`,
  );

  return new Response(
    JSON.stringify({ jsonrpc: "2.0", id: null, error: { message: lastError } }),
    {
      status: 502,
      headers: {
        "content-type": "application/json",
        "Cross-Origin-Resource-Policy": "same-origin",
      },
    },
  );
}
