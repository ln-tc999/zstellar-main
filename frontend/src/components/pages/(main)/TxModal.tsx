"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  TbAlertTriangle,
  TbCheck,
  TbCircleCheck,
  TbExternalLink,
  TbLoader2,
} from "react-icons/tb";

export type TxPhase = "running" | "success" | "error";

const STEPS = [
  {
    key: "prepare",
    label: "Preparing keys & membership",
    stages: ["keys", "register", "sync", "sync_wait"],
  },
  {
    key: "prove",
    label: "Generating ZK proof",
    stages: ["load_state", "prove", "compute", "witness"],
  },
  { key: "sign", label: "Sign in wallet", stages: ["sign_auth", "sign_tx"] },
  { key: "submit", label: "Submitting on-chain", stages: ["submit", "confirm"] },
] as const;

function activeStep(stage: string): number {
  const index = STEPS.findIndex((step) =>
    step.stages.some((value) => stage.includes(value)),
  );
  return index === -1 ? 0 : index;
}

type Props = {
  phase: TxPhase | null;
  title: string;
  stage: string;
  message: string | null;
  txHash: string | null;
  error: string | null;
  onClose: () => void;
};

export function TxModal({
  phase,
  title,
  stage,
  message,
  txHash,
  error,
  onClose,
}: Props) {
  const active = activeStep(stage);

  return (
    <AnimatePresence>
      {phase ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={phase === "running" ? undefined : onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl shadow-black/60"
          >
            {phase === "running" ? (
              <div>
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                <div className="mt-5 flex flex-col gap-4">
                  {STEPS.map((step, index) => {
                    const done = index < active;
                    const current = index === active;
                    return (
                      <div key={step.key} className="flex items-center gap-3">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                            done
                              ? "border-white bg-white text-black"
                              : current
                                ? "border-white text-white"
                                : "border-white/15 text-zinc-600"
                          }`}
                        >
                          {done ? (
                            <TbCheck className="h-4 w-4" />
                          ) : current ? (
                            <TbLoader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            index + 1
                          )}
                        </span>
                        <div className="flex min-w-0 flex-col">
                          <span
                            className={`text-sm ${
                              current || done ? "text-white" : "text-zinc-500"
                            }`}
                          >
                            {step.label}
                          </span>
                          {current && message ? (
                            <span className="truncate text-xs text-zinc-400">
                              {message}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : phase === "success" ? (
              <div className="flex flex-col items-center text-center">
                <TbCircleCheck className="h-14 w-14 text-emerald-400" />
                <h2 className="mt-3 text-lg font-semibold text-white">
                  {title} complete
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Confirmed on Stellar testnet.
                </p>
                {txHash ? (
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center gap-1 text-sm text-zinc-300 transition-colors hover:text-white"
                  >
                    View transaction <TbExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 h-11 w-full cursor-pointer rounded-full bg-white text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <TbAlertTriangle className="h-14 w-14 text-red-400" />
                <h2 className="mt-3 text-lg font-semibold text-white">
                  {title} failed
                </h2>
                <p className="mt-2 max-h-28 overflow-auto text-sm leading-5 text-zinc-400">
                  {error ?? "Something went wrong."}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 h-11 w-full cursor-pointer rounded-full bg-white text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
