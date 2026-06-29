"use client";

import { Reveal } from "./Reveal";

const STEPS = [
  {
    step: "01",
    title: "Connect & derive keys",
    body: "Connect Freighter and sign once. Your note and encryption keys are derived from that single signature and cached locally in OPFS.",
  },
  {
    step: "02",
    title: "Shield",
    body: "Deposit a public asset into the pool. You sign the token pull and a note commitment is added. First deposit auto-registers you in the ASP set.",
  },
  {
    step: "03",
    title: "Pay or receive privately",
    body: "Send to a recipient's shielded address, or share yours to get paid. The amount and the sender → receiver link stay hidden on-chain.",
  },
  {
    step: "04",
    title: "Withdraw",
    body: "Cash out to any public G-address at any time. The relayer submits the proven transaction, so your address never appears on the ledger.",
  },
];

const COLUMNS = [
  {
    name: "Shield",
    direction: "public → shielded",
    ext: "ext_amount > 0",
    submitter: "Your wallet",
    hidden: "Your in-pool balance",
  },
  {
    name: "Private Transfer",
    direction: "shielded → shielded",
    ext: "ext_amount == 0",
    submitter: "Relayer",
    hidden: "Amount + sender→receiver link",
  },
  {
    name: "Private Withdraw",
    direction: "shielded → public",
    ext: "ext_amount < 0",
    submitter: "Relayer",
    hidden: "Amount + your submitter address",
  },
];

const ROWS: { label: string; key: keyof (typeof COLUMNS)[number] }[] = [
  { label: "Direction", key: "direction" },
  { label: "Signed value", key: "ext" },
  { label: "Submitter", key: "submitter" },
  { label: "What stays hidden", key: "hidden" },
];

export function HowItWorksSection() {
  return (
    <section
      id="how"
      className="relative mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-24 sm:py-32"
    >
      <Reveal className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-faint">
          How it works
        </p>
        <h2 className="mt-4 text-3xl font-medium leading-tight tracking-tight text-fg sm:text-5xl">
          One pool. Three flows.
          <br className="hidden sm:block" /> Custody never leaves you.
        </h2>
        <p className="mt-4 text-base leading-7 text-muted">
          Every action is a zero-knowledge proof built in your browser and
          verified on-chain through a single{" "}
          <span className="font-mono text-fg">transact</span> entrypoint.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((item, index) => (
          <Reveal key={item.step} delay={index * 0.08}>
            <div className="h-full rounded-2xl border border-line bg-surface p-6 shadow-2xl shadow-[color:var(--shadow)] backdrop-blur-sm">
              <span className="font-mono text-sm text-faint">{item.step}</span>
              <h3 className="mt-3 text-base font-semibold tracking-tight text-fg">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1} className="mt-6">
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-2xl shadow-[color:var(--shadow)] backdrop-blur-sm">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-line border-b">
                <th className="px-5 py-4 font-medium text-faint">Flow</th>
                {COLUMNS.map((col) => (
                  <th
                    key={col.name}
                    className="px-5 py-4 font-semibold text-fg"
                  >
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr
                  key={row.label}
                  className="border-line border-b last:border-b-0"
                >
                  <td className="px-5 py-4 font-medium text-muted">
                    {row.label}
                  </td>
                  {COLUMNS.map((col) => {
                    const value = col[row.key];
                    const mono = row.key === "ext" || row.key === "direction";
                    return (
                      <td
                        key={col.name}
                        className={`px-5 py-4 text-fg ${mono ? "font-mono text-[13px]" : ""}`}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </section>
  );
}
