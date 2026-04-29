"use client";

import { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (typeof window === "undefined") return;

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
      const [
        { default: Lenis },
        { gsap },
        { ScrollTrigger },
      ] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled) return;

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

      // Frame canvas: preload + initial size + first paint
      const fc = canvasRef.current;
      if (fc) {
        fc.resize();
        await fc.preloadFrames();
        fc.drawFrame(1);
      }

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

      SECTION_ORDER.forEach((id, idx) => {
        const el = document.querySelector(`[data-section="${id}"]`);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el as HTMLElement,
          start: "top top",
          onEnter: () => {
            if (statusEl) {
              statusEl.textContent = `Section ${idx + 1} of ${SECTION_ORDER.length}: ${SECTION_LABEL[id]}`;
            }
          },
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
  }, []);

  return (
    <>
      <FrameCanvas ref={canvasRef} />
      {/* SSR LCP-fallback poster: visible only in reduced-motion mode (canvas hidden);
          the ScrollEngine doesn't paint canvas before user interaction in rm mode. */}
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
