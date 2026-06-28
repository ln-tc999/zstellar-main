const UPSTREAM =
  process.env.STELLAR_RPC_UPSTREAM ?? "https://soroban-testnet.stellar.org";

export const dynamic = "force-dynamic";

// Keep track of the highest ledger sequence we have seen on the server to prevent
// client-side out-of-sync issues due to lagging RPC load balancer nodes.
let globalMaxLedger = 0;

export async function POST(request: Request): Promise<Response> {
  const body = await request.text();

  let isGetLatestLedger = false;
  try {
    const json = JSON.parse(body);
    if (json?.method === "getLatestLedger") {
      isGetLatestLedger = true;
    }
  } catch {
    // Ignore JSON parse errors for non-JSON payloads
  }

  let lastError = "unknown error";

  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const upstream = await fetch(UPSTREAM, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
      });

      if (upstream.status === 503 || upstream.status === 429) {
        lastError = `upstream status ${upstream.status}`;
        await new Promise((resolve) => setTimeout(resolve, 300));
        continue;
      }

      const text = await upstream.text();
      let responseJson: {
        error?: { message?: string };
        result?: { sequence?: number };
      } | null = null;
      try {
        responseJson = JSON.parse(text);
      } catch {
        // Not JSON
      }

      // Check if we hit a lagging node with getEvents / getTransaction
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

      if (isGetLatestLedger && responseJson?.result?.sequence != null) {
        const seq = Number(responseJson.result.sequence);
        if (seq < globalMaxLedger && attempt < 5) {
          // Lagging node for getLatestLedger, retry to get an up-to-date node
          lastError = `lagging getLatestLedger: got ${seq}, expected >= ${globalMaxLedger}`;
          console.warn(
            `[RPC Proxy] Lagging ledger detected: got ${seq}, expected >= ${globalMaxLedger} (attempt ${
              attempt + 1
            }). Retrying...`,
          );
          await new Promise((resolve) => setTimeout(resolve, 200));
          continue;
        }
        // Update the maximum ledger seen
        if (seq > globalMaxLedger) {
          globalMaxLedger = seq;
        }
        // Force the returned ledger sequence to be at least globalMaxLedger
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
