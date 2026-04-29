/**
 * Scrim recipes — preserved from v4.3 §3.4, applied as static section
 * background in v5 (no cross-section opacity blend; sections pin in
 * sequence so the recipe changes by virtue of which section is pinned).
 *
 * Each value is a CSS `background:` string. Hero is `none` (text uses
 * text-shadow only against the brightest hero frames f01-f15).
 */
export type SectionId =
  | "hero"
  | "capabilities"
  | "how"
  | "stats"
  | "pricing"
  | "cta";

export const SCRIM_RECIPES: Record<SectionId, string> = {
  hero: "none",
  capabilities:
    "linear-gradient(to right, rgba(25,12,12,0.78) 0%, rgba(25,12,12,0.45) 60%, rgba(25,12,12,0.30) 100%)",
  how: "linear-gradient(to right, rgba(25,12,12,0.30) 0%, rgba(25,12,12,0.45) 50%, rgba(25,12,12,0.78) 100%)",
  stats:
    "linear-gradient(180deg, rgba(25,12,12,0.55) 0%, rgba(25,12,12,0.72) 50%, rgba(25,12,12,0.55) 100%)",
  pricing:
    "radial-gradient(ellipse at center, rgba(25,12,12,0.55) 0%, rgba(25,12,12,0.78) 80%)",
  cta: "radial-gradient(ellipse at center, rgba(25,12,12,0.45) 0%, rgba(25,12,12,0.85) 90%)",
};

export const SECTION_LABEL: Record<SectionId, string> = {
  hero: "Hero",
  capabilities: "Capabilities",
  how: "How it works",
  stats: "Fleet stats",
  pricing: "Pricing",
  cta: "Send the work",
};

/**
 * Per-section pin length in viewport heights (vh). Total = 1000vh.
 * Hero + How get 300vh each (4 + 3 internal beats); single-beat sections 100vh.
 */
export const SECTION_PIN_VH: Record<SectionId, number> = {
  hero: 300,
  capabilities: 100,
  how: 300,
  stats: 100,
  pricing: 100,
  cta: 100,
};

export const SECTION_ORDER: SectionId[] = [
  "hero",
  "capabilities",
  "how",
  "stats",
  "pricing",
  "cta",
];

/**
 * Frame index range per section (1-indexed against /frames/f01..f27.webp).
 * The global frame-canvas ScrollTrigger maps overall progress to a single
 * index; we compute that mapping by accumulating section pin lengths.
 */
export const SECTION_FRAME_RANGE: Record<SectionId, [number, number]> = {
  hero: [1, 15],
  capabilities: [16, 17],
  how: [18, 23],
  stats: [24, 24],
  pricing: [25, 25],
  cta: [26, 27],
};
