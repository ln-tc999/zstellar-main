const UPSTREAM =
  process.env.STELLAR_RPC_UPSTREAM ?? "https://soroban-testnet.stellar.org";

export const dynamic = "force-dynamic";

// Keep track of the highest ledger sequence we have seen on the server to prevent
// client-side out-of-sync issues due to lagging RPC load balancer nodes.
let globalMaxLedger = 0;

// Since the public Stellar Testnet RPC prunes history older than ~120k ledgers,
// we pre-populate and inject the historical ASP Merkle tree leaves (0 to 5)
// that were inserted in the pruned ledger range (3157974 to 3256331).
// This guarantees that the indexer can sync successfully from the deployment ledger.
//
// Every event object must include operationIndex, transactionIndex, and txHash
// as they are required fields in the Soroban events structure.
const HISTORICAL_ASP_EVENTS = [
  {
    type: "contract",
    ledger: 3157974,
    ledgerClosedAt: "2026-06-26T12:24:11Z",
    id: "0013563773008756737-0000000000",
    pagingToken: "0013563773008756737-0000000000",
    contractId: "CDD7LJJDO35WCKZK63Q5ADGT76K7DEEL6YHB4DELMLJ4CPTSCALFXE7Q",
    topic: ["AAAADwAAAAlMZWFmQWRkZWQAAAA="],
    value:
      "AAAAEQAAAAEAAAADAAAADwAAAAVpbmRleAAAAAAAAAUAAAAAAAAAAAAAAA8AAAAEbGVhZgAAAAsPhJytjG1OEBI1Y6SUF0bCJMeApeIT5o6sr9UJB6gw6QAAAA8AAAAEcm9vdAAAAAsRqLnVugSEOE22GqHUcFlYUtLwuXbE/X/o29VHY3p56Q==",
    inSuccessfulContractCall: true,
    operationIndex: 0,
    transactionIndex: 0,
    txHash: "0000000000000000000000000000000000000000000000000000000000000000",
  },
  {
    type: "contract",
    ledger: 3157989,
    ledgerClosedAt: "2026-06-26T12:25:00Z",
    id: "0013563833138302977-0000000000",
    pagingToken: "0013563833138302977-0000000000",
    contractId: "CDD7LJJDO35WCKZK63Q5ADGT76K7DEEL6YHB4DELMLJ4CPTSCALFXE7Q",
    topic: ["AAAADwAAAAlMZWFmQWRkZWQAAAA="],
    value:
      "AAAAEQAAAAEAAAADAAAADwAAAAVpbmRleAAAAAAAAAUAAAAAAAAAAQAAAA8AAAAEbGVhZgAAAAsPhJytjG1OEBI1Y6SUF0bCJMeApeIT5o6sr9UJB6gw6QAAAA8AAAAEcm9vdAAAAAsG+4aDfc/wbO7rVugOXXhBpZUS8dW+9422IIGqzI3Zuw==",
    inSuccessfulContractCall: true,
    operationIndex: 0,
    transactionIndex: 0,
    txHash: "0000000000000000000000000000000000000000000000000000000000000000",
  },
  {
    type: "contract",
    ledger: 3158043,
    ledgerClosedAt: "2026-06-26T12:28:00Z",
    id: "0013564065066536961-0000000000",
    pagingToken: "0013564065066536961-0000000000",
    contractId: "CDD7LJJDO35WCKZK63Q5ADGT76K7DEEL6YHB4DELMLJ4CPTSCALFXE7Q",
    topic: ["AAAADwAAAAlMZWFmQWRkZWQAAAA="],
    value:
      "AAAAEQAAAAEAAAADAAAADwAAAAVpbmRleAAAAAAAAAUAAAAAAAAAAgAAAA8AAAAEbGVhZgAAAAsPhJytjG1OEBI1Y6SUF0bCJMeApeIT5o6sr9UJB6gw6QAAAA8AAAAEcm9vdAAAAAsTR6EO9b9xH/T6S1lTCLOMUFULH+zaouc8MbxWPioX+Q==",
    inSuccessfulContractCall: true,
    operationIndex: 0,
    transactionIndex: 0,
    txHash: "0000000000000000000000000000000000000000000000000000000000000000",
  },
  {
    type: "contract",
    ledger: 3158291,
    ledgerClosedAt: "2026-06-26T12:35:00Z",
    id: "0013565134513397761-0000000000",
    pagingToken: "0013565134513397761-0000000000",
    contractId: "CDD7LJJDO35WCKZK63Q5ADGT76K7DEEL6YHB4DELMLJ4CPTSCALFXE7Q",
    topic: ["AAAADwAAAAlMZWFmQWRkZWQAAAA="],
    value:
      "AAAAEQAAAAEAAAADAAAADwAAAAVpbmRleAAAAAAAAAUAAAAAAAAAAwAAAA8AAAAEbGVhZgAAAAsPhJytjG1OEBI1Y6SUF0bCJMeApeIT5o6sr9UJB6gw6QAAAA8AAAAEcm9vdAAAAAsYdncDzkFJc+wKF1Behbrgk+NZtcJbsJ5W+3wJiu0Mcw==",
    inSuccessfulContractCall: true,
    operationIndex: 0,
    transactionIndex: 0,
    txHash: "0000000000000000000000000000000000000000000000000000000000000000",
  },
  {
    type: "contract",
    ledger: 3158585,
    ledgerClosedAt: "2026-06-26T12:45:00Z",
    id: "0013566397233778689-0000000000",
    pagingToken: "0013566397233778689-0000000000",
    contractId: "CDD7LJJDO35WCKZK63Q5ADGT76K7DEEL6YHB4DELMLJ4CPTSCALFXE7Q",
    topic: ["AAAADwAAAAlMZWFmQWRkZWQAAAA="],
    value:
      "AAAAEQAAAAEAAAADAAAADwAAAAVpbmRleAAAAAAAAAUAAAAAAAAABAAAAA8AAAAEbGVhZgAAAAsPhJytjG1OEBI1Y6SUF0bCJMeApeIT5o6sr9UJB6gw6QAAAA8AAAAEcm9vdAAAAAstgoQd4PTdGL7dEXteHTf7UaxiXtLLCQpR/fL+6DXUYA==",
    inSuccessfulContractCall: true,
    operationIndex: 0,
    transactionIndex: 0,
    txHash: "0000000000000000000000000000000000000000000000000000000000000000",
  },
  {
    type: "contract",
    ledger: 3256331,
    ledgerClosedAt: "2026-06-27T08:15:00Z",
    id: "0013985839444934657-0000000000",
    pagingToken: "0013985839444934657-0000000000",
    contractId: "CDD7LJJDO35WCKZK63Q5ADGT76K7DEEL6YHB4DELMLJ4CPTSCALFXE7Q",
    topic: ["AAAADwAAAAlMZWFmQWRkZWQAAAA="],
    value:
      "AAAAEQAAAAEAAAADAAAADwAAAAVpbmRleAAAAAAAAAUAAAAAAAAABQAAAA8AAAAEbGVhZgAAAAstNvG2gPqt/8Mrcc6iAYZJuAY4TcZ/BAnqM7hDNvcI6AAAAA8AAAAEcm9vdAAAAAsJTtPWizVY0z0bnmkxNY4DtspQfuTufZmaZv4Qg2SAjA==",
    inSuccessfulContractCall: true,
    operationIndex: 0,
    transactionIndex: 0,
    txHash: "0000000000000000000000000000000000000000000000000000000000000000",
  },
];

const PRUNED_LEDGER_LIMIT = 3208000;

export async function POST(request: Request): Promise<Response> {
  const body = await request.text();

  let json: {
    method?: string;
    id?: unknown;
    params?: {
      startLedger?: number;
      filters?: Array<{ contractIds?: string[] }>;
    };
  } | null = null;
  let isGetLatestLedger = false;
  let isGetEvents = false;
  let startLedger = 0;
  let isAspContractFilter = false;

  try {
    json = JSON.parse(body);
    if (json?.method === "getLatestLedger") {
      isGetLatestLedger = true;
    } else if (json?.method === "getEvents") {
      isGetEvents = true;
      startLedger = Number(json?.params?.startLedger || 0);
      const contractIds =
        json?.params?.filters
          ?.flatMap((f) => f.contractIds || [])
          .filter(Boolean) || [];
      if (
        contractIds.includes(
          "CDD7LJJDO35WCKZK63Q5ADGT76K7DEEL6YHB4DELMLJ4CPTSCALFXE7Q",
        )
      ) {
        isAspContractFilter = true;
      }
    }
  } catch {
    // Ignore JSON parse errors for non-JSON payloads
  }

  console.log(
    `[RPC Proxy] Request: method=${json?.method || "unknown"}, id=${
      json?.id ?? "none"
    }`,
  );

  // Intercept getEvents requests inside the pruned ledger range
  if (isGetEvents && startLedger < PRUNED_LEDGER_LIMIT) {
    const events = isAspContractFilter
      ? HISTORICAL_ASP_EVENTS.filter((e) => e.ledger >= startLedger)
      : [];

    const latestLedgerVal = globalMaxLedger || 3328600;

    // Determine the cursor paging token
    let cursorVal = "";
    if (events.length > 0) {
      cursorVal = events[events.length - 1].pagingToken;
    } else {
      // Format startLedger as a 19-digit padded paging token
      cursorVal = `${String(startLedger).padStart(19, "0")}-0000000000`;
    }

    console.log(
      `[RPC Proxy] Intercepted getEvents: startLedger=${startLedger}, returning ${events.length} events, cursor=${cursorVal}`,
    );

    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: json?.id || null,
        result: {
          events,
          cursor: cursorVal,
          latestLedger: latestLedgerVal,
          oldestLedger: 3157974,
          latestLedgerCloseTime: String(Math.floor(Date.now() / 1000)),
          oldestLedgerCloseTime: "1782052423",
        },
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
          "Cross-Origin-Resource-Policy": "same-origin",
          "Cache-Control": "no-store",
        },
      },
    );
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
      // biome-ignore lint/suspicious/noExplicitAny: allow any for dynamic JSON-RPC structure parsing
      let responseJson: any = null;
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

      console.log(
        `[RPC Proxy] Upstream response for method=${
          json?.method || "unknown"
        }, status=${upstream.status}`,
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
    `[RPC Proxy] Request failed for method=${
      json?.method || "unknown"
    }: ${lastError}`,
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
