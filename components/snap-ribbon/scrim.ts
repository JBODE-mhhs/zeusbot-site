import type { ScrimId } from "./types";

/**
 * Scrim recipes — see scroll-choreography.md §3.4.
 *
 * The z-1 scrim layer sits between the persistent frame backdrop (z-0) and
 * the scene container (z-2). Each beat names a recipe; outside-card text
 * (display headlines, eyebrows, body lines, CTA labels) renders over the
 * scrimmed backdrop and must clear WCAG AA 4.5:1 against the brightest
 * pixel region of that beat's terminal frame.
 *
 * Card-internal text (Capabilities cards, Pricing tier cards, How sticky
 * media surface) does not depend on the scrim — cards have their own
 * --ink-warm surface that already passes AA per design-spec §5.
 */
export const SCRIM_RECIPES: Record<ScrimId, string> = {
  none: "transparent",
  "left-rail":
    "linear-gradient(to right, rgba(25,12,12,0.78) 0%, rgba(25,12,12,0.45) 60%, rgba(25,12,12,0.30) 100%)",
  "right-rail":
    "linear-gradient(to right, rgba(25,12,12,0.30) 0%, rgba(25,12,12,0.45) 50%, rgba(25,12,12,0.78) 100%)",
  vertical:
    "linear-gradient(180deg, rgba(25,12,12,0.55) 0%, rgba(25,12,12,0.72) 50%, rgba(25,12,12,0.55) 100%)",
  vignette:
    "radial-gradient(ellipse at center, rgba(25,12,12,0.55) 0%, rgba(25,12,12,0.78) 80%)",
  "strong-vignette":
    "radial-gradient(ellipse at center, rgba(25,12,12,0.45) 0%, rgba(25,12,12,0.85) 90%)",
};

/**
 * Reduced-motion collapsed recipe (§5) — single global scrim applied to the
 * static f15 backdrop while the page scrolls naturally.
 */
export const REDUCED_MOTION_SCRIM =
  "linear-gradient(180deg, rgba(25,12,12,0.55), rgba(25,12,12,0.78))";

/**
 * Paint a scrim recipe onto a DOM element. v4 dual-layer pattern: callers
 * paint the inactive scrim div, then opacity-blend over 300ms between
 * <div data-scrim="A"> and <div data-scrim="B"> at the SnapRibbon JSX layer.
 * This helper sets `background` only — transitions are owned by the JSX
 * inline style (`transition: opacity 300ms ease`) so background paint
 * doesn't compound onto the GPU-composited opacity blend (§6.3).
 */
export function applyScrim(el: HTMLElement | null, scrim: ScrimId) {
  if (!el) return;
  el.style.background = SCRIM_RECIPES[scrim];
}

/** Get the raw CSS background recipe for a scrim id. */
export function scrimRecipe(scrim: ScrimId): string {
  return SCRIM_RECIPES[scrim];
}
