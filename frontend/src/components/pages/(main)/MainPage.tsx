import Prism from "@/components/ui/Prism";
import { WalletProvider } from "@/features/wallet";
import { ActionPanel } from "./ActionPanel";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { Navbar } from "./Navbar";

export function MainPage() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-black">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-60">
        <Prism
          animationType="rotate"
          timeScale={0.4}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0.4}
          glow={0.9}
        />
      </div>
      <div className="pointer-events-none fixed inset-0 z-0 bg-black/30" />

      <WalletProvider>
        <div className="relative z-10 flex min-h-screen flex-1 flex-col">
          <Navbar />
          <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-12 sm:py-16">
            <Hero />
            <ActionPanel />
          </main>
          <Footer />
        </div>
      </WalletProvider>
    </div>
  );
}
