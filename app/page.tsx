import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import { ScrollEngine } from "@/components/scroll/ScrollEngine";
import { SectionCopy } from "@/components/scroll/SectionCopy";

/**
 * Page composition (v6.1 — section-snap + per-section play).
 *
 * Three sections (Hero / Value / CTA) participate in `scroll-snap-type: y
 * mandatory` on `<html>`. Each section is `min-h-screen` and receives its
 * own paused 5s timeline; ScrollTrigger fires onEnter/onEnterBack to
 * `tl.restart()`. No pin, no scrub — animation runs at native 60fps
 * regardless of scroll velocity (fixes iPhone Safari touch-momentum
 * stuttering from v6 round 1-3).
 *
 * Spec: orgs/zeus/shared/zeusbot-site/scroll-choreography.md (v6.1).
 */
export default function Home() {
  return (
    <>
      <NavBar />
      <ScrollEngine />
      <main className="relative w-full">
        <SectionCopy />
      </main>
      <Footer />
    </>
  );
}
