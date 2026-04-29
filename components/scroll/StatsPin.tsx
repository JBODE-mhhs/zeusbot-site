"use client";

import type { gsap as GsapNs } from "gsap";
import type { ScrollTrigger as ScrollTriggerNs } from "gsap/ScrollTrigger";

/**
 * Stats pin (§2 row 4). 100vh pin, B9 single beat.
 * Eyebrow + heading at p=0.0 (SSR).
 * 4 stat blocks cascade at p=0.05/0.10/0.15/0.20.
 * Count-up animations are owned by StatBlock's useInView (already running
 * on enter) — the pin just provides the dwell window for them to play out.
 */
export function setupStatsPin(
  gsap: typeof GsapNs,
  ScrollTrigger: typeof ScrollTriggerNs,
): ScrollTriggerNs[] {
  const trigger = document.querySelector<HTMLElement>(
    '[data-section="stats"]',
  );
  if (!trigger) return [];

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger,
      start: "top top",
      end: "+=100%",
      scrub: true,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
    },
  });

  tl.from(
    '[data-section="stats"] [data-anim="stat"]',
    { y: 24, opacity: 0, duration: 0.06, stagger: 0.04 },
    0.05,
  );

  return tl.scrollTrigger ? [tl.scrollTrigger] : [];
}
