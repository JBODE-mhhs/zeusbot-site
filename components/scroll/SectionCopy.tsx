import type { gsap as GsapType } from "gsap";

/**
 * SectionCopy — three scroll-anchored copy blocks (Hero / Value / CTA) per
 * scroll-choreography.md v6.1. Each section is a normal-flow `min-h-screen`
 * block participating in `scroll-snap-type: y mandatory`. ScrollTrigger
 * fires onEnter/onEnterBack to play the section's paused 5s timeline
 * (`tl.restart()`); native scroll handles snap and momentum.
 *
 * No `absolute inset-0` overlay — sections stack vertically, and only one
 * is in viewport at a time courtesy of scroll-snap.
 *
 * Initial copy state for value/cta is hidden via inline style so SSR doesn't
 * flash before hydrate; hero copy is visible from SSR (it's the first
 * paint and its timeline plays a native fade-up on mount).
 */

const HERO_COPY = {
  eyebrow: "ZeusBot",
  headline: "Some problems take a fleet.",
  sub: "We forge agents that ship the work.",
};

const VALUE_COPY = {
  eyebrow: "What it does",
  headline: "Always on. Always shipping.",
  sub: "A coordinated fleet of specialists, working in parallel — not a single agent on a single thread.",
};

const PROOF_COPY = {
  eyebrow: "Trusted by builders",
  headline: "Ships while you sleep.",
  sub: "Real agents, real results — without adding headcount.",
};

const CTA_COPY = {
  eyebrow: "Pricing",
  headline: "From $99 / month.",
  sub: "Start free for 14 days. No credit card.",
  cta: "Request demo",
};

const HIDDEN_INITIAL_STYLE: React.CSSProperties = {
  opacity: 0,
  transform: "translateY(24px)",
};

export function SectionCopy() {
  return (
    <>
      <section
        data-section="hero"
        className="relative w-full min-h-screen flex items-center"
      >
        <div className="relative z-[2] w-full max-w-[1280px] mx-auto px-6 lg:px-12">
          <div data-overlay="copy" className="max-w-[640px] grid gap-6">
            <span className="eyebrow">{HERO_COPY.eyebrow}</span>
            <h1
              className="font-display text-sand"
              style={{
                fontSize: "var(--display)",
                lineHeight: 1.02,
                textShadow: "0 1px 16px rgba(25, 12, 12, 0.7)",
              }}
            >
              {HERO_COPY.headline}
            </h1>
            <p
              className="text-sand/85 max-w-[540px]"
              style={{ textShadow: "0 1px 12px rgba(25, 12, 12, 0.6)" }}
            >
              {HERO_COPY.sub}
            </p>
          </div>
        </div>
      </section>

      <section
        data-section="value"
        className="relative w-full min-h-screen flex items-center"
      >
        <div className="relative z-[2] w-full max-w-[1280px] mx-auto px-6 lg:px-12">
          <div
            data-overlay="copy"
            className="max-w-[640px] grid gap-6"
            style={HIDDEN_INITIAL_STYLE}
          >
            <span className="eyebrow">{VALUE_COPY.eyebrow}</span>
            <h2
              className="font-display text-sand"
              style={{
                fontSize: "var(--display)",
                lineHeight: 1.02,
                textShadow: "0 1px 16px rgba(25, 12, 12, 0.7)",
              }}
            >
              {VALUE_COPY.headline}
            </h2>
            <p
              className="text-sand/85 max-w-[540px]"
              style={{ textShadow: "0 1px 12px rgba(25, 12, 12, 0.6)" }}
            >
              {VALUE_COPY.sub}
            </p>
          </div>
        </div>
      </section>

      <section
        data-section="proof"
        className="relative w-full min-h-screen flex items-center"
      >
        <div className="relative z-[2] w-full max-w-[1280px] mx-auto px-6 lg:px-12">
          <div
            data-overlay="copy"
            className="max-w-[640px] grid gap-6"
            style={HIDDEN_INITIAL_STYLE}
          >
            <span className="eyebrow">{PROOF_COPY.eyebrow}</span>
            <h2
              className="font-display text-sand"
              style={{
                fontSize: "var(--display)",
                lineHeight: 1.02,
                textShadow: "0 1px 16px rgba(25, 12, 12, 0.7)",
              }}
            >
              {PROOF_COPY.headline}
            </h2>
            <p
              className="text-sand/85 max-w-[540px]"
              style={{ textShadow: "0 1px 12px rgba(25, 12, 12, 0.6)" }}
            >
              {PROOF_COPY.sub}
            </p>
          </div>
        </div>
      </section>

      <section
        data-section="cta"
        className="relative w-full min-h-screen flex items-center"
      >
        <div className="relative z-[2] w-full max-w-[1280px] mx-auto px-6 lg:px-12">
          <div
            data-overlay="copy"
            className="max-w-[640px] grid gap-6"
            style={HIDDEN_INITIAL_STYLE}
          >
            <span className="eyebrow">{CTA_COPY.eyebrow}</span>
            <h2
              className="font-display text-sand"
              style={{
                fontSize: "var(--display)",
                lineHeight: 1.02,
                textShadow: "0 1px 16px rgba(25, 12, 12, 0.7)",
              }}
            >
              {CTA_COPY.headline}
            </h2>
            <p
              className="text-sand/85 max-w-[540px]"
              style={{ textShadow: "0 1px 12px rgba(25, 12, 12, 0.6)" }}
            >
              {CTA_COPY.sub}
            </p>
            <a
              href="mailto:hello@zeusbot.ai?subject=ZeusBot%20demo%20request"
              className="inline-flex items-center justify-center rounded-md bg-gold-orb text-ink-deep px-6 py-3 font-medium w-fit"
            >
              {CTA_COPY.cta}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

interface SetupOpts {
  frameState: { idx: number };
  totalFrames: number;
  onFrameUpdate: () => void;
}

interface SectionTimelines {
  heroTl: ReturnType<typeof GsapType.timeline>;
  valueTl: ReturnType<typeof GsapType.timeline>;
  proofTl: ReturnType<typeof GsapType.timeline>;
  ctaTl: ReturnType<typeof GsapType.timeline>;
}

/**
 * setupSectionTimelines — builds three independent paused timelines (5s
 * each). Each one fades in its copy block over the first ~0.6s, then runs
 * the frame canvas tween over 4s starting at 0.5s, leaving a brief tail
 * for the section to settle before the next snap.
 *
 * The 240-frame source (16fps × 15s) is partitioned 60/60/60/60 across
 * sections so the user sees a contiguous 15s storyline (4×3.75s @ 16fps):
 *   hero  → frames 1–60    (0.00s –  3.75s of source)
 *   value → frames 61–120  (3.75s –  7.50s of source)
 *   proof → frames 121–180 (7.50s – 11.25s of source)
 *   cta   → frames 181–240 (11.25s – 15.00s of source)
 *
 * Returned timelines are paused; caller plays/restarts them via
 * ScrollTrigger onEnter/onEnterBack.
 */
export function setupSectionTimelines(
  gsap: typeof GsapType,
  opts: SetupOpts,
): SectionTimelines {
  const { frameState, onFrameUpdate } = opts;

  // Per-section frame ranges — see JSDoc above. `totalFrames` is still on
  // the SetupOpts shape (callers pass TOTAL_FRAMES=180) but the per-section
  // ranges are explicit constants so the partition is audit-friendly and
  // doesn't silently shift if total frame count ever changes.
  const HERO_RANGE = { start: 1, end: 60 };
  const VALUE_RANGE = { start: 61, end: 120 };
  const PROOF_RANGE = { start: 121, end: 180 };
  const CTA_RANGE = { start: 181, end: 240 };

  const heroTl = gsap.timeline({ paused: true });
  heroTl
    .from(
      '[data-section="hero"] [data-overlay="copy"] .eyebrow',
      { opacity: 0, y: 12, duration: 0.4, ease: "power2.out" },
      0,
    )
    .from(
      '[data-section="hero"] [data-overlay="copy"] h1',
      { opacity: 0, y: 24, duration: 0.6, ease: "power2.out" },
      0.15,
    )
    .from(
      '[data-section="hero"] [data-overlay="copy"] p',
      { opacity: 0, y: 16, duration: 0.5, ease: "power2.out" },
      0.35,
    )
    .fromTo(
      frameState,
      { idx: HERO_RANGE.start },
      {
        idx: HERO_RANGE.end,
        duration: 4,
        ease: "none",
        onUpdate: onFrameUpdate,
        overwrite: "auto",
        // Prevent GSAP from applying the FROM state at tween-construction
        // time. Without this, constructing later timelines (valueTl etc.)
        // overwrites frameState.idx before heroTl.play() even runs,
        // causing the wrong frame to paint on initial load.
        immediateRender: false,
      },
      0.5,
    );

  const valueTl = gsap.timeline({ paused: true });
  valueTl
    .fromTo(
      '[data-section="value"] [data-overlay="copy"]',
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      0.2,
    )
    .fromTo(
      frameState,
      { idx: VALUE_RANGE.start },
      {
        idx: VALUE_RANGE.end,
        duration: 4,
        ease: "none",
        onUpdate: onFrameUpdate,
        overwrite: "auto",
        immediateRender: false,
      },
      0.5,
    );

  const proofTl = gsap.timeline({ paused: true });
  proofTl
    .fromTo(
      '[data-section="proof"] [data-overlay="copy"]',
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      0.2,
    )
    .fromTo(
      frameState,
      { idx: PROOF_RANGE.start },
      {
        idx: PROOF_RANGE.end,
        duration: 4,
        ease: "none",
        onUpdate: onFrameUpdate,
        overwrite: "auto",
        immediateRender: false,
      },
      0.5,
    );

  const ctaTl = gsap.timeline({ paused: true });
  ctaTl
    .fromTo(
      '[data-section="cta"] [data-overlay="copy"]',
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      0.2,
    )
    .fromTo(
      frameState,
      { idx: CTA_RANGE.start },
      {
        idx: CTA_RANGE.end,
        duration: 4,
        ease: "none",
        onUpdate: onFrameUpdate,
        overwrite: "auto",
        immediateRender: false,
      },
      0.5,
    );

  return { heroTl, valueTl, proofTl, ctaTl };
}
