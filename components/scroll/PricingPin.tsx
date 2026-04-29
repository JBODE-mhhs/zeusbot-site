"use client";

import type { gsap as GsapNs } from "gsap";
import type { ScrollTrigger as ScrollTriggerNs } from "gsap/ScrollTrigger";

/**
 * Pricing pin (§2 row 5). 100vh pin, B10 single beat.
 * Heading at p=0.0 (SSR). 3 tier cards rise at p=0.10/0.20/0.30.
 * Middle tier (Forge) gets a scale 0.96 → 1.00 + gold-orb shadow at p=0.30.
 */
export function setupPricingPin(
  gsap: typeof GsapNs,
  ScrollTrigger: typeof ScrollTriggerNs,
): ScrollTriggerNs[] {
  const trigger = document.querySelector<HTMLElement>(
    '[data-section="pricing"]',
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
    '[data-section="pricing"] [data-anim="tier"]',
    { y: 28, opacity: 0, duration: 0.08, stagger: 0.05 },
    0.10,
  );
  tl.from(
    '[data-section="pricing"] [data-anim="tier-featured"]',
    { scale: 0.96, duration: 0.08 },
    0.30,
  );

  return tl.scrollTrigger ? [tl.scrollTrigger] : [];
}
