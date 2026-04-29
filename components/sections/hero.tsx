"use client";

import { useReducedMotion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { CONTACT_MAILTO } from "@/lib/constants";

/**
 * Hero scene (v2 SnapRibbon).
 *
 * Renders the hero frame as a single <img data-hero-img> swapped by
 * SnapRibbon's frame-player on each hero beat (B1..B4). Overlays are
 * tagged with data-beat (which beat reveals them) + data-overlay (semantic
 * role); SnapRibbon queries these and animates them on the corresponding
 * beat's enter timeline.
 *
 * Reduced motion: all overlays render at final state, frame is f15
 * (mid-arc poster), no animation runs. SnapRibbon handles the gating —
 * this component just respects the same prefers-reduced-motion media
 * query for its own initial-render decisions.
 */

const INITIAL_FRAME = "/frames/f01.webp";
const REDUCED_FRAME = "/frames/f15.webp";

export function Hero() {
  const reduced = useReducedMotion();
  const initialOpacity = reduced ? "opacity-100" : "opacity-0";

  return (
    <div
      data-scene-content="hero"
      className="relative h-full w-full overflow-hidden bg-ink-deep"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-hero-img
        src={reduced ? REDUCED_FRAME : INITIAL_FRAME}
        alt=""
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 w-full h-full object-cover -z-10"
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-deep/85 via-ink-deep/55 to-transparent"
        aria-hidden
      />

      <div className="relative h-full max-w-[1280px] mx-auto px-6 lg:px-12 flex items-center">
        <div className="max-w-[640px] grid gap-6 pt-32">
          <span
            data-beat="B1"
            data-overlay="eyebrow"
            className={`eyebrow ${initialOpacity}`}
          >
            ZEUSBOT — A FLEET OF AGENTS
          </span>

          <h1
            data-overlay="headline"
            className="font-display text-sand"
            style={{
              fontSize: "var(--display)",
              lineHeight: 1.02,
              textShadow: "0 1px 16px rgba(0,0,0,0.6)",
            }}
          >
            <span
              data-beat="B1"
              data-overlay="line-1"
              className={`block ${initialOpacity}`}
            >
              Some problems
            </span>
            <span
              data-beat="B2"
              data-overlay="line-2"
              className={`block ${initialOpacity}`}
            >
              take a <em>fleet</em>.
            </span>
            <span
              data-beat="B2"
              data-overlay="line-3"
              className={`block ${initialOpacity}`}
            >
              We forge the agents
            </span>
            <span
              data-beat="B2"
              data-overlay="line-4"
              className={`block ${initialOpacity}`}
            >
              that ship the work.
            </span>
          </h1>

          <p
            data-beat="B3"
            data-overlay="sub"
            className={`text-sand/85 max-w-[540px] ${initialOpacity}`}
            style={{ textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}
          >
            ZeusBot is agentic AI as a service for small business — a
            coordinated fleet of specialists, always on, always shipping.
          </p>

          <div
            data-beat="B3"
            data-overlay="cta"
            className={`flex flex-wrap gap-3 mt-2 ${initialOpacity}`}
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
          </div>

          <div
            data-beat="B4"
            data-overlay="tagline-end"
            className={`font-display text-sand text-3xl mt-8 ${initialOpacity}`}
          >
            <em>Sent forth.</em>
          </div>

          <div
            data-beat="B4"
            data-overlay="continue"
            className={`eyebrow text-gold-orb mt-4 ${initialOpacity}`}
          >
            ↓ Continue
          </div>
        </div>
      </div>
    </div>
  );
}
