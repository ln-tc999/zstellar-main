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
  pool: "CCQVW6Z3H2G5T4SZXW6MYQQZWNLTRGJCCLHJLVXR6N7M2E3LPVY3CY2N",
  verifier: "CDMMDEFM6T44GYK2AFOQF6FMVJPAJYXUJJA3CIPNYRRJPN3M35662S53",
  aspMembership: "CBEVWMLPG5H36VW5OSDI7RATOHANKN2LBLNHHBTUP33ZHLIZRPAK2365",
  aspNonMembership: "CACMAMCL7JNTE5R64P67KXCFBH2QA73JI2UEIWHJUEO4NVBGBBK3G3TC",
  token: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
  deployer: "GBVYJ2OZFBHEV7TNFY45V4VLZVV747RCI42C7FHDZBW2MYU5KLYGYQQO",
} as const;
