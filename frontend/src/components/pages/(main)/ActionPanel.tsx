"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  TbChevronDown,
  TbExternalLink,
  TbSearch,
  TbShieldLock,
  TbX,
} from "react-icons/tb";
import {
  depositWithAutoRegister,
  getShieldedBalance,
  type StatusUpdate,
  stroopsToXlm,
  transfer,
  withdraw,
} from "@/engine";
import { useWalletContext } from "@/features/wallet";
import { TxModal, type TxPhase } from "./TxModal";

const TABS = [
  {
    id: "deposit",
    label: "Shield",
    lead: "You're shielding",
    cta: "Shield",
    hint: "Public asset in, private notes out. Your in-pool balance stays hidden.",
  },
  {
    id: "transfer",
    label: "Private Transfer",
    lead: "You're transferring privately",
    cta: "Send privately",
    hint: "Amount and recipient stay hidden on-chain.",
  },
  {
    id: "withdraw",
    label: "Private Withdraw",
    lead: "You're withdrawing privately",
    cta: "Withdraw",
    hint: "Spend private notes to a public address. The link stays hidden.",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

const TECH = ["Groth16", "BN254", "Poseidon2"];

const RELAYER_ADDRESS = process.env.NEXT_PUBLIC_RELAYER_ADDRESS ?? "";
const RELAYER_READY = RELAYER_ADDRESS.length > 0;

function formatXlm(raw: string): string {
  const value = Number(raw);
  return Number.isFinite(value)
    ? value.toLocaleString("en-US", { maximumFractionDigits: 4 })
    : "0";
}

const TOKENS = [
  {
    symbol: "XLM",
    name: "Stellar Lumens",
    logo: "/Assets/Images/Logo-Coin/stellar-logo.svg",
    imgClass: "invert",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    logo: "/Assets/Images/Logo-Coin/usdc-logo.svg",
    imgClass: "",
  },
] as const;

export function ActionPanel() {
  const [active, setActive] = useState<TabId>("deposit");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [assetIndex, setAssetIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [shielded, setShielded] = useState<bigint | null>(null);
  const [phase, setPhase] = useState<TxPhase | null>(null);
  const [stage, setStage] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const wallet = useWalletContext();

  const asset = TOKENS[assetIndex];
  const filteredTokens = TOKENS.filter((token) => {
    const q = query.trim().toLowerCase();
    return (
      !q ||
      token.symbol.toLowerCase().includes(q) ||
      token.name.toLowerCase().includes(q)
    );
  });
  const connected = Boolean(wallet.address);
  const balance = wallet.balance ?? "0.00";
  const tab = TABS.find((item) => item.id === active) ?? TABS[0];
  const showRecipient = active !== "deposit";
  const recipientLabel =
    active === "transfer"
      ? "Recipient's shielded address (from their Receive)"
      : "Recipient Stellar address (G...)";

  useEffect(() => {
    const address = wallet.address;
    if (!address) {
      setShielded(null);
      return;
    }
    let cancelled = false;
    getShieldedBalance(address).then((value) => {
      if (!cancelled) setShielded(value);
    });
    return () => {
      cancelled = true;
    };
  }, [wallet.address]);

  const onStatus = (update: StatusUpdate) => {
    setStage(update.stage);
    setStatus(update.message);
  };

  const refreshShielded = async () => {
    const address = wallet.address;
    if (!address) return;
    let first: bigint | null = null;
    for (let i = 0; i < 10; i++) {
      const value = await getShieldedBalance(address);
      setShielded(value);
      if (first === null) first = value;
      else if (value !== first) return;
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  };

  const runAction = async () => {
    if (!wallet.address || busy) return;
    setBusy(true);
    setTxHash(null);
    setErrorMsg(null);
    setStage("");
    setStatus("Preparing...");
    setPhase("running");
    try {
      const relayed = active !== "deposit" && RELAYER_READY;

      let hashes: string[] | null = null;
      if (active === "deposit") {
        hashes = await depositWithAutoRegister(wallet.address, amount, onStatus);
      } else if (active === "transfer") {
        const [noteKey, encKey] = recipient.split(":");
        if (!noteKey || !encKey) {
          throw new Error(
            "Enter the recipient's shielded address (copy it from their Receive button).",
          );
        }
        hashes = await transfer(
          wallet.address,
          amount,
          noteKey.trim(),
          encKey.trim(),
          onStatus,
          relayed,
        );
      } else {
        if (!recipient.trim()) throw new Error("Enter a recipient address");
        hashes = await withdraw(
          wallet.address,
          recipient.trim(),
          amount,
          onStatus,
          relayed,
        );
      }

      if (Array.isArray(hashes) && hashes.length > 0) {
        setTxHash(hashes[hashes.length - 1]);
        setStatus("Done.");
        setPhase("success");
        await wallet.refresh();
        void refreshShielded();
      } else {
        setErrorMsg(
          "No transaction was produced. The pool could not be synced or your account is not yet in the ASP membership set. Try again in a few seconds.",
        );
        setPhase("error");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Action failed";
      setStatus(message);
      setErrorMsg(message);
      setPhase("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="action" className="w-full max-w-[560px]">
      <div className="mb-6 flex items-center justify-center gap-1">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item.id)}
            className={`cursor-pointer rounded-full px-5 py-2 text-[15px] font-medium transition-colors ${
              active === item.id
                ? "bg-white/10 text-white"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="relative z-30 rounded-2xl border border-white/10 bg-zinc-900/85 p-6 shadow-2xl shadow-black/50">
        <p className="text-[15px] font-semibold text-white">{tab.lead}</p>

        <div className="mt-2 flex items-center justify-between gap-4">
          <input
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-full bg-transparent text-5xl font-medium tracking-tight text-white outline-none placeholder:text-zinc-500"
          />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/10 py-1.5 pl-1.5 pr-3 text-[15px] font-bold text-white transition-colors hover:bg-white/15"
          >
            <Image
              src={asset.logo}
              alt={asset.symbol}
              width={28}
              height={28}
              className={`h-7 w-7 object-contain ${asset.imgClass}`}
            />
            {asset.symbol}
            <TbChevronDown className="h-4 w-4 text-zinc-400" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-sm text-zinc-400">
          <span className="hidden items-center gap-1.5 sm:flex">
            <Image
              src="/Assets/Images/Logo-Brands/zStellar-logo.png"
              alt="zStellar"
              width={16}
              height={16}
              className="h-4 w-4 rounded object-contain"
            />
            <span className="text-[11px] text-zinc-500">powered by</span>
            {TECH.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-400"
              >
                {item}
              </span>
            ))}
          </span>
          <span className="whitespace-nowrap">
            Balance: {formatXlm(balance)} XLM
            <span className="px-1">·</span>
            <button
              type="button"
              onClick={() => setAmount(String(Number(balance) || 0))}
              className="cursor-pointer font-medium text-white"
            >
              Max
            </button>
          </span>
        </div>

        {showRecipient ? (
          <input
            placeholder={recipientLabel}
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white/30"
          />
        ) : null}

        {showRecipient && RELAYER_READY ? (
          <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-medium text-white">
                <TbShieldLock className="h-4 w-4 text-emerald-400" />
                Private relay active
              </span>
              <span className="font-mono text-xs text-zinc-400">
                {RELAYER_ADDRESS.slice(0, 6)}...{RELAYER_ADDRESS.slice(-6)}
              </span>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-zinc-500">
              Our relayer submits on-chain, so your address never appears. You
              sign nothing and pay no fee for submission.
            </p>
          </div>
        ) : showRecipient ? (
          <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <p className="text-[11px] leading-5 text-amber-300/80">
              Relayer not set up. Run{" "}
              <span className="font-mono">scripts/setup-relayer.mjs</span> so your
              address stays hidden on submit.
            </p>
          </div>
        ) : null}
      </div>

      <div className="relative z-10 mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/85 px-6 py-4 text-[15px] shadow-2xl shadow-black/50">
        <span className="flex items-center gap-2 text-zinc-400">
          <Image
            src="/Assets/Images/Logo-Brands/zStellar-logo.png"
            alt="zStellar"
            width={20}
            height={20}
            className="h-5 w-5 rounded object-contain"
          />
          Shielded Balance
        </span>
        <span className="flex items-center gap-2 font-semibold text-white">
          {shielded != null ? formatXlm(stroopsToXlm(shielded)) : "0"} XLM
          <Image
            src="/Assets/Images/Logo-Coin/stellar-logo.svg"
            alt="XLM"
            width={16}
            height={16}
            className="h-4 w-4 object-contain invert"
          />
        </span>
      </div>

      {connected ? (
        <button
          type="button"
          onClick={runAction}
          disabled={busy}
          className="mt-4 flex h-15 w-full cursor-pointer items-center justify-center rounded-full bg-white text-lg font-semibold text-black transition-colors hover:bg-zinc-200 disabled:opacity-70"
        >
          {busy ? "Working..." : tab.cta}
        </button>
      ) : (
        <button
          type="button"
          onClick={wallet.connect}
          disabled={wallet.connecting}
          className="mt-4 flex h-15 w-full cursor-pointer items-center justify-center rounded-full bg-white text-lg font-semibold text-black transition-colors hover:bg-zinc-200 disabled:opacity-70"
        >
          {wallet.connecting ? "Connecting..." : "Connect Wallet"}
        </button>
      )}

      {wallet.error ? (
        <p className="mt-3 text-center text-xs text-red-400">{wallet.error}</p>
      ) : connected ? (
        txHash ? (
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-1 text-center text-xs text-zinc-300 transition-colors hover:text-white"
          >
            View transaction
            <TbExternalLink className="h-3 w-3" />
          </a>
        ) : status ? (
          <p className="mt-3 text-center text-xs text-zinc-400">{status}</p>
        ) : null
      ) : (
        <p className="mt-4 text-center text-xs text-zinc-400">{tab.hint}</p>
      )}

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/60"
            >
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="text-lg font-semibold text-white">Select</h2>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="cursor-pointer text-zinc-400 transition-colors hover:text-white"
                >
                  <TbX className="h-5 w-5" />
                </button>
              </div>

              <div className="px-5 pb-4">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 focus-within:border-white/30">
                  <TbSearch className="h-4 w-4 text-zinc-500" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by token symbol or name"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                  />
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto px-2 pb-3">
                {filteredTokens.map((token) => (
                  <button
                    key={token.symbol}
                    type="button"
                    onClick={() => {
                      setAssetIndex(TOKENS.indexOf(token));
                      setMenuOpen(false);
                      setQuery("");
                    }}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-white/5"
                  >
                    <span className="flex items-center gap-3">
                      <Image
                        src={token.logo}
                        alt={token.symbol}
                        width={36}
                        height={36}
                        className={`h-9 w-9 object-contain ${token.imgClass}`}
                      />
                      <span className="flex flex-col">
                        <span className="text-[15px] font-semibold text-white">
                          {token.symbol}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {token.name}
                        </span>
                      </span>
                    </span>
                    <span className="flex flex-col items-end">
                      <span className="text-[15px] font-medium text-white">
                        {token.symbol === "XLM" ? formatXlm(balance) : "0"}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {token.symbol === "XLM" && connected ? "Testnet" : "--"}
                      </span>
                    </span>
                  </button>
                ))}
                {filteredTokens.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-zinc-500">
                    No tokens found.
                  </p>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <TxModal
        phase={phase}
        title={tab.label}
        stage={stage}
        message={status}
        txHash={txHash}
        error={errorMsg}
        onClose={() => setPhase(null)}
      />
    </section>
  );
}
