"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { TbCopy, TbDownload, TbX } from "react-icons/tb";
import { getMyShieldedAddress } from "@/engine";
import { useWalletContext } from "./WalletProvider";

export function ReceiveButton() {
  const wallet = useWalletContext();
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!wallet.address) {
      setError("Connect your wallet first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setAddress(await getMyShieldedAddress(wallet.address));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to derive address");
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setCopied(false);
    setOpen(true);
    if (!address) void load();
  };

  const copy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="flex h-10 cursor-pointer items-center gap-2 rounded-full border border-line-strong px-4 text-sm font-medium text-fg transition-colors hover:bg-fill"
      >
        <TbDownload className="h-4 w-4" />
        Receive
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-line bg-panel p-6 shadow-2xl shadow-[color:var(--shadow)]"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-fg">
                  Your shielded address
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="cursor-pointer text-muted transition-colors hover:text-fg"
                >
                  <TbX className="h-5 w-5" />
                </button>
              </div>

              <p className="mt-3 text-sm leading-6 text-muted">
                Share this with a sender so they can transfer to you privately.
                It is your note key and encryption key, not your public Stellar
                address.
              </p>

              <div className="mt-4 break-all rounded-xl border border-line bg-fill px-4 py-3 font-mono text-xs text-muted">
                {loading
                  ? "Deriving..."
                  : (error ?? address ?? "Connect your wallet to view.")}
              </div>

              <button
                type="button"
                onClick={copy}
                disabled={!address}
                className="mt-4 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-btn text-sm font-semibold text-btn-fg transition-colors hover:bg-btn-hover disabled:opacity-60"
              >
                <TbCopy className="h-4 w-4" />
                {copied ? "Copied" : "Copy address"}
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
