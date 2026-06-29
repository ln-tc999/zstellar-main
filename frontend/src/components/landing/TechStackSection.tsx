"use client";

import type { IconType } from "react-icons";
import {
  TbChevronRight,
  TbCpu,
  TbDeviceDesktop,
  TbRosetteDiscountCheck,
  TbRouter,
  TbStack2,
} from "react-icons/tb";
import { CONTRACTS } from "@/lib/stellar/config";
import { Reveal } from "./Reveal";

const PIPELINE: { icon: IconType; title: string; sub: string }[] = [
  { icon: TbDeviceDesktop, title: "Browser", sub: "Derive keys, build inputs" },
  { icon: TbCpu, title: "WASM prover", sub: "Groth16 · Poseidon2 · BN254" },
  { icon: TbRouter, title: "Submitter", sub: "Wallet (shield) / relayer" },
  { icon: TbStack2, title: "Pool.transact", sub: "Spend nullifier / add note" },
  {
    icon: TbRosetteDiscountCheck,
    title: "Verifier",
    sub: "On-chain Groth16 gate",
  },
];

const STACK: { group: string; items: string[] }[] = [
  {
    group: "Frontend",
    items: ["Next.js 16", "React 19", "TypeScript", "Tailwind v4"],
  },
  {
    group: "Zero-knowledge",
    items: ["Groth16 (arkworks)", "Circom", "Poseidon2", "BN254"],
  },
  {
    group: "Prover runtime",
    items: ["Rust → WASM", "Web Workers", "OPFS SQLite"],
  },
  {
    group: "Stellar",
    items: ["Soroban (Testnet)", "stellar-sdk v14", "Freighter"],
  },
  {
    group: "Relay",
    items: ["Next.js Route Handler", "Stellar Keypair", "Soroban RPC"],
  },
  {
    group: "Motion",
    items: ["framer-motion", "Lenis", "ogl"],
  },
];

const CONTRACT_LIST: { label: string; id: string }[] = [
  { label: "Pool", id: CONTRACTS.pool },
  { label: "Groth16 Verifier", id: CONTRACTS.verifier },
  { label: "ASP Membership", id: CONTRACTS.aspMembership },
  { label: "ASP Non-Membership", id: CONTRACTS.aspNonMembership },
  { label: "Token (XLM SAC)", id: CONTRACTS.token },
];

function shorten(id: string): string {
  return `${id.slice(0, 6)}…${id.slice(-6)}`;
}

export function TechStackSection() {
  return (
    <section
      id="stack"
      className="relative mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-24 sm:py-32"
    >
      <Reveal className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-faint">
          Tech &amp; architecture
        </p>
        <h2 className="mt-4 text-3xl font-medium leading-tight tracking-tight text-fg sm:text-5xl">
          Built on Soroban,
          <br className="hidden sm:block" /> proven in the browser.
        </h2>
        <p className="mt-4 text-base leading-7 text-muted">
          Secrets never leave the device. The proof and the value bound to it
          are verified by a Stellar contract before anything settles.
        </p>
      </Reveal>

      {/* Pipeline */}
      <Reveal delay={0.05} className="mt-12">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-2xl shadow-[color:var(--shadow)] backdrop-blur-sm sm:p-7">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
            {PIPELINE.map((node, index) => (
              <div
                key={node.title}
                className="flex min-w-0 items-center gap-3 lg:flex-1"
              >
                <div className="flex w-full items-center gap-3 rounded-xl border border-line bg-fill px-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-btn text-btn-fg">
                    <node.icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-semibold tracking-tight text-fg">
                      {node.title}
                    </span>
                    <span className="truncate text-[11px] text-faint">
                      {node.sub}
                    </span>
                  </span>
                </div>
                {index < PIPELINE.length - 1 ? (
                  <TbChevronRight className="hidden h-5 w-5 shrink-0 text-faint lg:block" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Stack */}
        <Reveal delay={0.05}>
          <div className="h-full rounded-2xl border border-line bg-surface p-6 shadow-2xl shadow-[color:var(--shadow)] backdrop-blur-sm sm:p-7">
            <h3 className="text-lg font-semibold tracking-tight text-fg">
              Tech stack
            </h3>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {STACK.map((group) => (
                <div key={group.group}>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
                    {group.group}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-line bg-fill px-2.5 py-1 text-[12px] text-muted"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Contracts */}
        <Reveal delay={0.12}>
          <div className="h-full rounded-2xl border border-line bg-surface p-6 shadow-2xl shadow-[color:var(--shadow)] backdrop-blur-sm sm:p-7">
            <h3 className="text-lg font-semibold tracking-tight text-fg">
              Deployed on Testnet
            </h3>
            <p className="mt-1 text-sm text-muted">
              Soroban contracts the app talks to.
            </p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {CONTRACT_LIST.map((contract) => (
                <li
                  key={contract.label}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-fill px-3.5 py-2.5"
                >
                  <span className="text-sm text-fg">{contract.label}</span>
                  <a
                    href={`https://stellar.expert/explorer/testnet/contract/${contract.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[12px] text-muted transition-colors hover:text-fg"
                  >
                    {shorten(contract.id)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
