import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "zStellar: Private payments on Stellar",
  description:
    "Shielded deposit, transfer, and withdraw on Stellar. In-pool amounts and counterparties stay hidden with client-side zero-knowledge proofs.",
};

// Runs before paint to apply the saved theme (default dark) so there is no
// flash of the wrong palette. Mirrors the logic in features/theme/ThemeToggle.
const themeScript = `(function(){try{var t=localStorage.getItem('zstellar-theme')||'dark';var d=t!=='light';var e=document.documentElement;e.classList.toggle('dark',d);e.dataset.theme=d?'dark':'light';}catch(_){var e=document.documentElement;e.classList.add('dark');e.dataset.theme='dark';}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static no-flash theme script
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        {children}
      </body>
    </html>
  );
}
