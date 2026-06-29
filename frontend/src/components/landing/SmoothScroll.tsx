"use client";

import Lenis from "lenis";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";

type ScrollTo = (target: string | number | HTMLElement) => void;

const LenisContext = createContext<{ scrollTo: ScrollTo }>({
  scrollTo: () => {},
});

export function useSmoothScroll() {
  return useContext(LenisContext);
}

// Wraps the landing page in Lenis-driven smooth scrolling and exposes scrollTo
// so the nav anchors can glide to sections. Lenis is torn down on unmount, so it
// never leaks into the single-screen dApp route.
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - (1 - t) ** 3,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo: ScrollTo = (target) => {
    lenisRef.current?.scrollTo(target, { offset: -80 });
  };

  return (
    <LenisContext.Provider value={{ scrollTo }}>
      {children}
    </LenisContext.Provider>
  );
}
