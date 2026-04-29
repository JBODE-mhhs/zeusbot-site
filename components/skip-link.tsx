"use client";

/**
 * Skip-link — WCAG 2.1 AA escape hatch for keyboard + AT users while the
 * SnapRibbon owns gesture-claimed scrolling (scroll-choreography.md §8).
 *
 * Must be the FIRST focusable element in <body>. On activation:
 *   1. dispatch 'snap-ribbon:release' — SnapRibbon's listener kills the
 *      Observer, removes its keydown handler, and restores body overflow.
 *   2. scrollIntoView('#footer') — runs synchronously after dispatchEvent
 *      returns; by then body is already scrollable so the scroll lands.
 *
 * The Observer's keydown gate already early-returns when activeElement
 * matches [data-skip-link], so Tab/Enter/Space on the focused link are
 * never preventDefault'd while the ribbon is still mounted.
 */
export function SkipLink() {
  return (
    <a
      href="#footer"
      data-skip-link
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-ink-deep focus:text-sand focus:px-4 focus:py-2 focus:rounded focus:outline focus:outline-2 focus:outline-gold-orb focus:no-underline"
      onClick={(e) => {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("snap-ribbon:release"));
        document
          .querySelector("#footer")
          ?.scrollIntoView({ behavior: "auto" });
      }}
    >
      Skip to footer
    </a>
  );
}
