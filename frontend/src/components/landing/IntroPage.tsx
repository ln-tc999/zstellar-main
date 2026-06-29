import Link from "next/link";
import { TbArrowRight, TbBrandGithub } from "react-icons/tb";
import { FeaturesSection } from "./FeaturesSection";
import { HeroSection } from "./HeroSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { IntroNav } from "./IntroNav";
import { Reveal } from "./Reveal";
import { SmoothScroll } from "./SmoothScroll";
import { TechStackSection } from "./TechStackSection";

export function IntroPage() {
  return (
    <SmoothScroll>
      <div className="relative flex min-h-full flex-1 flex-col bg-page">
        <IntroNav />

        <main className="flex flex-col">
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <TechStackSection />

          {/* Closing CTA */}
          <section className="mx-auto w-full max-w-6xl px-6 pb-24 sm:pb-32">
            <Reveal>
              <div className="overflow-hidden rounded-3xl border border-line bg-surface px-6 py-14 text-center shadow-2xl shadow-[color:var(--shadow)] backdrop-blur-sm sm:px-12 sm:py-20">
                <h2 className="mx-auto max-w-2xl text-3xl font-medium leading-tight tracking-tight text-fg sm:text-5xl">
                  Your balance and your counterparties stay private.
                </h2>
                <p className="mx-auto mt-4 max-w-md text-base leading-7 text-muted">
                  Shield, pay, and cash out on Stellar — without revealing
                  amounts or the link between you and your payees.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/app"
                    className="flex h-12 cursor-pointer items-center gap-1.5 rounded-full bg-btn pr-5 pl-6 text-[15px] font-semibold text-btn-fg transition-colors hover:bg-btn-hover"
                  >
                    Launch app
                    <TbArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="https://github.com/0xpochita/zStellar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 cursor-pointer items-center gap-2 rounded-full border border-line bg-fill px-6 text-[15px] font-medium text-fg transition-colors hover:bg-fill-2"
                  >
                    <TbBrandGithub className="h-4 w-4" />
                    GitHub
                  </a>
                </div>
              </div>
            </Reveal>
          </section>
        </main>

        <footer className="border-line border-t px-6 py-8 sm:px-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-faint sm:flex-row">
            <p>2026 zStellar. Testnet only, unaudited, no real assets.</p>
            <p>Built on Nethermind&apos;s Stellar Private Payments PoC.</p>
          </div>
        </footer>
      </div>
    </SmoothScroll>
  );
}
