/**
 * Hero frame-cycle helper — plays /frames/fNN.webp from→to at fixed cadence.
 *
 * Spec §2: each hero beat advances 7 frames over 600ms (≈85ms per swap).
 * The cadence is locked to the beat duration regardless of gesture rate so
 * the experience reads as cinematic playback, not free scrub.
 *
 * Returns a Promise that resolves when the final frame has been displayed
 * for one full step. Reverse iteration is supported via from > to.
 */
export const FRAME_PATH = (i: number) =>
  `/frames/f${String(i).padStart(2, "0")}.webp`;

export const HERO_FRAME_BEAT_MS = 600;

export async function playHeroFrames(
  imgEl: HTMLImageElement,
  fromIdx: number,
  toIdx: number,
): Promise<void> {
  const forward = toIdx >= fromIdx;
  const indices: number[] = [];
  if (forward) {
    for (let i = fromIdx; i <= toIdx; i++) indices.push(i);
  } else {
    for (let i = fromIdx; i >= toIdx; i--) indices.push(i);
  }
  if (indices.length === 0) return;

  const stepMs = HERO_FRAME_BEAT_MS / indices.length;
  for (const idx of indices) {
    imgEl.src = FRAME_PATH(idx);
    await wait(stepMs);
  }
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Preload a frame range into browser cache. Fire-and-forget; the returned
 * Promise resolves when all frames have completed loading (or errored).
 *
 * Used by SnapRibbon to warm B1's frame range immediately on mount, with
 * subsequent ranges deferred behind requestIdleCallback (spec §7).
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
