import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import { ScrollEngine } from "@/components/scroll/ScrollEngine";
import { SectionCopy } from "@/components/scroll/SectionCopy";

/**
 * Page composition (v6 — single-pin linear video scrub).
 *
 * Three sections (Hero / Value / CTA) live inside a single `<main>` that
 * is pinned for `+=1500%` of viewport scroll by ScrollEngine. Frame canvas
 * + copy crossfades share one scrub timeline; no per-section pins, no
 * snap, no labels. Footer sits below `<main>` as standard scroll content
 * (legal/contact only — not a section).
 *
 * Spec: orgs/zeus/shared/zeusbot-site/scroll-choreography.md (v6).
 */
export default function Home() {
  return (
    <>
      <NavBar />
      <ScrollEngine />
      <main className="relative">
        <SectionCopy />
      </main>
      <Footer />
    </>
  );
}
