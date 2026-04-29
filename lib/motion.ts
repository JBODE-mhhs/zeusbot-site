import type { Variants } from "framer-motion";

/**
 * Cubic bezier matching --ease-out token (design-spec.md §1 motion).
 * Typed as a 4-tuple so Framer Motion 12 accepts it as a Bezier curve.
 */
export const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Standard rise-on-enter pattern: 24px translate + opacity, viewport: once.
 * Used by section heads and most cards across the site.
 */
export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const FADE_RISE_PROPS = {
  initial: "hidden" as const,
  whileInView: "visible" as const,
  viewport: { once: true, margin: "-80px" } as const,
  variants: fadeRise,
  transition: { duration: 0.7, ease: easeOut },
};
