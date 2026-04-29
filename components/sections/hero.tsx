import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { CONTACT_MAILTO } from "@/lib/constants";

/**
 * Hero scene — v4 LCP-friendly markup. All B1-B4 overlays render
 * SSR-visible (no opacity-0 class) so the hero headline is the LCP
 * candidate at first paint. The "rise" reveal animates y-translate only
 * (reveal.ts §3); SnapRibbon's per-beat enter timeline drives the rise.
 *
 * The cinematic frame backdrop is owned by SnapRibbon at z=0 (persistent
 * across all 11 beats) — this component renders TEXT ONLY over a
 * transparent surface, with text-shadow handling contrast against the
 * brightest pixel of the hero range (f01-f15).
 */

export function Hero() {

  return (
    <div className="relative h-full w-full">
      <div className="relative h-full max-w-[1280px] mx-auto px-6 lg:px-12 flex items-center">
        <div className="max-w-[640px] grid gap-6 pt-32">
          <span
            data-beat="B1"
            data-overlay="eyebrow"
            className="eyebrow"
          >
            ZEUSBOT — A FLEET OF AGENTS
          </span>

          <h1
            data-overlay="headline"
            className="font-display text-sand"
            style={{
              fontSize: "var(--display)",
              lineHeight: 1.02,
              textShadow: "0 1px 16px rgba(25, 12, 12, 0.7)",
            }}
          >
            <span
              data-beat="B1"
              data-overlay="line-1"
              className="block"
            >
              Some problems
            </span>
            <span
              data-beat="B2"
              data-overlay="line-2"
              className="block"
            >
              take a <em>fleet</em>.
            </span>
            <span
              data-beat="B2"
              data-overlay="line-3"
              className="block"
            >
              We forge the agents
            </span>
            <span
              data-beat="B2"
              data-overlay="line-4"
              className="block"
            >
              that ship the work.
            </span>
          </h1>

          <p
            data-beat="B3"
            data-overlay="sub"
            className="text-sand/85 max-w-[540px]"
            style={{ textShadow: "0 1px 12px rgba(25, 12, 12, 0.6)" }}
          >
            ZeusBot is agentic AI as a service for small business — a
            coordinated fleet of specialists, always on, always shipping.
          </p>

          <div
            data-beat="B3"
            data-overlay="cta"
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
          </div>

          <div
            data-beat="B4"
            data-overlay="tagline-end"
            className="font-display text-sand text-3xl mt-8"
            style={{ textShadow: "0 1px 12px rgba(25, 12, 12, 0.6)" }}
          >
            <em>Sent forth.</em>
          </div>

          <div
            data-beat="B4"
            data-overlay="continue"
            className="eyebrow text-gold-orb mt-4"
          >
            ↓ Continue
          </div>
        </div>
      </div>
    </div>
  );
}
