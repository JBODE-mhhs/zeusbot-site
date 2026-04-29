"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

/**
 * FrameCanvas — single fixed canvas (z-0) that draws preloaded Image() bitmaps
 * via ctx.drawImage on every ScrollTrigger update. Per scroll-choreography.md
 * §3 (canvas, not <img>.src mutation — sub-millisecond GPU-blit on every
 * scroll-tick avoids the 60Hz decode-storm that <img>.src= produces).
 *
 * Spec: 27 WebP frames, q72 mobile / q80 desktop srcset. Preloaded into
 * Image() objects on mount; drawFrame(idx) is called from ScrollEngine's
 * global-progress ScrollTrigger.
 */

const TOTAL_FRAMES = 27;

const frameHref = (i: number, breakpoint: 720 | 1080 | 1440) => {
  const n = String(i).padStart(2, "0");
  return breakpoint === 1440
    ? `/frames/f${n}.webp`
    : `/frames/f${n}-${breakpoint}.webp`;
};

const frameSrcSet = (i: number) => {
  const n = String(i).padStart(2, "0");
  return `/frames/f${n}-720.webp 720w, /frames/f${n}-1080.webp 1080w, /frames/f${n}.webp 1440w`;
};

export interface FrameCanvasHandle {
  /** Draw frame at 1-indexed position (1..27). Clamps + no-ops if image not yet decoded. */
  drawFrame: (idx: number) => void;
  /** Recompute canvas dimensions to match viewport × DPR (debounced caller). */
  resize: () => void;
  /** Kick off Image() decode for all 27 frames at the active breakpoint. */
  preloadFrames: () => Promise<void>;
}

export const FrameCanvas = forwardRef<FrameCanvasHandle>(function FrameCanvas(
  _props,
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const dprRef = useRef(1);

  useImperativeHandle(
    ref,
    () => ({
      drawFrame(idx: number) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        const clamped = Math.min(TOTAL_FRAMES, Math.max(1, idx | 0));
        const img = imagesRef.current[clamped];
        if (!img || !img.complete || img.naturalWidth === 0) return;

        const cw = canvas.width;
        const ch = canvas.height;
        const ratio = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
        const w = img.naturalWidth * ratio;
        const h = img.naturalHeight * ratio;
        const x = (cw - w) / 2;
        const y = (ch - h) / 2;
        ctx.drawImage(img, x, y, w, h);
      },
      resize() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        dprRef.current = dpr;
        canvas.width = Math.round(window.innerWidth * dpr);
        canvas.height = Math.round(window.innerHeight * dpr);
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
      },
      async preloadFrames() {
        if (imagesRef.current.length) return;
        const arr: HTMLImageElement[] = new Array(TOTAL_FRAMES + 1);
        const promises: Promise<void>[] = [];
        for (let i = 1; i <= TOTAL_FRAMES; i++) {
          const img = new Image();
          img.decoding = "async";
          img.srcset = frameSrcSet(i);
          img.sizes = "100vw";
          img.src = frameHref(i, 1080);
          arr[i] = img;
          promises.push(
            img
              .decode()
              .catch(() => undefined)
              .then(() => undefined),
          );
        }
        imagesRef.current = arr;
        await Promise.all(promises);
      },
    }),
    [],
  );

  return (
    <canvas
      ref={canvasRef}
      data-frame-canvas
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
});
