"use client";

import { useEffect, useRef, useState } from "react";
import { FrameCanvas, type FrameCanvasHandle } from "./FrameCanvas";
import { setupHeroPin } from "./HeroPin";
import { setupCapabilitiesPin } from "./CapabilitiesPin";
import { setupHowPin } from "./HowPin";
import { setupStatsPin } from "./StatsPin";
import { setupPricingPin } from "./PricingPin";
import { setupCtaPin } from "./CtaPin";
import {
  SECTION_FRAME_RANGE,
  SECTION_LABEL,
  SECTION_ORDER,
  SECTION_PIN_VH,
} from "./scrimRecipes";

const TOTAL_PIN_VH = SECTION_ORDER.reduce(
  (acc, id) => acc + SECTION_PIN_VH[id],
  0,
);

/**
 * Cumulative progress thresholds — global progress 0..1 maps onto
 * section frame ranges by walking the section order and accumulating
 * pin lengths. Used by the frame-canvas global ScrollTrigger to pick
 * the right frame index for the current scroll position.
 */
function buildFrameMap(): Array<{ from: number; to: number; frameFrom: number; frameTo: number }> {
  const out: Array<{ from: number; to: number; frameFrom: number; frameTo: number }> = [];
  let acc = 0;
  for (const id of SECTION_ORDER) {
    const span = SECTION_PIN_VH[id] / TOTAL_PIN_VH;
    const [frameFrom, frameTo] = SECTION_FRAME_RANGE[id];
    out.push({ from: acc, to: acc + span, frameFrom, frameTo });
    acc += span;
  }
  return out;
}

const FRAME_MAP = buildFrameMap();

function frameForGlobalProgress(p: number): number {
  const clamped = Math.min(0.9999, Math.max(0, p));
  for (const seg of FRAME_MAP) {
    if (clamped >= seg.from && clamped < seg.to) {
      const local = (clamped - seg.from) / (seg.to - seg.from);
      const range = seg.frameTo - seg.frameFrom;
      return seg.frameFrom + Math.round(local * range);
    }
  }
  return FRAME_MAP[FRAME_MAP.length - 1].frameTo;
}

function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number) {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/**
 * ScrollEngine — single mount-once client component (§8.1). Initializes
 * Lenis + ScrollTrigger, registers per-section pin/scrub timelines,
 * the global frame-canvas ScrollTrigger, and the section-snap
 * ScrollTrigger. Owns full cleanup on unmount.
 *
 * Reduced motion: skip Lenis + skip ScrollTrigger entirely; sections
 * render in normal flow per globals.css `.rm` rules.
 */
export function ScrollEngine() {
  const canvasRef = useRef<FrameCanvasHandle>(null);
  // Canvas is client-only — keeps it out of SSR DOM so Lighthouse identifies
  // the SSR <img data-frame-bg> as the unambiguous LCP candidate. Without this,
  // the simulator picks the SSR canvas as the largest visible element and
  // gates LCP on JS execution → drawFrame, which extends LCP to ~6s on mobile
  // slow-4G + CPU 4x. The img is in SSR HTML, preloaded with high priority.
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
      // Kick off f01 decode + lib imports in parallel — f01 is the LCP target
      // (§7.1) and must paint inside the 2.5s budget. Earlier impl awaited a
      // Promise.all over all 27 frames before first paint, which deferred the
      // LCP candidate behind ~800 KB of decode and tripped Lighthouse §10/4.
      const fc = canvasRef.current;
      fc?.resize();
      const firstFramePromise = fc?.preloadFirstFrame() ?? Promise.resolve();

      const libsPromise = Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      // Paint f01 the moment it's decoded — independent of the lib imports.
      firstFramePromise.then(() => {
        if (cancelled) return;
        fc?.drawFrame(1);
      });

      const [
        { default: Lenis },
        { gsap },
        { ScrollTrigger },
      ] = await libsPromise;

      if (cancelled) return;

      // Make sure we've drawn f01 before any per-section ScrollTrigger
      // refreshes (avoids a black-canvas flash if libs load before f01).
      await firstFramePromise;
      if (cancelled) return;
      fc?.drawFrame(1);

      // Continue decoding f02..f27 in the background — fire-and-forget;
      // ScrollEngine's frame-canvas ScrollTrigger guards on img.complete
      // and skips the draw if a frame isn't ready yet.
      fc?.preloadRemainingFrames();

      gsap.registerPlugin(ScrollTrigger);

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

      // Per-section pins (registers ScrollTriggers; ordering matters because
      // pin spacers stack vertically and later sections measure off earlier ones)
      setupHeroPin(gsap, ScrollTrigger);
      setupCapabilitiesPin(gsap, ScrollTrigger);
      setupHowPin(gsap, ScrollTrigger);
      setupStatsPin(gsap, ScrollTrigger);
      setupPricingPin(gsap, ScrollTrigger);
      setupCtaPin(gsap, ScrollTrigger);

      // Global frame-canvas ScrollTrigger — drives drawFrame from overall
      // page progress (covers the entire pinned ribbon range).
      ScrollTrigger.create({
        trigger: "main",
        start: "top top",
        end: () => `+=${TOTAL_PIN_VH}vh`,
        scrub: true,
        onUpdate: (self) => {
          if (!fc) return;
          fc.drawFrame(frameForGlobalProgress(self.progress));
        },
      });

      // Section-snap ScrollTrigger — labels at each section's top:top
      // (registered via the per-section ScrollTriggers above). We also
      // surface a status string for screen readers and visual debugging.
      const statusEl = document.querySelector<HTMLElement>(
        "[data-section-status]",
      );

      // aria-live status updates fire on BOTH scroll directions — v4 parity
      // (setSectionStatusIdx in playSectionTransition was direction-agnostic).
      // Without onEnterBack, scrolling backward leaves the status text stale,
      // an a11y regression flagged by Bugbot on 04b2628.
      const setStatus = (id: keyof typeof SECTION_LABEL, idx: number) => {
        if (!statusEl) return;
        statusEl.textContent = `Section ${idx + 1} of ${SECTION_ORDER.length}: ${SECTION_LABEL[id]}`;
      };

      SECTION_ORDER.forEach((id, idx) => {
        const el = document.querySelector(`[data-section="${id}"]`);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el as HTMLElement,
          start: "top top",
          onEnter: () => setStatus(id, idx),
          onEnterBack: () => setStatus(id, idx),
        });
      });

      // Snap pulls scroll-velocity-aware to nearest section anchor.
      // labelsDirectional honors scroll direction; `inertia: true` lets
      // Lenis inertia settle before the snap pulls.
      ScrollTrigger.create({
        trigger: "main",
        start: "top top",
        end: () => `+=${TOTAL_PIN_VH}vh`,
        snap: {
          snapTo: (progress) => {
            // Snap to each section's start as a fraction of total pin length
            const anchors: number[] = [];
            let acc = 0;
            for (const id of SECTION_ORDER) {
              anchors.push(acc / TOTAL_PIN_VH);
              acc += SECTION_PIN_VH[id];
            }
            anchors.push(1);
            return anchors.reduce((nearest, cur) =>
              Math.abs(cur - progress) < Math.abs(nearest - progress)
                ? cur
                : nearest,
            );
          },
          duration: { min: 0.4, max: 0.8 },
          ease: "expo.out",
          delay: 0.1,
          inertia: true,
        },
      });

      // Resize handling: debounced canvas resize + ScrollTrigger.refresh
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
          (canvas is z:1, transparent until first paint). The browser paints
          this image as soon as f01-720.webp decodes (preloaded with
          fetchpriority:high in app/layout.tsx <head>), well before the
          ScrollEngine effect hydrates — keeping LCP under the §7.1 budget.
          .rm hides this and shows data-frame-poster (f15) instead. */}
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
      {/* Reduced-motion poster (f15 — most informative hero frame per §6). */}
      <img
        data-frame-poster
        src="/frames/f15-720.webp"
        srcSet="/frames/f15-720.webp 720w, /frames/f15-1080.webp 1080w, /frames/f15.webp 1440w"
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
      {/* sr-only section status for screen readers (snap announce) */}
      <div data-section-status className="sr-only" aria-live="polite" />
    </>
  );
}
