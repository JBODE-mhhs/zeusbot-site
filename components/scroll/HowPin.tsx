"use client";

import type { gsap as GsapNs } from "gsap";
import type { ScrollTrigger as ScrollTriggerNs } from "gsap/ScrollTrigger";

/**
 * How-it-works pin (§2 row 3). 300vh pin, B6/B7/B8 three internal beats.
 *
 *   B6 p=0.0–0.33  — Step 1 reveal at p=0.05; dim at p=0.30
 *   B7 p=0.33–0.66 — Step 2 reveal at p=0.38; dim at p=0.63
 *   B8 p=0.66–1.0  — Step 3 reveal at p=0.71
 *
 * Sticky-media cross-fades at the same thresholds (handled by the same
 * scrubbed timeline since each step has its own image element).
 */
export function setupHowPin(
  gsap: typeof GsapNs,
  ScrollTrigger: typeof ScrollTriggerNs,
): ScrollTriggerNs[] {
  const trigger = document.querySelector<HTMLElement>(
    '[data-section="how"]',
  );
  if (!trigger) return [];

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger,
      start: "top top",
      end: "+=300%",
      scrub: true,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
    },
  });

  // Step 1 in at 0.05, dim at 0.30
  tl.from(
    '[data-section="how"] [data-anim="step-1"]',
    { y: 32, opacity: 0, duration: 0.08 },
    0.05,
  );
  tl.to(
    '[data-section="how"] [data-anim="step-1"]',
    { opacity: 0.3, duration: 0.05 },
    0.30,
  );
  // Step 2 in at 0.38, dim at 0.63
  tl.from(
    '[data-section="how"] [data-anim="step-2"]',
    { y: 32, opacity: 0, duration: 0.08 },
    0.38,
  );
  tl.to(
    '[data-section="how"] [data-anim="step-2"]',
    { opacity: 0.3, duration: 0.05 },
    0.63,
  );
  // Step 3 in at 0.71
  tl.from(
    '[data-section="how"] [data-anim="step-3"]',
    { y: 32, opacity: 0, duration: 0.08 },
    0.71,
  );

  return tl.scrollTrigger ? [tl.scrollTrigger] : [];
}
