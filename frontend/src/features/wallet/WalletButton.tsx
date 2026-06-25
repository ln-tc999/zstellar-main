"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { TbChevronDown, TbLogout } from "react-icons/tb";
import { useWalletContext } from "./WalletProvider";

export function WalletButton() {
  const wallet = useWalletContext();
  const [open, setOpen] = useState(false);

  if (!wallet.address) {
    return (
      <button
        type="button"
        onClick={wallet.connect}
        disabled={wallet.connecting}
        className="flex h-10 cursor-pointer items-center rounded-full bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-zinc-200 disabled:opacity-70"
      >
        {wallet.connecting ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  const short = `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 cursor-pointer items-center gap-2 rounded-full border border-white/15 py-1 pl-1.5 pr-4 text-sm font-medium text-white transition-colors hover:bg-white/5"
      >
        <Image
          src="/Assets/Images/Logo-Brands/zStellar-logo.png"
          alt="zStellar"
          width={24}
          height={24}
          className="h-6 w-6 rounded-full object-contain"
        />
        {short}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18 }}
        >
          <TbChevronDown className="h-4 w-4 text-zinc-400" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-2 w-52 origin-top-right overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 p-1 shadow-2xl shadow-black/50"
          >
            <div className="px-3 py-2 text-xs text-zinc-500">
              Connected on testnet
            </div>
            <button
              type="button"
              onClick={() => {
                wallet.disconnect();
                setOpen(false);
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5"
            >
              <TbLogout className="h-4 w-4" />
              Disconnect Wallet
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
