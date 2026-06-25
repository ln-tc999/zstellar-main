import {
  BASE_FEE,
  Contract,
  Horizon,
  rpc,
  scValToNative,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { browserRpcUrl, CONTRACTS, STELLAR } from "./config";

const rpcUrl = browserRpcUrl();
export const server = new rpc.Server(rpcUrl, {
  allowHttp: rpcUrl.startsWith("http://"),
});
export const horizon = new Horizon.Server(STELLAR.horizonUrl);

export async function getLatestLedger() {
  return server.getLatestLedger();
}

export async function getPoolRoot(): Promise<bigint | null> {
  const account = await server.getAccount(CONTRACTS.deployer);
  const contract = new Contract(CONTRACTS.pool);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR.networkPassphrase,
  })
    .addOperation(contract.call("get_root"))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim) || !sim.result) return null;
  return scValToNative(sim.result.retval) as bigint;
}

export async function fundWithFriendbot(address: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`,
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function getXlmBalance(address: string): Promise<string> {
  try {
    const account = await horizon.loadAccount(address);
    const native = account.balances.find((b) => b.asset_type === "native");
    return native?.balance ?? "0";
  } catch {
    return "0";
  }
}
