"use client";

import Image from "next/image";
import Link from "next/link";
import { TbArrowRight } from "react-icons/tb";
import { ThemeToggle } from "@/features/theme";
import { useSmoothScroll } from "./SmoothScroll";

const LINKS = [
  { id: "features", label: "Features" },
  { id: "how", label: "How it works" },
  { id: "stack", label: "Tech & architecture" },
];

export function IntroNav() {
  const { scrollTo } = useSmoothScroll();

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-5">
      <nav className="flex w-full max-w-5xl items-center justify-between gap-4 rounded-full border border-line bg-surface px-4 py-2.5 shadow-2xl shadow-[color:var(--shadow)] backdrop-blur-md sm:px-5">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/Assets/Images/Logo-Brands/zStellar-logo.png"
            alt="zStellar"
            width={28}
            height={28}
            priority
            className="h-7 w-7 rounded-lg object-contain"
          />
          <span className="font-semibold text-fg tracking-tight">zStellar</span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollTo(`#${link.id}`)}
              className="cursor-pointer text-[13px] font-medium text-muted transition-colors hover:text-fg"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Link
            href="/app"
            className="flex h-10 cursor-pointer items-center gap-1.5 rounded-full bg-btn pr-4 pl-5 text-sm font-semibold text-btn-fg transition-colors hover:bg-btn-hover"
          >
            Launch app
            <TbArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
