"use client";

import type { IconType } from "react-icons";
import {
  TbArrowsExchange,
  TbCpu,
  TbServerBolt,
  TbShieldCheck,
  TbStack2,
  TbUsers,
} from "react-icons/tb";
import { Reveal } from "./Reveal";

const FEATURES: { icon: IconType; title: string; body: string }[] = [
  {
    icon: TbCpu,
    title: "Client-side Groth16 proving",
    body: "Every proof is built in your browser by a Rust→WASM prover (arkworks ark-groth16 / ark-circom). Secret note keys, amounts, and blindings never leave the device.",
  },
  {
    icon: TbStack2,
    title: "Shielded note pool",
    body: "Deposits create note commitments in an on-chain Merkle tree. Spending a note reveals only a nullifier — never the amount or the owner. Your balance is the sum of your unspent notes.",
  },
  {
    icon: TbArrowsExchange,
    title: "Three flows, one entrypoint",
    body: "Shield, Private Transfer, and Private Withdraw all route through one transact(proof, ext_data, sender) call. Only the signed ext_amount and who submits differ.",
  },
  {
    icon: TbShieldCheck,
    title: "On-chain verification",
    body: "A dedicated Groth16 verifier contract checks the proof over BN254 on Stellar. ext_data is bound to the proof, so amounts and recipients can't be tampered with after proving.",
  },
  {
    icon: TbUsers,
    title: "ASP membership",
    body: "An Association Set Provider keeps a Merkle tree of approved deposits. Honest users prove membership without revealing which leaf is theirs — a compliance-friendly anonymity set.",
  },
  {
    icon: TbServerBolt,
    title: "Always-on private relay",
    body: "Private transfers and withdrawals are submitted by a server-side relayer keypair. You sign nothing for submission, pay no fee, and never appear as the on-chain source.",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-24 sm:py-32"
    >
      <Reveal className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-faint">
          Features
        </p>
        <h2 className="mt-4 text-3xl font-medium leading-tight tracking-tight text-fg sm:text-5xl">
          Privacy that proves itself,
          <br className="hidden sm:block" /> not just hides.
        </h2>
        <p className="mt-4 text-base leading-7 text-muted">
          Six primitives on the Soroban stack turn a transparent ledger into a
          private one — without ever taking custody of your funds.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, index) => (
          <Reveal key={feature.title} delay={(index % 3) * 0.08}>
            <div className="h-full rounded-2xl border border-line bg-surface p-6 shadow-2xl shadow-[color:var(--shadow)] backdrop-blur-sm transition-colors hover:bg-fill">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-fill text-fg">
                <feature.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-fg">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {feature.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
