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
    return "/api/rpc";
  }
  return STELLAR.rpcUrl;
}

export const CONTRACTS = {
  pool: "CDQRALECG5P3RGPVZPNRCMUD4NYKDJDHZHZYXCVY3URFXDIZMAFVCS7U",
  verifier: "CDZCUT2SPJ6O7MMV7PAMWVEEURUIJL4VY7YK6VXMFRH3VJ7F2HEOYOZG",
  aspMembership: "CDD7LJJDO35WCKZK63Q5ADGT76K7DEEL6YHB4DELMLJ4CPTSCALFXE7Q",
  aspNonMembership: "CCZO4PIFRIZ7ZPXM6PLZYLP5POBDWRP245SVA54K542GHFBRI72FMVBB",
  token: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
  deployer: "GCWXHHOBERTQBNCQDK7B4LNUZH72CF7BLWP6XUL4KSRYOOCOIISSFBBT",
} as const;
