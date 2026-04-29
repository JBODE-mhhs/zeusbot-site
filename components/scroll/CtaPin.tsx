"use client";

import type { gsap as GsapNs } from "gsap";
import type { ScrollTrigger as ScrollTriggerNs } from "gsap/ScrollTrigger";

/**
 * CTA pin (§2 row 6). 100vh pin, B11 single beat.
 * Tagline at p=0.0 (SSR); primary CTA rises at p=0.10; secondary at p=0.20.
 */
export function setupCtaPin(
  gsap: typeof GsapNs,
  ScrollTrigger: typeof ScrollTriggerNs,
): ScrollTriggerNs[] {
  const trigger = document.querySelector<HTMLElement>(
    '[data-section="cta"]',
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
    '[data-section="cta"] [data-anim="cta-primary"]',
    { y: 24, opacity: 0, duration: 0.08 },
    0.10,
  );
  tl.from(
    '[data-section="cta"] [data-anim="cta-sub"]',
    { y: 24, opacity: 0, duration: 0.08 },
    0.20,
  );

  return tl.scrollTrigger ? [tl.scrollTrigger] : [];
}
