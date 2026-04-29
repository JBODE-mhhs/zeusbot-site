import type { BeatManifest } from "./types";

/**
 * Canonical 11-beat manifest for the ZeusBot marketing ribbon.
 * Source of truth: orgs/zeus/shared/zeusbot-site/scroll-choreography.md §2.
 *
 * Selectors target `data-beat="..."` containers inside each scene. Scene
 * components render all their beat-states co-located; the SnapRibbon makes
 * visibility/opacity decisions per the active beat.
 */
export const BEATS: BeatManifest[] = [
  {
    id: "B1",
    sceneIdx: 0,
    kind: "hero",
    frameRange: [1, 7],
    overlays: [
      { selector: '[data-beat="B1"][data-overlay="eyebrow"]', transform: "rise" },
      { selector: '[data-beat="B1"][data-overlay="line-1"]', transform: "rise", delay: 0.12 },
    ],
  },
  {
    id: "B2",
    sceneIdx: 0,
    kind: "hero",
    frameRange: [8, 14],
    overlays: [
      { selector: '[data-beat="B2"][data-overlay="line-2"]', transform: "rise" },
      { selector: '[data-beat="B2"][data-overlay="line-3"]', transform: "rise", delay: 0.08 },
      { selector: '[data-beat="B2"][data-overlay="line-4"]', transform: "rise", delay: 0.16 },
    ],
  },
  {
    id: "B3",
    sceneIdx: 0,
    kind: "hero",
    frameRange: [15, 21],
    overlays: [
      { selector: '[data-beat="B3"][data-overlay="sub"]', transform: "rise" },
      { selector: '[data-beat="B3"][data-overlay="cta"]', transform: "rise", delay: 0.10 },
    ],
  },
  {
    id: "B4",
    sceneIdx: 0,
    kind: "hero",
    frameRange: [22, 27],
    dimOverlays: [
      { selector: '[data-scene="hero"][data-overlay="eyebrow"]' },
      { selector: '[data-scene="hero"][data-overlay="headline"]' },
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
    overlays: [
      { selector: '[data-beat="B10"][data-overlay="heading"]', transform: "rise" },
      { selector: '[data-beat="B10"][data-overlay="tier"]', transform: "rise", delay: 0.10 },
    ],
  },
  {
    id: "B11",
    sceneIdx: 5,
    kind: "section",
    overlays: [
      { selector: '[data-beat="B11"][data-overlay="tagline"]', transform: "rise" },
      { selector: '[data-beat="B11"][data-overlay="cta"]', transform: "rise", delay: 0.10 },
    ],
  },
];

export const TOTAL_BEATS = BEATS.length;
export const TOTAL_SCENES = 6;
