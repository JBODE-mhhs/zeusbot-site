"use client";

import { useEffect, useRef, useState } from "react";
import {
  FrameCanvas,
  TOTAL_FRAMES,
  type FrameCanvasHandle,
} from "./FrameCanvas";
import { setupSectionTimelines } from "./SectionCopy";

/**
 * ScrollEngine — single mount-once client component (v6.1 rewrite).
 *
 * Time-driven model: scroll progress controls *which section is in view*
 * via `scroll-snap-type: y mandatory`. Each section owns its own paused
 * 5s timeline; ScrollTrigger fires onEnter/onEnterBack to `tl.restart()`,
 * so the animation plays at native 60fps regardless of scroll velocity.
 *
 * This replaces the v6 single-pin scrub model, which tied animation 1:1
 * to scroll fraction and stuttered under iPhone Safari touch-momentum
 * scroll (sub-pixel deltas → millisecond-by-millisecond stepping).
 *
 * Reduced motion: skip ScrollTrigger entirely, render f60 poster, sections
 * in normal flow.
 */

export function ScrollEngine() {
  const canvasRef = useRef<FrameCanvasHandle>(null);
  // Canvas is client-only — keeps it out of SSR DOM so Lighthouse
  // identifies the SSR <img data-frame-bg> as the unambiguous LCP
  // candidate.
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
      const fc = canvasRef.current;
      fc?.resize();
      const firstFramePromise = fc?.preloadFirstFrame() ?? Promise.resolve();

      const libsPromise = Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      // Paint f01 the moment it's decoded — independent of lib imports.
      firstFramePromise.then(() => {
        if (cancelled) return;
        fc?.drawFrame(1);
      });

      const [{ gsap }, { ScrollTrigger }] = await libsPromise;
      if (cancelled) return;

      await firstFramePromise;
      if (cancelled) return;
      fc?.drawFrame(1);
      fc?.preloadRemainingFrames();

      gsap.registerPlugin(ScrollTrigger);

      // Shared frame-index state. Each section's timeline tweens this 1→60
      // over 4s. The frame tweens in setupSectionTimelines pass
      // `overwrite: "auto"` explicitly so a new section's restart kills
      // any in-flight tween from the previous section — without that,
      // GSAP 3's default `overwrite: false` would let multiple tweens
      // race on frameState.idx and the canvas would paint the wrong
      // section's frame progression on fast scroll-back.
      const frameState = { idx: 1 };
      const drawFrameFromState = () => {
        fc?.drawFrame(Math.round(frameState.idx));
      };

      // Build four paused per-section timelines.
      const { heroTl, valueTl, proofTl, ctaTl } = setupSectionTimelines(gsap, {
        frameState,
        totalFrames: TOTAL_FRAMES,
        onFrameUpdate: drawFrameFromState,
      });

      // Hero: play on mount (the page lands at top, hero is in view).
      // No onEnter ScrollTrigger needed for first paint — heroTl.play()
      // here is the native trigger.
      heroTl.play();

      // Per-section ScrollTriggers for replay-on-revisit.
      // onEnter = forward scroll → play from start (restart).
      // onEnterBack = reverse scroll → rewind (reverse from current progress).
      // This gives Bode's "go from bottom up → moves in rewind, not start over."
      const heroST = ScrollTrigger.create({
        trigger: '[data-section="hero"]',
        start: "top center",
        end: "bottom center",
        onEnter: () => heroTl.restart(),
        onEnterBack: () => heroTl.reverse(),
      });
      const valueST = ScrollTrigger.create({
        trigger: '[data-section="value"]',
        start: "top center",
        end: "bottom center",
        onEnter: () => valueTl.restart(),
        onEnterBack: () => valueTl.reverse(),
      });
      const proofST = ScrollTrigger.create({
        trigger: '[data-section="proof"]',
        start: "top center",
        end: "bottom center",
        onEnter: () => proofTl.restart(),
        onEnterBack: () => proofTl.reverse(),
      });
      const ctaST = ScrollTrigger.create({
        trigger: '[data-section="cta"]',
        start: "top center",
        end: "bottom center",
        onEnter: () => ctaTl.restart(),
        onEnterBack: () => ctaTl.reverse(),
      });

      // Probe diagnostics — gated to non-production builds.
      if (process.env.NODE_ENV !== "production") {
        console.log("[zeus-v6.1] section timelines OK", {
          triggers: ScrollTrigger.getAll().length,
          heroDuration: heroTl.duration(),
          valueDuration: valueTl.duration(),
          proofDuration: proofTl.duration(),
          ctaDuration: ctaTl.duration(),
        });
      }

      const onResize = () => ScrollTrigger.refresh();
      let resizeT: ReturnType<typeof setTimeout> | null = null;
      const onResizeDebounced = () => {
        if (resizeT) clearTimeout(resizeT);
        resizeT = setTimeout(() => {
          fc?.resize();
          onResize();
        }, 200);
      };
      window.addEventListener("resize", onResizeDebounced);

      ScrollTrigger.refresh();

      cleanup = () => {
        window.removeEventListener("resize", onResizeDebounced);
        heroST.kill();
        valueST.kill();
        proofST.kill();
        ctaST.kill();
        heroTl.kill();
        valueTl.kill();
        proofTl.kill();
        ctaTl.kill();
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [mounted]);

  return (
    <>
      {/* SSR f01 backdrop — LCP candidate. */}
      <img
        data-frame-bg
        src="/frames/f001-720.webp"
        srcSet="/frames/f001-720.webp 720w, /frames/f001-1080.webp 1080w, /frames/f001.webp 1440w"
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
      {/* Reduced-motion poster — f240 (final frame of 16fps×15s clip). */}
      <img
        data-frame-poster
        src="/frames/f240-720.webp"
        srcSet="/frames/f240-720.webp 720w, /frames/f240-1080.webp 1080w, /frames/f240.webp 1440w"
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
