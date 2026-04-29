"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { BEATS, TOTAL_BEATS, TOTAL_SCENES } from "./beats";
import { buildOverlayTimeline } from "./reveal";
import { playHeroFrames, preloadFrames } from "./hero-frame-player";

/**
 * SnapRibbon — gesture-claimed snap container.
 *
 * Mechanics: see orgs/zeus/shared/zeusbot-site/scroll-choreography.md §1.
 *
 * - GSAP Observer captures wheel/touch/pointer + keyboard, queues ±1 advances
 * - QUEUE_CAP = 2 (one in-flight + one buffered), MIN_DELAY_MS = 250 cooldown
 * - Cross-scene transitions translate the rail by ±100vh over 600ms
 * - Same-scene transitions (B1↔B2, B6↔B7, etc.) are no-ops on the translate
 *   for now; their internal animations (frame swap, dim, overlay) land in
 *   per-beat commits on top of this scaffold
 * - body { overflow: hidden } while inside the ribbon; restored on release
 * - Reduced motion: Observer never registers; rail collapses to natural flow
 */
const QUEUE_CAP = 2;
const MIN_DELAY_MS = 250;
const SCENE_TRANSITION_MS = 600;

interface Props {
  children: ReactNode;
}

export function SnapRibbon({ children }: Props) {
  const reduced = useReducedMotion();
  const [released, setReleased] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const beatRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (reduced) return;

    const rail = railRef.current;
    if (!rail) return;

    document.body.style.overflow = "hidden";

    let observer: { kill: () => void } | null = null;
    let isAnimating = false;
    const queue: number[] = [];

    const animateScene = (toSceneIdx: number) =>
      new Promise<void>((resolve) => {
        rail.style.transition = `transform ${SCENE_TRANSITION_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        rail.style.transform = `translate3d(0, -${toSceneIdx * 100}vh, 0)`;
        window.setTimeout(resolve, SCENE_TRANSITION_MS);
      });

    const drain = () => {
      if (isAnimating || queue.length === 0) return;
      const dir = queue.shift()!;
      const wasAtFinal = beatRef.current === TOTAL_BEATS - 1;

      // Forward gesture past B11 → release ribbon, restore body scroll
      if (wasAtFinal && dir === +1) {
        observer?.kill();
        observer = null;
        document.body.style.overflow = "";
        setReleased(true);
        return;
      }

      const nextBeat = Math.max(0, Math.min(TOTAL_BEATS - 1, beatRef.current + dir));
      if (nextBeat === beatRef.current) {
        drain();
        return;
      }

      const fromScene = BEATS[beatRef.current].sceneIdx;
      const toScene = BEATS[nextBeat].sceneIdx;
      const sameScene = fromScene === toScene;

      isAnimating = true;
      const transition = sameScene ? Promise.resolve() : animateScene(toScene);

      transition.then(() => {
        beatRef.current = nextBeat;
        window.setTimeout(() => {
          isAnimating = false;
          drain();
        }, MIN_DELAY_MS);
      });
    };

    let cancelled = false;
    (async () => {
      const [{ gsap }, { Observer }] = await Promise.all([
        import("gsap"),
        import("gsap/Observer"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(Observer);

      // B1 enter — eyebrow + L1 rise in, hero frame plays f01→f07.
      // Frames f01..f07 are preloaded in <head> via app/layout.tsx's
      // <link rel="preload"> for the B1 range; the swap is a cache hit.
      const heroImg = document.querySelector<HTMLImageElement>(
        '[data-scene-content="hero"] [data-hero-img]',
      );
      const b1 = BEATS[0];
      const b1Tl = buildOverlayTimeline(gsap, b1.overlays);
      if (heroImg && b1.frameRange) {
        // Fire-and-forget — frame cycle and overlay reveal run in parallel
        // so the headline lands as the frame settles on f07.
        playHeroFrames(heroImg, b1.frameRange[0], b1.frameRange[1]);
      }
      b1Tl.play();

      // Defer-preload the rest of the hero frame range (f08..f27) after
      // the B1 paint settles — keeps LCP bandwidth clean.
      window.setTimeout(() => {
        if (!cancelled) preloadFrames(8, 27);
      }, 1500);

      observer = Observer.create({
        type: "wheel,touch,pointer",
        wheelSpeed: -1,
        tolerance: 12,
        preventDefault: true,
        onUp: () => {
          if (queue.length < QUEUE_CAP) queue.push(+1);
          drain();
        },
        onDown: () => {
          if (queue.length < QUEUE_CAP) queue.push(-1);
          drain();
        },
      });
    })();

    const onKey = (e: KeyboardEvent) => {
      const advance = ["ArrowDown", "PageDown", " "].includes(e.key)
        ? +1
        : ["ArrowUp", "PageUp"].includes(e.key)
          ? -1
          : 0;
      if (!advance) return;
      e.preventDefault();
      if (queue.length < QUEUE_CAP) queue.push(advance);
      drain();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelled = true;
      observer?.kill();
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [reduced]);

  if (reduced) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        data-snap-ribbon
        data-released={released ? "true" : "false"}
        style={{
          display: released ? "none" : "block",
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          height: "100vh",
        }}
      >
        <div
          ref={railRef}
          style={{
            willChange: "transform",
            height: `${TOTAL_SCENES * 100}vh`,
            transform: "translate3d(0, 0, 0)",
          }}
        >
          {children}
        </div>
      </div>
      <div aria-live="polite" className="sr-only" data-beat-status />
    </>
  );
}

/**
 * Scene cell — exactly 100vh tall, content centered. Each scene corresponds
 * to one of the 6 visual registers in the ribbon (Hero, Capabilities, How,
 * Stats, Pricing, CTA close).
 */
export function SnapScene({
  sceneId,
  children,
}: {
  sceneId: string;
  children: ReactNode;
}) {
  return (
    <section
      data-scene={sceneId}
      style={{
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {children}
    </section>
  );
}
