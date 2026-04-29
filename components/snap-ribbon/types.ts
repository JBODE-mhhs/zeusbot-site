/**
 * SnapRibbon — beat ledger types (v3, continuous-backdrop snap).
 *
 * The 11-beat ribbon (B1..B11) maps to 6 visual scenes:
 *   scene 0: Hero (B1..B4 — 4 internal hero beats, frame swap + overlay reveal)
 *   scene 1: Capabilities (B5)
 *   scene 2: How it works (B6..B8 — 3 internal step beats, sticky media)
 *   scene 3: Fleet stats (B9)
 *   scene 4: Pricing (B10)
 *   scene 5: CTA close (B11)
 *
 * The 27-frame sequence (/frames/f01..f27.webp) is rendered as a persistent
 * fixed-position backdrop at z-0 across the entire ribbon; every beat advances
 * a frame sub-range so the cinematic flow never breaks. Same-scene beat
 * advances animate overlays on top of the moving backdrop. Cross-scene beat
 * advances fade-swap the scene container (200ms out + 400ms in @ +100ms delay)
 * while the frame keeps swapping underneath.
 */

export type BeatKind = "hero-internal" | "section";

export type OverlayTransform = "rise" | "fade" | "persist";

export type ScrimId =
  | "none"
  | "left-rail"
  | "right-rail"
  | "vertical"
  | "vignette"
  | "strong-vignette";

export interface OverlayDef {
  selector: string;
  transform?: OverlayTransform;
  delay?: number;
  distance?: number;
}

export interface BeatManifest {
  id: string;
  sceneIdx: number;
  kind: BeatKind;
  /**
   * [from, to] inclusive, 1-indexed against /frames/f01..f27.webp.
   * REQUIRED on every beat in v3 — no beat may hold a frozen frame mid-ribbon.
   * For single-frame beats (B9, B10), set [from, from] and the swap fires
   * once at beat-enter.
   */
  frameRange: [number, number];
  /** Per-beat scrim recipe (see scrim.ts) — controls z-1 contrast layer. */
  scrim: ScrimId;
  /** Selectors that rise/fade in on enter. */
  overlays: OverlayDef[];
  /** Selectors that dim from 1 → 0.3 on enter (e.g., prior how-it-works step). */
  dimOverlays?: OverlayDef[];
}
