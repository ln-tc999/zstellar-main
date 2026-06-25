const UPSTREAM =
  process.env.STELLAR_RPC_UPSTREAM ?? "https://soroban-testnet.stellar.org";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const body = await request.text();

  let lastError = "unknown error";
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const upstream = await fetch(UPSTREAM, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
      });
      const text = await upstream.text();
      if (upstream.status === 503 || upstream.status === 429) {
        lastError = `upstream ${upstream.status}`;
        await new Promise((resolve) => setTimeout(resolve, 600));
        continue;
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
      await new Promise((resolve) => setTimeout(resolve, 600));
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
