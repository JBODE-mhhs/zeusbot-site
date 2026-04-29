/**
 * Frame player — v4 dual A/B buffer with cross-fade.
 *
 * Spec: scroll-choreography.md §1.4 + §2.1.
 *
 * Two <img> elements (data-frame-bg="A" / "B") are mounted for the entire
 * ribbon lifetime, both position:fixed inset:0 will-change:opacity contain:paint.
 * crossFadeTo() loads the next frame into the inactive buffer, awaits decode,
 * then opacity-blends the buffers over CROSS_FADE_MS. Old hard-cut src= mutation
 * (v3) is gone — the cross-fade is the cinematic continuity layer.
 *
 * Frame-stride playback (playFrameRangeAB) walks a frame range using crossFadeTo()
 * per step; overlapping fades produce continuous motion (no slideshow stutter).
 */

export const FRAME_PATH = (i: number) =>
  `/frames/f${String(i).padStart(2, "0")}.webp`;

export const FRAME_SRCSET = (i: number) => {
  const n = String(i).padStart(2, "0");
  return `/frames/f${n}-720.webp 720w, /frames/f${n}-1080.webp 1080w, /frames/f${n}.webp 1440w`;
};

export const CROSS_FADE_MS = 120;
/** Beat-window total duration retained for caller pacing (overlay timelines, scrim). */
export const BEAT_DURATION_MS = 600;

export interface FrameBufferRefs {
  /** Two img elements — both stay mounted; we mutate src + opacity only. */
  a: HTMLImageElement;
  b: HTMLImageElement;
  /** Active buffer key — mutates between "A" and "B" as cross-fades complete. */
  activeRef: { current: "A" | "B" };
}

/**
 * Load `frameIdx` into the inactive buffer, await decode, then opacity-flip
 * over CROSS_FADE_MS. Resolves once the new frame is live (active buffer
 * has flipped). Both buffers' opacity transition is set inline to keep the
 * timing source-of-truth in this module (CSS transitions don't have a
 * cross-fade timing function — overlapping opacity transitions on both
 * buffers produce a true cross-fade rather than a fade-to-black).
 */
export async function crossFadeTo(
  bufs: FrameBufferRefs,
  frameIdx: number,
): Promise<void> {
  const active = bufs.activeRef.current === "A" ? bufs.a : bufs.b;
  const inactive = bufs.activeRef.current === "A" ? bufs.b : bufs.a;

  const nextSrc = FRAME_PATH(frameIdx);
  inactive.srcset = FRAME_SRCSET(frameIdx);
  inactive.src = nextSrc;

  // decode() returns once the bitmap is decoded into a paintable layer;
  // this avoids the visible flash that `src=` alone produces when the
  // browser swaps before the new image is decoded.
  try {
    await inactive.decode();
  } catch {
    // decode() can reject on malformed images or aborted loads; falling
    // through still cross-fades the (possibly broken) buffer rather than
    // hard-stalling the ribbon. preload chain in layout.tsx + sharp output
    // are the upstream guard against this.
  }

  inactive.style.transition = `opacity ${CROSS_FADE_MS}ms ease`;
  active.style.transition = `opacity ${CROSS_FADE_MS}ms ease`;
  inactive.style.opacity = "1";
  active.style.opacity = "0";

  await wait(CROSS_FADE_MS);
  bufs.activeRef.current = bufs.activeRef.current === "A" ? "B" : "A";
}

/**
 * Walk a frame range from `fromIdx` → `toIdx` (inclusive) via crossFadeTo().
 * Stride spans over the beat window with overlap (each cross-fade starts
 * before the previous fully completes via setTimeout). Reverse iteration
 * supported via fromIdx > toIdx for backward gestures.
 *
 * v4 cadence: distribute (toIdx-fromIdx+1) cross-fades across BEAT_DURATION_MS;
 * when range is small (1-2 frames) the stride may be longer than CROSS_FADE_MS
 * and naturally produces a held-frame feel. When range is large (4 frames),
 * stride compresses to ~150ms which is just longer than CROSS_FADE_MS=120 →
 * minor overlap is fine and produces continuous motion.
 */
export async function playFrameRangeAB(
  bufs: FrameBufferRefs,
  fromIdx: number,
  toIdx: number,
): Promise<void> {
  if (fromIdx === toIdx) {
    await crossFadeTo(bufs, fromIdx);
    return;
  }

  const forward = toIdx > fromIdx;
  const indices: number[] = [];
  if (forward) {
    for (let i = fromIdx; i <= toIdx; i++) indices.push(i);
  } else {
    for (let i = fromIdx; i >= toIdx; i--) indices.push(i);
  }
  if (indices.length === 0) return;

  const stepMs = Math.max(CROSS_FADE_MS, BEAT_DURATION_MS / indices.length);
  for (let i = 0; i < indices.length; i++) {
    const idx = indices[i];
    if (i === 0) {
      // First frame in the range — cross-fade in place; fromIdx is already
      // the active buffer's src in the steady state, so this swaps to the
      // first incremental frame.
      await crossFadeTo(bufs, idx);
    } else {
      await crossFadeTo(bufs, idx);
    }
    if (i < indices.length - 1) {
      await wait(Math.max(0, stepMs - CROSS_FADE_MS));
    }
  }
}

/**
 * v4 jump-cut helper (§3.4): instantaneous swap to `frameIdx` with no
 * transition. Used when a user wheel-tick interrupts mid-section auto-advance
 * — we slam the active buffer to the section's terminal frame, then a normal
 * crossFadeTo() drives the cross-section transition's first frame from there.
 */
export function jumpCutTo(bufs: FrameBufferRefs, frameIdx: number) {
  const active = bufs.activeRef.current === "A" ? bufs.a : bufs.b;
  const inactive = bufs.activeRef.current === "A" ? bufs.b : bufs.a;
  active.style.transition = "none";
  inactive.style.transition = "none";
  active.srcset = FRAME_SRCSET(frameIdx);
  active.src = FRAME_PATH(frameIdx);
  active.style.opacity = "1";
  inactive.style.opacity = "0";
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * JS-side prefetch helper for v4 Tier 3 frames (f16-f27). Called by
 * SnapRibbon after Hero B4 plays (~3.2s post-mount); injects
 * <link rel="prefetch"> elements into <head> rather than firing new Image()
 * (prefetch is lower priority than the Image() loader and respects the
 * browser's network scheduler under contention with the user gesture).
 */
export function prefetchFrames(fromIdx: number, toIdx: number): void {
  if (typeof document === "undefined") return;
  for (let i = fromIdx; i <= toIdx; i++) {
    const n = String(i).padStart(2, "0");
    // Skip if a preload/prefetch link already exists for this frame.
    if (document.querySelector(`link[href="/frames/f${n}-720.webp"]`)) continue;
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "image";
    link.href = `/frames/f${n}-720.webp`;
    link.setAttribute(
      "imagesrcset",
      `/frames/f${n}-720.webp 720w, /frames/f${n}-1080.webp 1080w, /frames/f${n}.webp 1440w`,
    );
    link.setAttribute("imagesizes", "100vw");
    document.head.appendChild(link);
  }
}

/**
 * Legacy preload helper retained for any callsite still using v3-style
 * Image() warm-up. No-op if the frame already has a <link> in <head>.
 */
export function preloadFrames(fromIdx: number, toIdx: number): Promise<void> {
  const promises: Promise<void>[] = [];
  for (let i = fromIdx; i <= toIdx; i++) {
    promises.push(
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = FRAME_PATH(i);
      }),
    );
  }
  return Promise.all(promises).then(() => undefined);
}
