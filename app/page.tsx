import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/sections/hero";
import { Capabilities } from "@/components/sections/capabilities";
import { HowItWorks } from "@/components/sections/how-it-works";
import { FleetStats } from "@/components/sections/fleet-stats";
import { Pricing } from "@/components/sections/pricing";
import { CtaClose } from "@/components/sections/cta-close";

export default function Home() {
  return (
    <>
      <NavBar />
      <main>
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
