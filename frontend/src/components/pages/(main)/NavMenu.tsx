"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { TbMenu2, TbX } from "react-icons/tb";
import { ThemeToggle } from "@/features/theme";
import { FaucetButton, ReceiveButton } from "@/features/wallet";

// Collapses Receive / Faucet / theme toggle behind a hamburger. Opens on hover
// or click; the items expand (max-width) and slide in to the left of the button
// for a smooth drawer-along-the-navbar feel.
export function NavMenu() {
  const [open, setOpen] = useState(false);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover only enhances the fully click/keyboard-accessible button below
    <div
      className="relative flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="menu"
            initial={{ maxWidth: 0, opacity: 0 }}
            animate={{ maxWidth: 480, opacity: 1 }}
            exit={{ maxWidth: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center overflow-hidden"
          >
            <div className="flex items-center gap-3 pr-3">
              <ReceiveButton />
              <FaucetButton />
              <ThemeToggle />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line-strong text-fg transition-colors hover:bg-fill"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "open"}
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            {open ? (
              <TbX className="h-[18px] w-[18px]" />
            ) : (
              <TbMenu2 className="h-[18px] w-[18px]" />
            )}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}
