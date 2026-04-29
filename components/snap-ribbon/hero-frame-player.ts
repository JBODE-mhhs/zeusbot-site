/**
 * Frame-cycle helper — plays /frames/fNN.webp from→to at a fixed cadence.
 *
 * v3 model (scroll-choreography.md §2.1): the 27-frame sequence is the
 * continuous backdrop across all 11 beats. Each beat advances a sub-range
 * over its 600ms transition window:
 *   - Hero beats (4 frames)        → 150ms per swap
 *   - 2-frame content beats        → 300ms per swap
 *   - Single-frame beats (B9, B10) → swap once, hold for full 600ms
 * Reverse iteration is supported via fromIdx > toIdx (used on backward
 * gestures).
 */
export const FRAME_PATH = (i: number) =>
  `/frames/f${String(i).padStart(2, "0")}.webp`;

export const BEAT_DURATION_MS = 600;

export async function playFrameRange(
  imgEl: HTMLImageElement,
  fromIdx: number,
  toIdx: number,
): Promise<void> {
  // Single-frame beat — swap once, no await loop. Caller's beat-duration
  // timer holds the frame on screen for the full 600ms.
  if (fromIdx === toIdx) {
    imgEl.src = FRAME_PATH(fromIdx);
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

  const stepMs = BEAT_DURATION_MS / indices.length;
  for (const idx of indices) {
    imgEl.src = FRAME_PATH(idx);
    await wait(stepMs);
  }
}

/** v2 alias — preserved for any lingering hero-only callsites. */
export const playHeroFrames = playFrameRange;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Preload a frame range into the byte cache. Fire-and-forget; the returned
 * Promise resolves when all frames have completed loading (or errored).
 *
 * v3 §7: the full f01..f27 sequence is preload-chained from <head> via
 * app/layout.tsx (eager f01–f08, low-priority f09–f27); this helper is
 * retained for any opportunistic warm-up the SnapRibbon wants to fire after
 * mount as a belt-and-braces measure on slow connections.
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
