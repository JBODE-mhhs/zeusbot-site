/**
 * SnapRibbon — beat ledger types.
 *
 * The 11-beat ribbon (B1..B11) maps to 6 visual scenes:
 *   scene 0: Hero (B1..B4 — internal hero beats, frame swap + overlay reveal)
 *   scene 1: Capabilities (B5)
 *   scene 2: How it works (B6..B8 — internal step beats, sticky media)
 *   scene 3: Fleet stats (B9)
 *   scene 4: Pricing (B10)
 *   scene 5: CTA close (B11)
 *
 * Cross-scene beat advances translate the ribbon container by ±100vh.
 * Same-scene beat advances animate state within the visible scene only
 * (frame swap for hero, step dim/reveal for how-it-works).
 */

export type BeatKind = "hero" | "section";

export type OverlayTransform = "rise" | "fade" | "persist";

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
  /** [from, to] inclusive, 1-indexed against /frames/f01..f27.webp. Hero beats only. */
  frameRange?: [number, number];
  /** Selectors that rise/fade in on enter. */
  overlays: OverlayDef[];
  /** Selectors that dim from 1 → 0.3 on enter (e.g., prior how-it-works step). */
  dimOverlays?: OverlayDef[];
}
