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
import {
  BEATS,
  TOTAL_BEATS,
  SECTIONS,
  TOTAL_SECTIONS,
  sectionIdxOfBeat,
  terminalBeatOfSection,
} from "./beats";
import { buildOverlayTimeline, buildDimTimeline } from "./reveal";
import {
  FRAME_PATH,
  FRAME_SRCSET,
  CROSS_FADE_MS,
  BEAT_DURATION_MS,
  crossFadeTo,
  playFrameRangeAB,
  jumpCutTo,
  prefetchFrames,
  type FrameBufferRefs,
} from "./hero-frame-player";
import { applyScrim, REDUCED_MOTION_SCRIM } from "./scrim";

/**
 * SnapRibbon v4 — section-coalesced snap container with dual-buffer cinematic backdrop.
 *
 * Mechanics: orgs/zeus/shared/zeusbot-site/scroll-choreography.md (v4, §1-§8).
 *
 * Layer architecture (§1.4 — every persistent layer GPU-isolated):
 *   z=0: <img data-frame-bg="A"> + <img data-frame-bg="B"> — dual buffers,
 *        will-change:opacity, contain:paint. Cross-fade 120ms swaps active.
 *   z=1: <div data-scrim="A"> + <div data-scrim="B"> — dual layers,
 *        will-change:opacity, contain:paint. opacity-blend 300ms on
 *        cross-section (matches scene fade-in window, no `background` paint).
 *   z=2: scene host — all 6 scenes mounted; sequential fade 300ms out → 300ms in,
 *        NO overlap (kills v3 B4→B5 double-image regression).
 *   z=3: persistent UI — aria-live status (Section X of 6), skip-link is at
 *        the layout.tsx level (load-bearing WCAG escape; preserved from 14ca22f).
 *
 * Section-coalesced drain (§1.1 / §1.2):
 *   - One wheel-tick = one section advance (not one beat).
 *   - QUEUE_CAP=1 effectively no queue — Observer.disable() during isAnimating
 *     drops every wheel-tick that arrives mid-transition (hard coalesce).
 *   - On section enter: if SECTIONS[i].autoAdvanceMs is set, intra-section
 *     beats auto-fire (Hero 800ms × 4, How 1000ms × 3).
 *   - User wheel-tick during auto-advance → cancel timer → jump-cut to
 *     section terminal frame + final overlay state → cross-section transition.
 *
 * Reduced motion (§5): single buffer A, single scrim A, no Observer, no
 * auto-advance, all overlays final-state, normal scroll.
 */
const QUEUE_CAP = 1;
const MIN_DELAY_MS = 250;
const SCENE_FADE_OUT_MS = 300;
const SCENE_FADE_IN_MS = 300;
const SCRIM_FADE_MS = 300;
/** v4 §6.5 mobile breakpoint — used for reveal distance + frame object-position. */
const MOBILE_MAX_PX = 768;

interface Props {
  children: ReactNode;
}

export function SnapRibbon({ children }: Props) {
  const reduced = useReducedMotion();
  const [released, setReleased] = useState(false);
  const [activeSceneIdx, setActiveSceneIdx] = useState(0);
  const [sectionStatusIdx, setSectionStatusIdx] = useState(0);
  const beatRef = useRef(0);
  const sectionRef = useRef(0);

  const frameARef = useRef<HTMLImageElement>(null);
  const frameBRef = useRef<HTMLImageElement>(null);
  const scrimARef = useRef<HTMLDivElement>(null);
  const scrimBRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (reduced) return;

    const frameA = frameARef.current;
    const frameB = frameBRef.current;
    const scrimA = scrimARef.current;
    const scrimB = scrimBRef.current;
    if (!frameA || !frameB || !scrimA || !scrimB) return;

    const isMobile = window.matchMedia(`(max-width: ${MOBILE_MAX_PX}px)`).matches;

    document.body.style.overflow = "hidden";

    const activeFrame: { current: "A" | "B" } = { current: "A" };
    const bufs: FrameBufferRefs = { a: frameA, b: frameB, activeRef: activeFrame };

    // Initial paint — buffer A holds B1's first frame; buffer B starts empty.
    frameA.style.opacity = "1";
    frameB.style.opacity = "0";
    applyScrim(scrimA, SECTIONS[0].scrim);
    scrimA.style.opacity = "1";
    scrimB.style.opacity = "0";
    const activeScrim: { current: "A" | "B" } = { current: "A" };

    let observer: { kill: () => void; disable: () => void; enable: () => void } | null = null;
    let isAnimating = false;
    let cancelled = false;
    let cleanupKey = () => {};
    let autoAdvanceTimer: number | null = null;

    const cancelAutoAdvance = () => {
      if (autoAdvanceTimer !== null) {
        window.clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = null;
      }
    };

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
        enterTl.set(beat.id, buildOverlayTimeline(gsap, beat.overlays, { mobile: isMobile }));
        if (beat.dimOverlays && beat.dimOverlays.length > 0) {
          dimTl.set(beat.id, buildDimTimeline(gsap, beat.dimOverlays));
        }
      }

      const beatIdxById = (id: string) => BEATS.findIndex((b) => b.id === id);

      /**
       * Intra-section beat advance (forward only — auto-advance and the
       * first-beat-of-new-section enter both go through here). Cross-fades
       * the frame range, plays the enter timeline, plays the dim timeline.
       */
      const playBeatEnter = async (beatIdx: number, direction: 1 | -1) => {
        const beat = BEATS[beatIdx];
        await playFrameRangeAB(bufs, beat.frameRange[0], beat.frameRange[1]);
        if (direction === +1) {
          enterTl.get(beat.id)?.play();
          dimTl.get(beat.id)?.play();
        } else {
          enterTl.get(beat.id)?.reverse();
          dimTl.get(beat.id)?.reverse();
        }
      };

      /**
       * Cross-section transition (§3.1): sequential 300ms out → 300ms in
       * with NO overlap. Scrim opacity-blends in parallel with scene fade-in.
       * Returns when all transitions settle.
       */
      const playSectionTransition = async (
        fromSection: number,
        toSection: number,
        direction: 1 | -1,
      ): Promise<void> => {
        const target = SECTIONS[toSection];
        const targetFirstBeatIdx = beatIdxById(
          direction === +1
            ? target.beatIds[0]
            : target.beatIds[target.beatIds.length - 1],
        );
        const targetFirstBeat = BEATS[targetFirstBeatIdx];

        // Phase 1 — fade out current scene.
        setActiveSceneIdx(targetFirstBeat.sceneIdx); // triggers data-active flip on render
        // setActiveSceneIdx alone fades next-scene IN per CSS rule below; we
        // need the OUT fade to complete first. The render keys both fade
        // durations (in 300ms with delay 300ms; out 300ms no delay), so the
        // browser sequences naturally. We still wait the OUT window before
        // playing the new beat's overlay timeline so they don't enter on a
        // not-yet-visible scene.

        // Phase 1b — paint scrim B with target recipe + start opacity blend.
        const inactiveScrim = activeScrim.current === "A" ? scrimB : scrimA;
        const activeScrimEl = activeScrim.current === "A" ? scrimA : scrimB;
        applyScrim(inactiveScrim, target.scrim);
        inactiveScrim.style.transition = `opacity ${SCRIM_FADE_MS}ms ease`;
        activeScrimEl.style.transition = `opacity ${SCRIM_FADE_MS}ms ease`;
        inactiveScrim.style.opacity = "1";
        activeScrimEl.style.opacity = "0";

        // Phase 1c — start cross-fading frame to target's first beat range.
        // Frame transition runs in parallel with scene fade (frame is z=0,
        // scene host is z=2 — the scene fade reveals the new frame state).
        await playFrameRangeAB(bufs, targetFirstBeat.frameRange[0], targetFirstBeat.frameRange[1]);

        // Phase 2 — wait for scene OUT to finish (parallel with frame swap
        // above, which is typically ≥ 300ms for multi-frame ranges; for
        // single-frame ranges the 1-step cross-fade is 120ms so we still
        // need the explicit wait).
        await wait(Math.max(0, SCENE_FADE_OUT_MS - CROSS_FADE_MS));

        // Phase 3 — play new beat's overlay timelines (now visible).
        if (direction === +1) {
          enterTl.get(targetFirstBeat.id)?.play();
          dimTl.get(targetFirstBeat.id)?.play();
        } else {
          enterTl.get(targetFirstBeat.id)?.reverse();
          dimTl.get(targetFirstBeat.id)?.reverse();
        }

        // Update scrim active ref AFTER blend completes.
        await wait(SCRIM_FADE_MS - SCENE_FADE_OUT_MS);
        activeScrim.current = activeScrim.current === "A" ? "B" : "A";

        // Update beat + section refs and aria-live status.
        beatRef.current = targetFirstBeatIdx;
        sectionRef.current = toSection;
        setSectionStatusIdx(toSection);
      };

      /**
       * Mid-section interrupt: user wheel-tick fires while auto-advance is
       * in flight. Snap to the section's terminal beat (final frame +
       * final overlay state via timeline.progress(1)), then run a normal
       * cross-section transition.
       */
      const jumpCutThenTransition = async (currentSection: number, direction: 1 | -1) => {
        cancelAutoAdvance();
        const terminalId = terminalBeatOfSection(currentSection);
        const terminalIdx = beatIdxById(terminalId);
        const terminalBeat = BEATS[terminalIdx];

        // Slam frame to terminal (no transition).
        jumpCutTo(bufs, terminalBeat.frameRange[1]);

        // Slam every enter timeline up to and including the terminal beat
        // to its final state — sets stranded mid-fade overlays to opacity:1.
        for (const id of SECTIONS[currentSection].beatIds) {
          enterTl.get(id)?.progress(1);
          dimTl.get(id)?.progress(1);
        }
        beatRef.current = terminalIdx;

        // Now cross-section transition like normal.
        const nextSection = Math.max(0, Math.min(TOTAL_SECTIONS - 1, currentSection + direction));
        if (nextSection === currentSection) return;
        await playSectionTransition(currentSection, nextSection, direction);
      };

      /**
       * Schedule the next intra-section auto-advance step. Recursive chain
       * via setTimeout — cancelable via cancelAutoAdvance().
       */
      const scheduleAutoAdvance = (sectionIdx: number) => {
        const section = SECTIONS[sectionIdx];
        if (!section.autoAdvanceMs) return;
        const stepMs = section.autoAdvanceMs;

        const tick = () => {
          if (sectionRef.current !== sectionIdx) return; // user already advanced
          const currentBeatId = BEATS[beatRef.current].id;
          const beatPos = section.beatIds.indexOf(currentBeatId);
          if (beatPos < 0 || beatPos >= section.beatIds.length - 1) {
            autoAdvanceTimer = null;
            return; // reached terminal — auto-advance exhausted
          }
          const nextBeatId = section.beatIds[beatPos + 1];
          const nextBeatIdx = beatIdxById(nextBeatId);
          isAnimating = true;
          observer?.disable();
          playBeatEnter(nextBeatIdx, +1).then(() => {
            beatRef.current = nextBeatIdx;
            window.setTimeout(() => {
              isAnimating = false;
              observer?.enable();
              if (sectionRef.current === sectionIdx) {
                autoAdvanceTimer = window.setTimeout(tick, stepMs);
              }
            }, MIN_DELAY_MS);
          });
        };
        autoAdvanceTimer = window.setTimeout(tick, stepMs);
      };

      // Factored release path — covers both routes:
      //   (a) forward gesture past final section (CTA B11)
      //   (b) skip-link activation
      // Strict order per §8: kill Observer FIRST, restore body overflow
      // SECOND, drop keyboard handler THIRD, setReleased(true) flips to
      // scrolling-flow mode.
      const releaseRibbon = () => {
        cancelAutoAdvance();
        observer?.kill();
        observer = null;
        document.body.style.overflow = "";
        cleanupKey();
        setReleased(true);
      };

      const handleSectionAdvance = async (direction: 1 | -1) => {
        if (isAnimating) return;
        const fromSection = sectionRef.current;
        const wasAtFinal = fromSection === TOTAL_SECTIONS - 1;

        // Forward past final section → release ribbon.
        if (wasAtFinal && direction === +1) {
          releaseRibbon();
          return;
        }
        // Backward past first section → no-op.
        if (fromSection === 0 && direction === -1) return;

        const nextSection = fromSection + direction;
        isAnimating = true;
        observer?.disable();

        // If auto-advance is in flight (mid-section), do a jump-cut to
        // the terminal beat first (covers Hero B1→B2-in-progress + user
        // wheel-down → expected: jump to B4 final, then cross to Caps).
        const inFlightAutoAdvance = autoAdvanceTimer !== null;
        if (inFlightAutoAdvance) {
          await jumpCutThenTransition(fromSection, direction);
        } else {
          await playSectionTransition(fromSection, nextSection, direction);
        }

        // After cross-section transition, schedule auto-advance for the new section.
        if (sectionRef.current !== fromSection) {
          scheduleAutoAdvance(sectionRef.current);
        }

        window.setTimeout(() => {
          isAnimating = false;
          observer?.enable();
        }, MIN_DELAY_MS);
      };

      // Initial paint: B1 enter on mount. Frame A already shows f01 from
      // the JSX initial render; play B1's frame range + overlay timelines.
      await playFrameRangeAB(bufs, BEATS[0].frameRange[0], BEATS[0].frameRange[1]);
      enterTl.get("B1")?.play();
      dimTl.get("B1")?.play();
      beatRef.current = 0;
      sectionRef.current = 0;
      // Hero auto-advance kicks in 800ms after B1 enter.
      scheduleAutoAdvance(0);

      // Tier 3 prefetch — content frames f16-f27 injected after Hero B4
      // plays (~3.2s post-mount = 4 × 800ms). Keeps mobile slow-4G
      // critical path lean (§6.2 / §7).
      window.setTimeout(() => {
        prefetchFrames(16, 27);
      }, 3200);

      observer = Observer.create({
        type: "wheel,touch,pointer",
        wheelSpeed: -1,
        tolerance: 12,
        dragMinimum: isMobile ? 30 : undefined,
        preventDefault: true,
        onUp: () => {
          handleSectionAdvance(+1);
        },
        onDown: () => {
          handleSectionAdvance(-1);
        },
      });

      const onKey = (e: KeyboardEvent) => {
        // Skip-link bypass — never gate keys when focus is on the WCAG
        // escape hatch. Tab/Enter aren't in the advance set so they're
        // already safe via early-return below; this also covers Space
        // (which IS in the advance set) defensively.
        if (
          (document.activeElement as HTMLElement | null)?.matches?.(
            "[data-skip-link]",
          )
        ) {
          return;
        }
        const advance = ["ArrowDown", "PageDown", " "].includes(e.key)
          ? +1
          : ["ArrowUp", "PageUp"].includes(e.key)
            ? -1
            : 0;
        if (!advance) return;
        e.preventDefault();
        handleSectionAdvance(advance as 1 | -1);
      };

      // Skip-link release route (§8). Listener runs synchronously inside
      // skip-link onClick → dispatchEvent so by the time scrollIntoView
      // fires on the next line, body overflow has already been restored.
      const onRelease = () => releaseRibbon();
      window.addEventListener("keydown", onKey);
      window.addEventListener("snap-ribbon:release", onRelease);
      cleanupKey = () => {
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("snap-ribbon:release", onRelease);
        cleanupKey = () => {}; // idempotent — release path may also run cleanup
      };
    })();

    return () => {
      cancelled = true;
      cancelAutoAdvance();
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
          srcSet={FRAME_SRCSET(15)}
          sizes="100vw"
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

  // Frame buffer style — base shared between A and B; opacity controlled by
  // crossFadeTo() at runtime (initial: A=1, B=0). object-position 50% 35%
  // on mobile shifts orb glow into upper third (§6.5).
  const frameBufferStyle: React.CSSProperties = {
    position: released ? "absolute" : "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    objectFit: "cover",
    zIndex: 0,
    pointerEvents: "none",
    willChange: "opacity",
    contain: "paint",
  };

  const scrimLayerStyle: React.CSSProperties = {
    position: released ? "absolute" : "fixed",
    inset: 0,
    zIndex: 1,
    pointerEvents: "none",
    willChange: "opacity",
    contain: "paint",
  };

  return (
    <>
      {/* Mobile object-position override — applied via class so it doesn't
          fight the runtime style mutations. */}
      <style>{`
        @media (max-width: ${MOBILE_MAX_PX}px) {
          [data-frame-bg] { object-position: 50% 35%; }
        }
        @media (min-width: ${MOBILE_MAX_PX + 1}px) {
          [data-frame-bg] { object-position: center; }
        }
      `}</style>

      {/* z=0 frame buffer A — primary, starts visible with f01. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={frameARef}
        src={FRAME_PATH(BEATS[0].frameRange[0])}
        srcSet={FRAME_SRCSET(BEATS[0].frameRange[0])}
        sizes="100vw"
        alt=""
        aria-hidden
        decoding="async"
        fetchPriority="high"
        data-frame-bg="A"
        style={{ ...frameBufferStyle, opacity: 1 }}
      />
      {/* z=0 frame buffer B — secondary, starts hidden. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={frameBRef}
        src=""
        alt=""
        aria-hidden
        decoding="async"
        data-frame-bg="B"
        style={{ ...frameBufferStyle, opacity: 0 }}
      />

      {/* z=1 scrim A — primary; bg recipe set per section, no `background`
          transition (only opacity), so paint-on-bg-change is one-shot. */}
      <div
        ref={scrimARef}
        aria-hidden
        data-scrim="A"
        style={{ ...scrimLayerStyle, opacity: 1 }}
      />
      {/* z=1 scrim B — secondary; opacity-blends to 1 on cross-section. */}
      <div
        ref={scrimBRef}
        aria-hidden
        data-scrim="B"
        style={{ ...scrimLayerStyle, opacity: 0 }}
      />

      {/* z=2 scene host — all scenes mounted; sequential fade out 300ms
          → in 300ms, NO overlap (delay on the IN transition equals the
          OUT duration so the next scene appears only after current is gone). */}
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
                  willChange: "opacity",
                  contain: "paint",
                  // IN transition starts after OUT finishes — sequential, no overlap.
                  transition: isActive
                    ? `opacity ${SCENE_FADE_IN_MS}ms ease ${SCENE_FADE_OUT_MS}ms`
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

      {/* z=3 persistent UI — aria-live status announces SECTION (not beat),
          since one wheel-tick = one section is the user's mental model now. */}
      <div aria-live="polite" className="sr-only" data-section-status>
        {`Section ${sectionStatusIdx + 1} of ${TOTAL_SECTIONS}: ${SECTIONS[sectionStatusIdx].id}`}
      </div>
    </>
  );
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Scene cell — single-screen container with relative positioning for its
 * own internal grid. The SnapRibbon's z=2 scene-host wraps each one and
 * controls visibility (opacity + pointer-events).
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
