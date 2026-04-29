import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { CONTACT_MAILTO } from "@/lib/constants";
import { SCRIM_RECIPES } from "@/components/scroll/scrimRecipes";

/**
 * Hero scene — v5 pin+scrub. All overlays SSR with opacity:1 and no inline
 * transform; HeroPin attaches a scrub:true GSAP timeline that fires reveal
 * tweens at scroll-progress thresholds (no autoplay, no immediateRender, no
 * hydrate-flash class). See scroll-choreography.md §4.
 *
 * Scrim is `none` for hero (text uses text-shadow for contrast against the
 * brightest hero frames f01–f15).
 */
export function Hero() {
  return (
    <section
      data-section="hero"
      className="relative h-screen w-full overflow-hidden"
    >
      <div
        data-scrim
        aria-hidden
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: SCRIM_RECIPES.hero }}
      />
      <div className="relative z-[2] h-full max-w-[1280px] mx-auto px-6 lg:px-12 flex items-center">
        <div className="max-w-[640px] grid gap-6 pt-32">
          <span data-beat="B1" data-overlay="eyebrow" className="eyebrow">
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
            <span data-beat="B1" data-overlay="line-1" className="block">
              Some problems
            </span>
            <span data-beat="B2" data-overlay="line-2" className="block">
              take a <em>fleet</em>.
            </span>
            <span data-beat="B2" data-overlay="line-3" className="block">
              We forge the agents
            </span>
            <span data-beat="B2" data-overlay="line-4" className="block">
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
    </section>
  );
}
