"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { TbMoon, TbSun } from "react-icons/tb";

type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "zstellar-theme";

// Self-contained: the initial class is set by the inline script in layout.tsx
// before paint, so here we just read it back and flip it on click. Rendering a
// neutral placeholder until mounted avoids a hydration mismatch.
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.toggle("dark", next === "dark");
    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // storage may be unavailable (private mode); the toggle still works.
    }
    setTheme(next);
  };

  const label =
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line-strong text-fg transition-colors hover:bg-fill"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme ? (
          <motion.span
            key={theme}
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            {theme === "dark" ? (
              <TbSun className="h-[18px] w-[18px]" />
            ) : (
              <TbMoon className="h-[18px] w-[18px]" />
            )}
          </motion.span>
        ) : (
          <span className="h-[18px] w-[18px]" />
        )}
      </AnimatePresence>
    </button>
  );
}
