export function deriveKeysFromWallet(
  account: string,
  opts: {
    onStatus?: (message: string) => void;
    signOptions?: Record<string, unknown>;
    skipCacheCheck?: boolean;
  },
): Promise<{
  pubKey: string;
  encryptionKeypair: { publicKey: string };
  aspSecret: string;
}>;

export function connectWallet(): Promise<string>;
export function getWalletAddress(): Promise<string>;
export function getWalletNetwork(): Promise<{
  network: string;
  networkPassphrase: string;
  networkUrl: string;
  sorobanRpcUrl?: string;
}>;
