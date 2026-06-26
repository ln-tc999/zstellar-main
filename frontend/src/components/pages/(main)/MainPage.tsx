import { VideoBackground } from "@/components/ui/VideoBackground";
import { WalletProvider } from "@/features/wallet";
import { ActionPanel } from "./ActionPanel";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { Navbar } from "./Navbar";
import { ActionTabProvider, ActionTabs } from "./tabs";

export function MainPage() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-page">
      <VideoBackground />
      <div className="pointer-events-none fixed inset-0 z-0 bg-prism-veil" />

      <WalletProvider>
        <ActionTabProvider>
          <div className="relative z-10 flex min-h-screen flex-1 flex-col">
            <Navbar />
            {/* Left rail: same left padding as the logo, vertical list, desktop only. */}
            <div className="absolute left-6 top-1/2 hidden -translate-y-1/2 sm:left-10 lg:block">
              <ActionTabs />
            </div>
            <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-12 sm:py-16">
              <Hero />
              <ActionPanel />
            </main>
            <Footer />
          </div>
        </ActionTabProvider>
      </WalletProvider>
    </div>
  );
}
