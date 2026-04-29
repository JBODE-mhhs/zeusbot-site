"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { easeOut } from "@/lib/motion";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { CONTACT_MAILTO } from "@/lib/constants";

/**
 * Hero — scroll-pinned cinematic intro per scroll-choreography.md.
 *
 * 300vh of scroll → 30 WebP frames extracted from source.mp4 (2 fps × 15s),
 * scrubbed via GSAP ScrollTrigger. Why an image sequence and not <video>:
 * Cloudflare Pages does not serve video/mp4 with `Accept-Ranges: bytes` for
 * assets above ~5MB, so HTMLMediaElement.currentTime writes silently no-op
 * and the video is effectively unseekable. A pre-decimated frame strip
 * sidesteps the byte-range requirement entirely.
 *
 * 9 overlay anchors (A0-A8) drive text reveals as the strip advances.
 *
 * Three modes:
 *   1. Desktop + motion-OK (default): full pin + frame-scrub + 9-anchor overlays
 *   2. Reduced motion: ScrollTrigger.disable, mid-arc frame, A4-state overlays
 *      visible immediately, normal scroll past
 *   3. Mobile (≤768px): no pin, mid-arc frame as poster, fixed-timestamp
 *      Framer reveals
 */
const FRAME_COUNT = 30;
const FRAME_PATH = (i: number) =>
  `/frames/f${String(i).padStart(2, "0")}.webp`;

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const reduced = useReducedMotion();
  const [scrollPct, setScrollPct] = useState(reduced ? 0.5 : 0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Preload all frames into the browser cache so scrub doesn't pop.
  // Deferred behind requestIdleCallback so the 30 frame fetches don't
  // compete with the LCP image (frame 1) for first-paint bandwidth.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const cache: HTMLImageElement[] = [];
    const preload = () => {
      for (let i = 2; i <= FRAME_COUNT; i++) {
        const img = new Image();
        img.src = FRAME_PATH(i);
        cache.push(img);
      }
    };
    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    };
    const w = window as IdleWindow;
    let timer = 0;
    if (typeof w.requestIdleCallback === "function") {
      w.requestIdleCallback(preload, { timeout: 2000 });
    } else {
      timer = window.setTimeout(preload, 800);
    }
    return () => {
      if (timer) clearTimeout(timer);
      cache.length = 0;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (reduced || isMobile) return;

    const section = sectionRef.current;
    const img = imgRef.current;
    if (!section || !img) return;

    let ctx: { revert: () => void } | null = null;
    let st: { kill: () => void } | null = null;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      gsap.registerPlugin(ScrollTrigger);

      let lastFrame = -1;
      ctx = gsap.context(() => {
        st = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "+=300%",
          pin: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            setScrollPct(p);
            const frame = Math.min(
              FRAME_COUNT,
              Math.max(1, Math.round(p * (FRAME_COUNT - 1)) + 1),
            );
            if (frame !== lastFrame) {
              img.src = FRAME_PATH(frame);
              lastFrame = frame;
            }
          },
        });
      }, section);
    })();

    return () => {
      st?.kill();
      ctx?.revert();
    };
  }, [reduced, isMobile]);

  // Anchor visibility helpers — see scroll-choreography.md §2-§3 timeline
  const eyebrowOpacity = pctIn(scrollPct, 0, 0.62);
  const line1Opacity = dimAfter(pctIn(scrollPct, 0, 0.62), scrollPct, 0.5);
  const line2Opacity = dimAfter(pctIn(scrollPct, 0.12, 0.62), scrollPct, 0.5);
  const lines34Opacity = dimAfter(pctIn(scrollPct, 0.25, 0.62), scrollPct, 0.5);
  const subOpacity = dimAfter(pctIn(scrollPct, 0.38, 0.62), scrollPct, 0.5);
  const ctaOpacity = pctIn(scrollPct, 0.5, 1);
  const finalTaglineOpacity = pctIn(scrollPct, 0.75, 1);
  const continueGlyphOpacity = pctIn(scrollPct, 0.88, 1);

  // In mobile/reduced mode, show overlay at A4 state (full reveal).
  const useStaticOverlays = reduced || isMobile;

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative h-screen w-full overflow-hidden bg-ink-deep"
      aria-label="ZeusBot — a fleet of agents"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={
          reduced || isMobile
            ? FRAME_PATH(Math.round(FRAME_COUNT / 2))
            : FRAME_PATH(1)
        }
        alt=""
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 w-full h-full object-cover -z-10"
        aria-hidden
      />
      {/* Tonal scrim — keeps left-rail text legible over bright video frames */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-deep/85 via-ink-deep/55 to-transparent"
        aria-hidden
      />

      <div className="relative h-full max-w-[1280px] mx-auto px-6 lg:px-12 flex items-center">
        <div className="max-w-[640px] grid gap-6 pt-32">
          <motion.span
            style={{ opacity: useStaticOverlays ? 1 : eyebrowOpacity }}
            initial={useStaticOverlays ? false : { opacity: 0, y: 8 }}
            animate={useStaticOverlays ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.6, ease: easeOut }}
            className="eyebrow"
          >
            ZEUSBOT — A FLEET OF AGENTS
          </motion.span>

          <h1
            className="font-display text-sand"
            style={{
              fontSize: "var(--display)",
              lineHeight: 1.02,
              textShadow: "0 1px 16px rgba(0,0,0,0.6)",
            }}
          >
            <motion.span
              style={{ opacity: useStaticOverlays ? 1 : line1Opacity, display: "block" }}
              initial={useStaticOverlays ? false : { y: 16, opacity: 0 }}
              animate={useStaticOverlays ? { y: 0, opacity: 1 } : undefined}
              transition={{ duration: 0.7, delay: 0.5, ease: easeOut }}
            >
              Some problems
            </motion.span>
            <motion.span
              style={{ opacity: useStaticOverlays ? 1 : line2Opacity, display: "block" }}
              initial={useStaticOverlays ? false : { y: 16, opacity: 0 }}
              animate={useStaticOverlays ? { y: 0, opacity: 1 } : undefined}
              transition={{ duration: 0.7, delay: 0.9, ease: easeOut }}
            >
              take a <em>fleet</em>.
            </motion.span>
            <motion.span
              style={{ opacity: useStaticOverlays ? 1 : lines34Opacity, display: "block" }}
              initial={useStaticOverlays ? false : { y: 16, opacity: 0 }}
              animate={useStaticOverlays ? { y: 0, opacity: 1 } : undefined}
              transition={{ duration: 0.7, delay: 1.3, ease: easeOut }}
            >
              We forge the agents
            </motion.span>
            <motion.span
              style={{ opacity: useStaticOverlays ? 1 : lines34Opacity, display: "block" }}
              initial={useStaticOverlays ? false : { y: 16, opacity: 0 }}
              animate={useStaticOverlays ? { y: 0, opacity: 1 } : undefined}
              transition={{ duration: 0.7, delay: 1.4, ease: easeOut }}
            >
              that ship the work.
            </motion.span>
          </h1>

          <motion.p
            style={{
              opacity: useStaticOverlays ? 1 : subOpacity,
              textShadow: "0 1px 12px rgba(0,0,0,0.5)",
            }}
            initial={useStaticOverlays ? false : { opacity: 0 }}
            animate={useStaticOverlays ? { opacity: 1 } : undefined}
            transition={{ duration: 0.7, delay: 2.0, ease: easeOut }}
            className="text-sand/85 max-w-[540px]"
          >
            ZeusBot is agentic AI as a service for small business — a coordinated
            fleet of specialists, always on, always shipping.
          </motion.p>

          <motion.div
            style={{ opacity: useStaticOverlays ? 1 : ctaOpacity }}
            initial={useStaticOverlays ? false : { opacity: 0 }}
            animate={useStaticOverlays ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7, delay: 4.0, ease: easeOut }}
            className="flex flex-wrap gap-3 mt-2"
          >
            <a
              href={CONTACT_MAILTO}
              className={buttonVariants({ variant: "primary", size: "lg" })}
            >
              Request demo
            </a>
            <Dialog>
              <DialogTrigger
                className={buttonVariants({ variant: "ghost", size: "lg" })}
              >
                Watch the fleet
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Watch the fleet</DialogTitle>
                <div className="aspect-video w-full overflow-hidden rounded-xl border border-hairline-up bg-ink-deep">
                  <video
                    src="/source.mp4"
                    poster="/poster.webp"
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Final tagline — appears at A6 (75%), Sent forth */}
          {!useStaticOverlays && (
            <motion.div
              style={{ opacity: finalTaglineOpacity }}
              className="font-display text-sand text-3xl mt-8"
            >
              <em>Sent forth.</em>
            </motion.div>
          )}

          {/* Continue glyph — appears at A7 (88%) */}
          {!useStaticOverlays && (
            <motion.div
              style={{ opacity: continueGlyphOpacity }}
              className="eyebrow text-gold-orb mt-4"
            >
              ↓ Continue
            </motion.div>
          )}

          {useStaticOverlays && (
            <div className="eyebrow mt-12">↓ Scroll</div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Linear ramp 0→1 over [start, end], clamped outside.
 * Used to compute overlay opacity from scroll progress.
 */
function pctIn(p: number, start: number, end: number): number {
  if (p < start) return 0;
  if (p > end) return 1;
  return (p - start) / (end - start);
}

/**
 * Dim a fully-revealed overlay to 60% past `dimAt`, then fade to 0 by 0.62.
 * Returns the input opacity multiplier composed with the dim/fade curve.
 */
function dimAfter(opacity: number, scrollPct: number, dimAt: number): number {
  if (scrollPct <= dimAt) return opacity;
  if (scrollPct >= 0.62) return 0;
  // Linear from 1.0 → 0.6 between dimAt and 0.55, then 0.6 → 0 between 0.55 and 0.62
  if (scrollPct <= 0.55) {
    const t = (scrollPct - dimAt) / (0.55 - dimAt);
    return opacity * (1 - 0.4 * t);
  }
  const t = (scrollPct - 0.55) / (0.62 - 0.55);
  return opacity * 0.6 * (1 - t);
}
