"use client";

import type { gsap as GsapNs } from "gsap";
import type { ScrollTrigger as ScrollTriggerNs } from "gsap/ScrollTrigger";

/**
 * Hero pin + scroll-linked timeline (§4 in scroll-choreography.md v5).
 *
 * 300vh pin. Beats are scroll-progress thresholds within the pin range:
 *   B1 p=0.0–0.25  — eyebrow + L1 SSR'd at final position; no tween
 *   B2 p=0.25–0.50 — line-2/3/4 rise at p=0.25/0.32/0.40
 *   B3 p=0.50–0.75 — sub stays at SSR final (LCP-anchor); CTA pair rises at p=0.55
 *   B4 p=0.75–1.0  — eyebrow + L1 dim 1→0.3 at p=0.75; tagline at p=0.80; continue at p=0.92
 *
 * scrub:true means the timeline's clock IS scroll position. There is no
 * autoplay, no immediateRender window, no hydrate-flash class to mitigate.
 * Reverse scroll replays the timeline in reverse automatically.
 */
export function setupHeroPin(
  gsap: typeof GsapNs,
  ScrollTrigger: typeof ScrollTriggerNs,
): ScrollTriggerNs[] {
  const trigger = document.querySelector<HTMLElement>(
    '[data-section="hero"]',
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

  // B2 — lines 2/3/4 rise between p=0.25 and p=0.40
  tl.from(
    '[data-beat="B2"][data-overlay="line-2"]',
    { y: 24, opacity: 0, duration: 0.05 },
    0.25,
  );
  tl.from(
    '[data-beat="B2"][data-overlay="line-3"]',
    { y: 24, opacity: 0, duration: 0.05 },
    0.32,
  );
  tl.from(
    '[data-beat="B2"][data-overlay="line-4"]',
    { y: 24, opacity: 0, duration: 0.05 },
    0.40,
  );

  // B3 — sub static (LCP-anchor, no tween); CTA pair rises at p=0.55
  tl.from(
    '[data-beat="B3"][data-overlay="cta"] > *',
    { y: 24, opacity: 0, duration: 0.05, stagger: 0.02 },
    0.55,
  );

  // B4 — dim B1 prior beats; tagline-end + continue rise
  tl.to(
    '[data-beat="B1"][data-overlay="eyebrow"], [data-beat="B1"][data-overlay="line-1"]',
    { opacity: 0.3, duration: 0.05 },
    0.75,
  );
  tl.from(
    '[data-beat="B4"][data-overlay="tagline-end"]',
    { y: 24, opacity: 0, duration: 0.05 },
    0.80,
  );
  tl.from(
    '[data-beat="B4"][data-overlay="continue"]',
    { y: 24, opacity: 0, duration: 0.05 },
    0.92,
  );

  return tl.scrollTrigger ? [tl.scrollTrigger] : [];
}
