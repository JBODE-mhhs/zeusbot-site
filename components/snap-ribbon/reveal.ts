import type { gsap } from "gsap";
import type { OverlayDef } from "./types";

type GsapNs = typeof gsap;

/**
 * Build a paused timeline of overlay rise/fade-in animations per spec §3.
 *
 * v4 reveal recipes:
 *   "rise" → { y: distance } → { y: 0, duration: 0.6, ease: 'expo.out' }
 *   "fade" → { opacity: 0 } → { opacity: 1, duration: 0.6, ease: 'expo.out' }
 *   "persist" → no animation
 *
 * "rise" no longer animates opacity (v4 LCP rework — overlays render
 * SSR-visible so the hero headline is the LCP candidate; non-hero scene
 * containers fade-in at the scene-host level so their overlays inherit
 * the parent fade naturally). Mobile distance auto-collapses 24px → 16px.
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
    // rise — y-only (no opacity); SSR-visible overlays slide up.
    tl.fromTo(
      targets,
      { y: distance },
      { y: 0, duration: 0.6, ease: "expo.out" },
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
