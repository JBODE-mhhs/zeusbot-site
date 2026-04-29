"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { useReducedMotion } from "framer-motion";
import { BEATS, TOTAL_BEATS } from "./beats";
import { buildOverlayTimeline, buildDimTimeline } from "./reveal";
import { playFrameRange, FRAME_PATH, preloadFrames } from "./hero-frame-player";
import { applyScrim, REDUCED_MOTION_SCRIM } from "./scrim";

/**
 * SnapRibbon — gesture-claimed snap container with persistent frame backdrop.
 *
 * Mechanics: see orgs/zeus/shared/zeusbot-site/scroll-choreography.md (v3, §1-§3).
 *
 * Layer architecture (§1.4):
 *   z=0: <img data-frame-bg> — fixed inset:0; src mutates per beat sub-range,
 *        element never unmounted/never opacity-faded; cinematic backdrop
 *        flowing behind every text overlay across all 11 beats.
 *   z=1: <div data-scrim>    — fixed inset:0; bg recipe per beat (§3.4).
 *   z=2: scene host          — all 6 scenes are mounted at all times so
 *        every beat's overlays are query-able for upfront timeline build;
 *        only the active scene is opacity:1, others opacity:0 + pointer
 *        events:none + aria-hidden. Spec calls for mount/unmount; we use
 *        opacity-toggle so pre-built gsap timelines target a stable DOM.
 *        Cross-scene transitions cross-fade (200ms out + 400ms in @ +100ms).
 *   z=3: persistent UI (sr-only beat status; skip-link added at B11 peg).
 *
 * Beat advance pipeline (drain → playBeatTransition):
 *   - Always plays this beat's frame sub-range (every beat is a frame beat
 *     under v3; no kind guard).
 *   - Cross-scene: setActiveSceneIdx triggers opacity swap; runs in parallel
 *     with frame swap. Scene container's overlays animate via pre-built gsap
 *     timeline immediately; with all scenes mounted the targets are stable.
 *   - Same-scene (hero internal, how-internal): no scene swap; just frame +
 *     enter timeline + dim timeline.
 *   - Backward: reverse fromBeat's enter+dim, reverse-iterate frame range.
 *
 * Scroll claim:
 *   - GSAP Observer captures wheel/touch/pointer + keyboard, queues ±1
 *   - QUEUE_CAP=2, MIN_DELAY_MS=250 → fast scroll structurally cannot skip
 *     past a beat (~850ms floor)
 *   - body { overflow: hidden } enforced; restored on B11+1 release.
 *
 * Reduced motion (§5): Observer never registers; frame held on f15 fixed-bg
 * with collapsed scrim; all overlays render at final state; sections stack
 * in normal scrolling flow.
 */
const QUEUE_CAP = 2;
const MIN_DELAY_MS = 250;
const BEAT_DURATION_MS = 600;
const SCENE_FADE_OUT_MS = 200;
const SCENE_FADE_IN_DELAY_MS = 100;
const SCENE_FADE_IN_MS = BEAT_DURATION_MS - SCENE_FADE_IN_DELAY_MS - SCENE_FADE_OUT_MS;

interface Props {
  children: ReactNode;
}

export function SnapRibbon({ children }: Props) {
  const reduced = useReducedMotion();
  const [released, setReleased] = useState(false);
  const [activeSceneIdx, setActiveSceneIdx] = useState(0);
  const beatRef = useRef(0);
  const frameImgRef = useRef<HTMLImageElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (reduced) return;

    const frameImg = frameImgRef.current;
    const scrimEl = scrimRef.current;
    if (!frameImg || !scrimEl) return;

    document.body.style.overflow = "hidden";
    applyScrim(scrimEl, BEATS[0].scrim);

    let observer: { kill: () => void } | null = null;
    let isAnimating = false;
    const queue: number[] = [];
    let cancelled = false;
    let cleanupKey = () => {};

    (async () => {
      const [{ gsap }, { Observer }] = await Promise.all([
        import("gsap"),
        import("gsap/Observer"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(Observer);

      // Build all enter + dim timelines once. All scenes are mounted (see
      // layer doc above), so querySelectorAll resolves against stable DOM.
      const enterTl = new Map<string, gsap.core.Timeline>();
      const dimTl = new Map<string, gsap.core.Timeline>();
      for (const beat of BEATS) {
        enterTl.set(beat.id, buildOverlayTimeline(gsap, beat.overlays));
        if (beat.dimOverlays && beat.dimOverlays.length > 0) {
          dimTl.set(beat.id, buildDimTimeline(gsap, beat.dimOverlays));
        }
      }

      const playBeatTransition = (
        fromIdx: number,
        toIdx: number,
        direction: 1 | -1,
      ): Promise<void> => {
        const fromBeat = BEATS[fromIdx];
        const toBeat = BEATS[toIdx];
        const sameScene = fromBeat.sceneIdx === toBeat.sceneIdx;

        if (direction === +1) {
          // Forward — every beat plays its frame sub-range. Single-frame
          // beats (B9, B10) swap once and hold for the full beat duration.
          playFrameRange(frameImg, toBeat.frameRange[0], toBeat.frameRange[1]);

          if (!sameScene) {
            // Cross-scene: scene host cross-fades (z=2). Frame keeps
            // swapping underneath uninterrupted (§3.1). Scrim recipe swaps
            // at the same moment — the scene fade covers the discontinuity.
            setActiveSceneIdx(toBeat.sceneIdx);
            applyScrim(scrimEl, toBeat.scrim);
          }

          enterTl.get(toBeat.id)?.play();
          dimTl.get(toBeat.id)?.play();
        } else {
          // Backward — reverse-iterate from fromBeat's terminal frame back
          // to toBeat's terminal so the user lands on the prior beat's
          // ending frame (e.g., B2→B1 plays f08→f04).
          const startFrame = fromBeat.frameRange[1];
          const endFrame = toBeat.frameRange[1];
          if (startFrame !== endFrame) {
            playFrameRange(frameImg, startFrame, endFrame);
          } else {
            frameImg.src = FRAME_PATH(endFrame);
          }

          if (!sameScene) {
            setActiveSceneIdx(toBeat.sceneIdx);
            applyScrim(scrimEl, toBeat.scrim);
          }

          enterTl.get(fromBeat.id)?.reverse();
          dimTl.get(fromBeat.id)?.reverse();
        }

        return new Promise<void>((resolve) => {
          window.setTimeout(resolve, BEAT_DURATION_MS);
        });
      };

      const drain = () => {
        if (isAnimating || queue.length === 0) return;
        const dir = queue.shift()! as 1 | -1;
        const wasAtFinal = beatRef.current === TOTAL_BEATS - 1;

        // Forward gesture past B11 → release ribbon, restore body scroll.
        // Frame holds f27; CSS positioning shift handled in the JSX
        // released-branch (frame img: fixed → absolute).
        if (wasAtFinal && dir === +1) {
          observer?.kill();
          observer = null;
          document.body.style.overflow = "";
          setReleased(true);
          return;
        }

        const nextBeat = Math.max(
          0,
          Math.min(TOTAL_BEATS - 1, beatRef.current + dir),
        );
        if (nextBeat === beatRef.current) {
          drain();
          return;
        }

        isAnimating = true;
        playBeatTransition(beatRef.current, nextBeat, dir).then(() => {
          beatRef.current = nextBeat;
          window.setTimeout(() => {
            isAnimating = false;
            drain();
          }, MIN_DELAY_MS);
        });
      };

      // Initial paint: B1 enter on mount.
      const b1 = BEATS[0];
      playFrameRange(frameImg, b1.frameRange[0], b1.frameRange[1]);
      enterTl.get(b1.id)?.play();
      dimTl.get(b1.id)?.play();

      // Eager preload of the entire f01..f27 sequence the moment the
      // ribbon mounts — fire-and-forget. f01..f08 are also preloaded at
      // <head> level (§7) so they hit the byte cache during HTML parse;
      // this catches f09..f27 before the user can gesture past B2 (~850ms
      // floor + 250ms cooldown = ~1.1s minimum to reach B3).
      preloadFrames(2, 27);

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
      cleanupKey = () => window.removeEventListener("keydown", onKey);
    })();

    return () => {
      cancelled = true;
      observer?.kill();
      cleanupKey();
      document.body.style.overflow = "";
    };
  }, [reduced]);

  // Reduced-motion path (§5): static f15 backdrop with collapsed scrim,
  // all sections render in normal scroll flow at final overlay state.
  if (reduced) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FRAME_PATH(15)}
          alt=""
          aria-hidden
          decoding="async"
          fetchPriority="high"
          style={{
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100vh",
            objectFit: "cover",
            objectPosition: "center",
            zIndex: 0,
          }}
        />
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            background: REDUCED_MOTION_SCRIM,
          }}
        />
        <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
      </>
    );
  }

  const childArray = Children.toArray(children).filter(isValidElement) as ReactElement[];

  return (
    <>
      {/* z=0 frame backdrop — never unmounted; src mutates only. Stays
          position:fixed during the ribbon; on release flips to absolute so
          it scrolls cleanly above the footer (§1.3). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={frameImgRef}
        src={FRAME_PATH(BEATS[0].frameRange[0])}
        alt=""
        aria-hidden
        decoding="async"
        fetchPriority="high"
        data-frame-bg
        style={{
          position: released ? "absolute" : "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          objectPosition: "center",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      {/* z=1 scrim — bg recipe set per beat by applyScrim() */}
      <div
        ref={scrimRef}
        aria-hidden
        data-scrim
        style={{
          position: released ? "absolute" : "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          transition: "background 600ms ease",
        }}
      />
      {/* z=2 scene host — all scenes mounted; only active is visible */}
      {!released && (
        <div
          data-snap-ribbon
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2,
            overflow: "hidden",
          }}
        >
          {childArray.map((child, idx) => {
            const isActive = idx === activeSceneIdx;
            return (
              <div
                key={idx}
                data-scene-host
                data-active={isActive ? "true" : "false"}
                aria-hidden={!isActive}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: isActive ? 1 : 0,
                  pointerEvents: isActive ? "auto" : "none",
                  transition: isActive
                    ? `opacity ${SCENE_FADE_IN_MS}ms ease ${SCENE_FADE_IN_DELAY_MS}ms`
                    : `opacity ${SCENE_FADE_OUT_MS}ms ease`,
                }}
              >
                {child}
              </div>
            );
          })}
        </div>
      )}
      {/* On release, sections flow normally above the absolute-positioned frame */}
      {released && (
        <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
      )}
      {/* z=3 persistent UI — SR-only beat status; skip-link wired at B11 peg
          per zeus 1777424279438 (a11y test asserts skip-link activation while
          body overflow:hidden lands at #footer not viewport-top). */}
      <div aria-live="polite" className="sr-only" data-beat-status>
        {`Beat ${beatRef.current + 1} of ${TOTAL_BEATS}`}
      </div>
    </>
  );
}

/**
 * Scene cell — single-screen container with relative positioning for its
 * own internal grid. The SnapRibbon's z=2 scene-host wraps each one and
 * controls visibility (opacity + pointer-events). Hero scene container is
 * shared across B1-B4 internal beats; section scenes (B5-B11) each own one.
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
