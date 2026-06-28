import { Networks } from "@stellar/stellar-sdk";

export const STELLAR = {
  network: "testnet",
  networkPassphrase: Networks.TESTNET,
  rpcUrl:
    process.env.NEXT_PUBLIC_STELLAR_RPC_URL ??
    "https://soroban-testnet.stellar.org",
  horizonUrl:
    process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL ??
    "https://horizon-testnet.stellar.org",
} as const;

export function browserRpcUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/rpc`;
  }
  return STELLAR.rpcUrl;
}

export const CONTRACTS = {
  pool: "CDUSKKK7CMZQPAEU534KKUBO2U5CZPK44VAICIU3ZCQZRALSVCCEU7K5",
  verifier: "CC3RGB5SSWJV4B6VZ2NVM5WF5O4PLNO5KWPVQNK5PLFBB7ODQECNNYBC",
  aspMembership: "CD57QBBGKB4IAFI4V6C4XPBLXDBMTZ242W7HBOVETUIK6AQW4KG6WDIV",
  aspNonMembership: "CDN63TA5J37TWY6KCL4ZVMOSOA77FYFMJRZ753WDHZPZXQC4NQPW7SVB",
  token: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
  deployer: "GBVYJ2OZFBHEV7TNFY45V4VLZVV747RCI42C7FHDZBW2MYU5KLYGYQQO",
} as const;
