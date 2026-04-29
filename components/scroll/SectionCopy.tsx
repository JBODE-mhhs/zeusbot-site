import type { gsap as GsapType } from "gsap";

/**
 * SectionCopy — three scroll-anchored copy blocks (Hero / Value / CTA) per
 * scroll-choreography.md v6 §1.2. Each section has exactly ONE copy slot
 * marked `[data-overlay="copy"]`; crossfades happen at fractional pin
 * boundaries 0.31/0.33 (Hero→Value) and 0.64/0.66 (Value→CTA), per §3.1.
 *
 * Copy text is placeholder per spec §1.2 — final copy is a copywriter
 * handoff. Slots are reserved at the documented selectors so swap-in is
 * a pure text edit.
 *
 * Architectural rules baked in (§5.2 / Appendix A):
 *  - Single pin owns the whole 1500% scrub; we contribute tweens to the
 *    caller's master timeline rather than creating our own ScrollTrigger.
 *  - No direction guards, no replay flag, no progress watermark Set.
 *  - No timeline-label calls — labels imply snap, v6 has no snap.
 *  - Value/CTA copy initial state is hidden (opacity:0, y:16); SSR inline
 *    style matches so nothing flashes during hydrate.
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

const CTA_COPY = {
  eyebrow: "Pricing",
  headline: "From $99 / month.",
  sub: "Start free for 14 days. No credit card.",
  cta: "Request demo",
};

const HIDDEN_INITIAL_STYLE: React.CSSProperties = {
  opacity: 0,
  transform: "translateY(16px)",
};

export function SectionCopy() {
  return (
    <>
      <section
        data-section="hero"
        className="absolute inset-0 w-full h-full flex items-center"
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
        className="absolute inset-0 w-full h-full flex items-center"
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
        data-section="cta"
        className="absolute inset-0 w-full h-full flex items-center"
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

/**
 * setupCopyTweens — attaches the four crossfade tweens to a scrub-bound
 * master timeline. Positions per spec §3.1:
 *   0.31  hero copy fades out
 *   0.33  value copy fades in
 *   0.64  value copy fades out
 *   0.66  cta copy fades in
 *
 * Tween durations are 0.02 (2% of the unit-normalized timeline) so each
 * crossfade window is the spec's "narrow swap zone". The caller is
 * expected to set `tl.totalDuration(1)` after to lock the scrub mapping.
 *
 * `fromTo` (not `from`) is used for value/cta so the start state is
 * unambiguous and matches the SSR inline style — `from` would inherit
 * end-state from the (currently-hidden) DOM and produce a no-op.
 */
export function setupCopyTweens(
  gsap: typeof GsapType,
  tl: ReturnType<typeof GsapType.timeline>,
) {
  // Hero → Value boundary
  tl.to(
    '[data-section="hero"] [data-overlay="copy"]',
    { opacity: 0, y: -16, ease: "power2.in", duration: 0.02 },
    0.31,
  );
  tl.fromTo(
    '[data-section="value"] [data-overlay="copy"]',
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, ease: "power2.out", duration: 0.02 },
    0.33,
  );

  // Value → CTA boundary
  tl.to(
    '[data-section="value"] [data-overlay="copy"]',
    { opacity: 0, y: -16, ease: "power2.in", duration: 0.02 },
    0.64,
  );
  tl.fromTo(
    '[data-section="cta"] [data-overlay="copy"]',
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, ease: "power2.out", duration: 0.02 },
    0.66,
  );

  // Anchor timeline's RAW duration at 1.0 by inserting a zero-duration
  // tween at position 1.0. Both tl.totalDuration(1) and tl.duration(1)
  // adjust via timeScale rather than extending the underlying duration,
  // which leaves scrub-progress→tween-position mapping wrong: ScrollTrigger
  // calls timeline.progress(scrollFrac) and progress() reads the raw
  // duration, so without this anchor the natural duration is 0.68 (last
  // tween at 0.66 + 0.02) and a tween at position 0.66 fires at scroll
  // fraction 0.97. (PR #4 Bugbot HIGH 2026-04-29 — SectionCopy.tsx 192-195.)
  tl.to({}, { duration: 0 }, 1);

  // gsap reference is consumed solely for the type — keep it imported
  // so a future direction change has access without re-threading args.
  void gsap;
}
