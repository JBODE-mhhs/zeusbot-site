import type { BeatManifest } from "./types";

/**
 * Canonical 11-beat manifest (v3 — continuous backdrop).
 * Source of truth: orgs/zeus/shared/zeusbot-site/scroll-choreography.md §2.
 *
 * Frame distribution is lockstep across all 11 beats (no holds, no skips):
 *   Hero (B1–B4):     f01–f15 = 4 + 4 + 4 + 3
 *   Content (B5–B11): f16–f27 = 2 + 2 + 2 + 2 + 1 + 1 + 2
 *   Total: 27 frames, every frame plays exactly once across the ribbon.
 *
 * Scrim recipes per §3.4 — outside-card text relies on the z-1 scrim layer
 * to clear AA contrast against the brightest pixel of each beat's terminal
 * frame; cards (Capabilities, Pricing, How media) ride their own --ink-warm
 * surface and don't depend on scrim.
 */
export const BEATS: BeatManifest[] = [
  {
    id: "B1",
    sceneIdx: 0,
    kind: "hero-internal",
    frameRange: [1, 4],
    scrim: "none",
    overlays: [
      { selector: '[data-beat="B1"][data-overlay="eyebrow"]', transform: "rise" },
      { selector: '[data-beat="B1"][data-overlay="line-1"]', transform: "rise", delay: 0.12 },
    ],
  },
  {
    id: "B2",
    sceneIdx: 0,
    kind: "hero-internal",
    frameRange: [5, 8],
    scrim: "none",
    overlays: [
      { selector: '[data-beat="B2"][data-overlay="line-2"]', transform: "rise" },
      { selector: '[data-beat="B2"][data-overlay="line-3"]', transform: "rise", delay: 0.08 },
      { selector: '[data-beat="B2"][data-overlay="line-4"]', transform: "rise", delay: 0.16 },
    ],
  },
  {
    id: "B3",
    sceneIdx: 0,
    kind: "hero-internal",
    frameRange: [9, 12],
    scrim: "none",
    overlays: [
      { selector: '[data-beat="B3"][data-overlay="sub"]', transform: "rise" },
      { selector: '[data-beat="B3"][data-overlay="cta"]', transform: "rise", delay: 0.10 },
    ],
  },
  {
    id: "B4",
    sceneIdx: 0,
    kind: "hero-internal",
    frameRange: [13, 15],
    scrim: "none",
    dimOverlays: [
      { selector: '[data-scene="hero"] [data-overlay="eyebrow"]' },
      { selector: '[data-scene="hero"] [data-overlay="headline"]' },
    ],
    overlays: [
      { selector: '[data-beat="B4"][data-overlay="tagline-end"]', transform: "rise" },
      { selector: '[data-beat="B4"][data-overlay="continue"]', transform: "rise", delay: 0.10 },
    ],
  },
  {
    id: "B5",
    sceneIdx: 1,
    kind: "section",
    frameRange: [16, 17],
    scrim: "left-rail",
    overlays: [
      { selector: '[data-beat="B5"][data-overlay="eyebrow"]', transform: "rise" },
      { selector: '[data-beat="B5"][data-overlay="heading"]', transform: "rise", delay: 0.12 },
      { selector: '[data-beat="B5"][data-overlay="card"]', transform: "rise", delay: 0.20 },
    ],
  },
  {
    id: "B6",
    sceneIdx: 2,
    kind: "section",
    frameRange: [18, 19],
    scrim: "right-rail",
    overlays: [
      { selector: '[data-beat="B6"][data-overlay="eyebrow"]', transform: "rise" },
      { selector: '[data-beat="B6"][data-overlay="step"]', transform: "rise", delay: 0.08 },
      { selector: '[data-beat="B6"][data-overlay="media"]', transform: "fade", delay: 0.16 },
    ],
  },
  {
    id: "B7",
    sceneIdx: 2,
    kind: "section",
    frameRange: [20, 21],
    scrim: "right-rail",
    dimOverlays: [{ selector: '[data-beat="B6"][data-overlay="step"]' }],
    overlays: [
      { selector: '[data-beat="B7"][data-overlay="step"]', transform: "rise" },
      { selector: '[data-beat="B7"][data-overlay="media"]', transform: "fade", delay: 0.08 },
    ],
  },
  {
    id: "B8",
    sceneIdx: 2,
    kind: "section",
    frameRange: [22, 23],
    scrim: "right-rail",
    dimOverlays: [{ selector: '[data-beat="B7"][data-overlay="step"]' }],
    overlays: [
      { selector: '[data-beat="B8"][data-overlay="step"]', transform: "rise" },
      { selector: '[data-beat="B8"][data-overlay="media"]', transform: "fade", delay: 0.08 },
    ],
  },
  {
    id: "B9",
    sceneIdx: 3,
    kind: "section",
    frameRange: [24, 24],
    scrim: "vertical",
    overlays: [
      { selector: '[data-beat="B9"][data-overlay="eyebrow"]', transform: "rise" },
      { selector: '[data-beat="B9"][data-overlay="heading"]', transform: "rise", delay: 0.12 },
      { selector: '[data-beat="B9"][data-overlay="stat"]', transform: "rise", delay: 0.20 },
    ],
  },
  {
    id: "B10",
    sceneIdx: 4,
    kind: "section",
    frameRange: [25, 25],
    scrim: "vignette",
    overlays: [
      { selector: '[data-beat="B10"][data-overlay="heading"]', transform: "rise" },
      { selector: '[data-beat="B10"][data-overlay="tier"]', transform: "rise", delay: 0.10 },
    ],
  },
  {
    id: "B11",
    sceneIdx: 5,
    kind: "section",
    frameRange: [26, 27],
    scrim: "strong-vignette",
    overlays: [
      { selector: '[data-beat="B11"][data-overlay="tagline"]', transform: "rise" },
      { selector: '[data-beat="B11"][data-overlay="cta"]', transform: "rise", delay: 0.10 },
    ],
  },
];

export const TOTAL_BEATS = BEATS.length;
export const TOTAL_SCENES = 6;

/** Scene-id by scene index — matches declaration order in app/page.tsx. */
export const SCENE_ID_BY_IDX = [
  "hero",
  "capabilities",
  "how",
  "stats",
  "pricing",
  "cta",
] as const;
