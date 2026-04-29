"use client";

import { useEffect } from "react";

/**
 * LenisProvider — initializes Lenis smooth scroll once at app root and couples
 * it to GSAP's ticker + ScrollTrigger.update (per scroll-choreography.md §1).
 *
 * Why a provider: Lenis must be a singleton (one rAF loop per tab), and
 * ScrollTrigger needs `lenis.on("scroll", ScrollTrigger.update)` wired before
 * any pinned section initializes — otherwise the pin and the smooth scroll
 * fight each other and the user sees stutter.
 *
 * Reduced motion: Lenis is skipped entirely so native scroll handles
 * everything. ScrollTrigger sections still mount but disable themselves.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let lenis: import("lenis").default | null = null;
    let rafId = 0;
    let cleanup: (() => void) | null = null;

    (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
      });

      const onScroll = () => ScrollTrigger.update();
      lenis.on("scroll", onScroll);

      const tick = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
        lenis?.off("scroll", onScroll);
        gsap.ticker.remove(tick);
        lenis?.destroy();
        lenis = null;
      };
    })();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      cleanup?.();
    };
  }, []);

  return <>{children}</>;
}
