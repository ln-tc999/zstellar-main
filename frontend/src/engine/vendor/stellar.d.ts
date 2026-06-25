import type { OnStatus, SorobanTx } from "../types";

export function submitPreparedSorobanTx(
  prepared: SorobanTx,
  ctx: { address: string; rpcUrl: string; networkPassphrase: string },
  opts?: { onStatus?: OnStatus },
): Promise<string>;
