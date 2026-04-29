"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

/**
 * FrameCanvas — single fixed canvas (z:1) that draws preloaded Image() bitmaps
 * via ctx.drawImage on every ScrollTrigger update. Per scroll-choreography.md
 * v6 §2.0 + §3.4 (canvas, not <img>.src mutation — sub-millisecond GPU-blit on
 * every scroll-tick avoids the 60Hz decode-storm that <img>.src= produces).
 *
 * v6.1 spec: 240 WebP frames at q72/q76/q80 srcset (720/1080/1440), 16fps
 * × 15s source partitioned 60/60/60/60 across hero/value/proof/cta. Preloaded into
 * Image() objects on mount; drawFrame(idx) is called from each section's
 * paused timeline via gsap onUpdate and short-circuits when idx unchanged
 * (§3.4 — avoids GPU spam between ticks).
 */

export const TOTAL_FRAMES = 240;

const frameHref = (i: number, breakpoint: 720 | 1080 | 1440) => {
  const n = String(i).padStart(3, "0");
  return breakpoint === 1440
    ? `/frames/f${n}.webp`
    : `/frames/f${n}-${breakpoint}.webp`;
};

const frameSrcSet = (i: number) => {
  const n = String(i).padStart(3, "0");
  return `/frames/f${n}-720.webp 720w, /frames/f${n}-1080.webp 1080w, /frames/f${n}.webp 1440w`;
};

export interface FrameCanvasHandle {
  /** Draw frame at 1-indexed position (1..60). Clamps + no-ops if image not yet decoded.
   *  Short-circuits if idx === lastDrawnIdx (spec §3.4). */
  drawFrame: (idx: number) => void;
  /** Recompute canvas dimensions to match viewport × DPR (debounced caller). */
  resize: () => void;
  /** Decode f01 only — resolves as soon as the LCP frame is paintable.
   *  Spec §7.1: f01 paint must land inside the LCP window. */
  preloadFirstFrame: () => Promise<void>;
  /** Decode f02..f27 in the background — fire-and-forget after first paint. */
  preloadRemainingFrames: () => void;
}

export const FrameCanvas = forwardRef<FrameCanvasHandle>(function FrameCanvas(
  _props,
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const dprRef = useRef(1);
  const lastDrawnIdxRef = useRef<number>(-1);

  useImperativeHandle(
    ref,
    () => ({
      drawFrame(idx: number) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const clamped = Math.min(TOTAL_FRAMES, Math.max(1, idx | 0));
        // Spec §3.4 — short-circuit if idx unchanged so pin-idle (and the
        // many redundant onUpdate ticks during slow scroll) don't re-blit.
        if (clamped === lastDrawnIdxRef.current) return;

        // alpha:true so the canvas stays transparent until first drawImage
        // (the SSR f01 backdrop must show through during the brief gap
        // between hydration and first paint). Perf cost is negligible —
        // drawImage cover-crop overwrites the full surface every tick.
        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

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
        lastDrawnIdxRef.current = clamped;
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
        // Resetting backing store invalidates the prior draw — force redraw
        // on next ScrollTrigger tick by clearing the short-circuit guard.
        lastDrawnIdxRef.current = -1;
      },
      async preloadFirstFrame() {
        if (imagesRef.current.length) {
          // Already populated — first frame may already be decoded
          const existing = imagesRef.current[1];
          if (existing?.complete && existing.naturalWidth > 0) return;
        } else {
          imagesRef.current = new Array(TOTAL_FRAMES + 1);
        }
        const img = new Image();
        img.decoding = "async";
        img.srcset = frameSrcSet(1);
        img.sizes = "100vw";
        img.src = frameHref(1, 1080);
        imagesRef.current[1] = img;
        await img.decode().catch(() => undefined);
      },
      preloadRemainingFrames() {
        if (!imagesRef.current.length) {
          imagesRef.current = new Array(TOTAL_FRAMES + 1);
        }
        for (let i = 2; i <= TOTAL_FRAMES; i++) {
          if (imagesRef.current[i]) continue;
          const img = new Image();
          img.decoding = "async";
          img.srcset = frameSrcSet(i);
          img.sizes = "100vw";
          img.src = frameHref(i, 1080);
          imagesRef.current[i] = img;
          // Fire-and-forget decode; drawFrame() guards on img.complete
          img.decode().catch(() => undefined);
        }
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
        // z:1 sits above the SSR f01 backdrop (z:0). Canvas is transparent
        // until first drawFrame; the SSR image shows through and serves as
        // the LCP candidate. Section content overlays both at z:[1-2] inside
        // each <section data-section> stacking context.
        zIndex: 1,
        pointerEvents: "none",
      }}
    />
  );
});
