"use client";

import { useEffect, useRef, useState } from "react";
import { FrameCanvas, type FrameCanvasHandle } from "./FrameCanvas";
import { setupCopyTweens } from "./SectionCopy";

/**
 * ScrollEngine — single mount-once client component (v6 §7.1). Owns the
 * SINGLE pin + scrub timeline that drives both the frame canvas and the
 * three copy crossfades. Lenis bridges the wheel to GSAP's RAF.
 *
 * Architectural rules baked in (per scroll-choreography.md v6):
 *  - One ScrollTrigger, on `<main>`, end:`+=1500%`, pin:true, scrub:true.
 *  - No snap config anywhere — the v5 touch-snap conditional is moot
 *    because there is nothing to gate (§5.3).
 *  - No per-section pins (six pin components deleted per §8.2).
 *  - No timeline labels (labels imply snap; snap is gone — Appendix A).
 *  - No direction guards / persistent-state watermarks (§5.2 prohibitions).
 *  - Reverse is native to scrub — scrolling up runs the timeline backward.
 *
 * Reduced motion: skip ScrollTrigger + Lenis entirely. Render f60 as a
 * static poster and stack the three copy blocks in normal flow (§6.2).
 */

const TOTAL_FRAMES = 60;

/** Spec §2.2 — Math.ceil so f01 holds for p ∈ [0, 1/60). */
function progressToFrameIdx(p: number): number {
  return Math.min(TOTAL_FRAMES, Math.max(1, Math.ceil(p * TOTAL_FRAMES)));
}

function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number) {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function ScrollEngine() {
  const canvasRef = useRef<FrameCanvasHandle>(null);
  // Canvas is client-only — keeps it out of SSR DOM so Lighthouse identifies
  // the SSR <img data-frame-bg> as the unambiguous LCP candidate. Without
  // this gate, the simulator picks the SSR canvas as the largest visible
  // element and gates LCP on JS execution → drawFrame, blowing the 2.5s
  // budget on mobile slow-4G + CPU 4x.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!mounted) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      document.documentElement.classList.add("rm");
      return;
    }

    let cancelled = false;
    let cleanup: (() => void) | null = null;

    (async () => {
      // f01 decode + lib imports run in parallel — f01 is the LCP target
      // (§7.2) and must paint inside the 2.5s budget. Awaiting all 60
      // frames before first paint would defer the LCP candidate behind
      // megabytes of decode and trip Lighthouse mobile floor.
      const fc = canvasRef.current;
      fc?.resize();
      const firstFramePromise = fc?.preloadFirstFrame() ?? Promise.resolve();

      const libsPromise = Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      // Paint f01 the moment it's decoded — independent of lib imports.
      firstFramePromise.then(() => {
        if (cancelled) return;
        fc?.drawFrame(1);
      });

      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await libsPromise;

      if (cancelled) return;

      // Make sure f01 is drawn before the master ScrollTrigger refreshes
      // (avoids a black-canvas flash if libs load before f01 decodes).
      await firstFramePromise;
      if (cancelled) return;
      fc?.drawFrame(1);

      // Decode f02..f60 in the background — fire-and-forget. drawFrame
      // guards on img.complete and skips draws for not-yet-decoded frames.
      fc?.preloadRemainingFrames();

      gsap.registerPlugin(ScrollTrigger);

      // Lenis ↔ ScrollTrigger raf bridge — preserved verbatim from v5
      // §5.4. Bridge order is load-bearing: Lenis must drive the RAF that
      // ScrollTrigger reads from, otherwise reverse scroll stutters.
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
        smoothWheel: true,
      });

      const onScroll = () => ScrollTrigger.update();
      lenis.on("scroll", onScroll);

      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // SINGLE pin + scrub timeline. trigger:'main', end:'+=1500%' per
      // §2.1. onUpdate maps progress → frame index and drives the canvas.
      // Copy crossfades are added to this same timeline by setupCopyTweens
      // so all motion shares one scrub clock — no second ScrollTrigger.
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: "main",
          start: "top top",
          end: "+=1500%",
          pin: true,
          scrub: true,
          onUpdate: (self) => {
            fc?.drawFrame(progressToFrameIdx(self.progress));
          },
        },
      });

      setupCopyTweens(gsap, masterTl);

      // Resize: refresh ScrollTrigger so pin geometry recalculates against
      // the new viewport, and resize the canvas backing store.
      const onResize = debounce(() => {
        fc?.resize();
        ScrollTrigger.refresh();
      }, 200);
      window.addEventListener("resize", onResize);

      ScrollTrigger.refresh();

      cleanup = () => {
        window.removeEventListener("resize", onResize);
        ScrollTrigger.getAll().forEach((t) => t.kill());
        gsap.ticker.remove(tick);
        lenis.off("scroll", onScroll);
        lenis.destroy();
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [mounted]);

  return (
    <>
      {/* SSR f01 backdrop — LCP candidate. Sits at z:0 under the canvas
          (canvas is z:1, transparent until first paint). Browser paints
          this image as soon as f01-720.webp decodes (preloaded with
          fetchpriority:high in app/layout.tsx <head>), well before the
          ScrollEngine effect hydrates — keeping LCP under §7.2 budget.
          .rm hides this and shows data-frame-poster (f60) instead. */}
      <img
        data-frame-bg
        src="/frames/f01-720.webp"
        srcSet="/frames/f01-720.webp 720w, /frames/f01-1080.webp 1080w, /frames/f01.webp 1440w"
        sizes="100vw"
        alt=""
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      {mounted && <FrameCanvas ref={canvasRef} />}
      {/* Reduced-motion poster — f60, the resolved endframe (§6.2). */}
      <img
        data-frame-poster
        src="/frames/f60-720.webp"
        srcSet="/frames/f60-720.webp 720w, /frames/f60-1080.webp 1080w, /frames/f60.webp 1440w"
        sizes="100vw"
        alt=""
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          zIndex: 0,
          display: "none",
          pointerEvents: "none",
        }}
      />
    </>
  );
}
