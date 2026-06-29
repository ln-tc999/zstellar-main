import { IntroPage } from "@/components/landing/IntroPage";

export const metadata = {
  title: "zStellar — Shielded payments on Stellar",
  description:
    "Shield, pay, and withdraw on Stellar without revealing amounts or the sender → receiver link. Client-side zero-knowledge proofs, on-chain verification, relayer-submitted privacy.",
};

export default function Page() {
  return <IntroPage />;
}
