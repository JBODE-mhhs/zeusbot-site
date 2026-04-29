import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import { ScrollEngine } from "@/components/scroll/ScrollEngine";
import { Hero } from "@/components/sections/hero";
import { Capabilities } from "@/components/sections/capabilities";
import { HowItWorks } from "@/components/sections/how-it-works";
import { FleetStats } from "@/components/sections/fleet-stats";
import { Pricing } from "@/components/sections/pricing";
import { CtaClose } from "@/components/sections/cta-close";

/**
 * Page composition (v5 — pin+scrub architecture).
 *
 * 6 sections; each pins for 100vh or 300vh and scrubs its internal
 * cinematic via ScrollTrigger. The total pinned ribbon is 1000vh
 * (Hero 300 + Capabilities 100 + How 300 + Stats 100 + Pricing 100 + CTA 100);
 * snap pulls scroll to section anchors when scroll-velocity drops.
 *
 * Frame canvas is global (z-0, fixed); driven by a single ScrollTrigger
 * in ScrollEngine that maps overall progress 0..1 onto frame indices 1..27.
 *
 * See orgs/zeus/shared/zeusbot-site/scroll-choreography.md (v5).
 */
export default function Home() {
  return (
    <>
      <NavBar />
      <ScrollEngine />
      <main className="relative">
        <Hero />
        <Capabilities />
        <HowItWorks />
        <FleetStats />
        <Pricing />
        <CtaClose />
      </main>
      <Footer />
    </>
  );
}
