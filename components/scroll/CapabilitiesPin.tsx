"use client";

import type { gsap as GsapNs } from "gsap";
import type { ScrollTrigger as ScrollTriggerNs } from "gsap/ScrollTrigger";

/**
 * Capabilities pin (§2 row 2). 100vh pin, B5 single beat.
 * Eyebrow + heading at p=0.0 (SSR final state, no tween).
 * 5 cards stagger reveal at p=0.10/0.20/0.30/0.40/0.50.
 */
export function setupCapabilitiesPin(
  gsap: typeof GsapNs,
  ScrollTrigger: typeof ScrollTriggerNs,
): ScrollTriggerNs[] {
  const trigger = document.querySelector<HTMLElement>(
    '[data-section="capabilities"]',
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
    '[data-section="capabilities"] [data-anim="card-featured"]',
    { y: 32, opacity: 0, duration: 0.08 },
    0.10,
  );
  tl.from(
    '[data-section="capabilities"] [data-anim="card-secondary"]',
    { y: 24, opacity: 0, duration: 0.08, stagger: 0.05 },
    0.20,
  );

  return tl.scrollTrigger ? [tl.scrollTrigger] : [];
}
