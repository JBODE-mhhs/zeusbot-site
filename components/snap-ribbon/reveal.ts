import type { gsap } from "gsap";
import type { OverlayDef } from "./types";

type GsapNs = typeof gsap;

/**
 * Build a paused timeline of overlay rise/fade-in animations per spec §3.
 *
 * Default reveal recipe:
 *   { opacity: 0, y: 24 } → { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }
 *
 * Mobile distance auto-collapses 24px → 16px (spec §6).
 */
export function buildOverlayTimeline(
  gsap: GsapNs,
  overlays: OverlayDef[],
  opts: { mobile?: boolean; rootEl?: ParentNode } = {},
) {
  const { mobile = false, rootEl = document } = opts;
  const tl = gsap.timeline({ paused: true });

  for (const o of overlays) {
    const targets = rootEl.querySelectorAll(o.selector);
    if (targets.length === 0) continue;

    const distance = o.distance ?? (mobile ? 16 : 24);
    const transform = o.transform ?? "rise";

    if (transform === "persist") continue;
    if (transform === "fade") {
      tl.fromTo(
        targets,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "expo.out" },
        o.delay ?? 0,
      );
      continue;
    }
    // rise
    tl.fromTo(
      targets,
      { opacity: 0, y: distance },
      { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" },
      o.delay ?? 0,
    );
  }

  return tl;
}

/**
 * Build a dim timeline for prior-beat overlays per spec §3 (1 → 0.3).
 */
export function buildDimTimeline(
  gsap: GsapNs,
  overlays: OverlayDef[],
  opts: { rootEl?: ParentNode } = {},
) {
  const { rootEl = document } = opts;
  const tl = gsap.timeline({ paused: true });

  for (const o of overlays) {
    const targets = rootEl.querySelectorAll(o.selector);
    if (targets.length === 0) continue;
    tl.to(
      targets,
      { opacity: 0.3, duration: 0.4, ease: "power2.out" },
      o.delay ?? 0,
    );
  }

  return tl;
}
