"use client";

import { useEffect, useState } from "react";

// Two looping videos stacked full-screen; we crossfade between them when the
// theme changes by watching the `.dark` class on <html>. Both are served from
// /public (same-origin) so they pass the COEP `require-corp` policy that the
// cross-origin CDN sources would have failed.
export function VideoBackground() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <video
        aria-hidden
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        src="/Assets/Videos/bg-light.mp4"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          isDark ? "opacity-0" : "opacity-100"
        }`}
      />
      <video
        aria-hidden
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        src="/Assets/Videos/bg-dark.mp4"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          isDark ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
