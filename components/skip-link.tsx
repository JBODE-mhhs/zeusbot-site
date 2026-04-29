/**
 * Skip-link — WCAG 2.1 AA escape hatch. v5: normal anchor link to #footer
 * (the page scrolls naturally; no body overflow lock to release, no
 * snap-ribbon:release event to dispatch). ScrollTrigger's snap is
 * cooperative — clicking an anchor lets the browser jump-scroll without
 * fighting the snap window.
 *
 * Must remain the first focusable element in <body>.
 */
export function SkipLink() {
  return (
    <a
      href="#footer"
      data-skip-link
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-ink-deep focus:text-sand focus:px-4 focus:py-2 focus:rounded focus:outline focus:outline-2 focus:outline-gold-orb focus:no-underline"
    >
      Skip to footer
    </a>
  );
}
