import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import { SnapRibbon, SnapScene } from "@/components/snap-ribbon/SnapRibbon";
import { Hero } from "@/components/sections/hero";
import { Capabilities } from "@/components/sections/capabilities";
import { HowItWorks } from "@/components/sections/how-it-works";
import { FleetStats } from "@/components/sections/fleet-stats";
import { Pricing } from "@/components/sections/pricing";
import { CtaClose } from "@/components/sections/cta-close";

/**
 * Page composition (v2 SnapRibbon).
 *
 * 6 scenes traversed by the ribbon's 11-beat ledger:
 *   hero         (B1..B4 — 4 internal hero beats, frame swap + overlays)
 *   capabilities (B5)
 *   how          (B6..B8 — 3 internal step beats, sticky media)
 *   stats        (B9)
 *   pricing      (B10)
 *   cta          (B11 — release on next gesture)
 *
 * Footer renders post-ribbon and is reached after the ribbon releases on
 * the gesture past B11 (see SnapRibbon §1.3).
 */
export default function Home() {
  return (
    <>
      <NavBar />
      <main>
        <SnapRibbon>
          <SnapScene sceneId="hero">
            <Hero />
          </SnapScene>
          <SnapScene sceneId="capabilities">
            <Capabilities />
          </SnapScene>
          <SnapScene sceneId="how">
            <HowItWorks />
          </SnapScene>
          <SnapScene sceneId="stats">
            <FleetStats />
          </SnapScene>
          <SnapScene sceneId="pricing">
            <Pricing />
          </SnapScene>
          <SnapScene sceneId="cta">
            <CtaClose />
          </SnapScene>
        </SnapRibbon>
      </main>
      <Footer />
    </>
  );
}
