// Use Edge Runtime: no cold starts, globally distributed, instant response.
// This is a pure passthrough proxy to the Stellar Soroban RPC — no state, no Node.js deps.
export const runtime = "edge";
export const dynamic = "force-dynamic";

const UPSTREAM =
  process.env.STELLAR_RPC_UPSTREAM ?? "https://soroban-testnet.stellar.org";

const CORS_HEADERS = {
  "content-type": "application/json",
  "Cross-Origin-Resource-Policy": "cross-origin",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "no-store",
};

export async function POST(request: Request): Promise<Response> {
  const body = await request.text();

  let method = "unknown";
  try {
    const j = JSON.parse(body);
    method = j?.method ?? "unknown";
  } catch {
    // non-JSON body — pass through anyway
  }

  let lastError = "upstream unreachable";

  for (let attempt = 0; attempt < 3; attempt++) {
    let upstream: Response;
    try {
      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), 9000);
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
      await delay(400);
      continue;
    }

    // Retry on transient server errors
    if (
      upstream.status === 429 ||
      upstream.status === 502 ||
      upstream.status === 503
    ) {
      lastError = `upstream HTTP ${upstream.status}`;
      await delay(400);
      continue;
    }

    const text = await upstream.text();

    // Retry if response is not valid JSON (e.g. XDR binary from a bad LB node)
    if (!looksLikeJson(text)) {
      lastError = "upstream returned non-JSON body";
      await delay(400);
      continue;
    }

    // Retry on known Stellar RPC transient errors
    if (
      text.includes("startLedger must be within the ledger range") ||
      text.includes("Please try again")
    ) {
      lastError = `stellar RPC transient error (attempt ${attempt + 1})`;
      await delay(400);
      continue;
    }

    return new Response(text, {
      status: upstream.status,
      headers: CORS_HEADERS,
    });
  }

  console.error(`[RPC Proxy] ${method} failed after 3 attempts: ${lastError}`);
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
