import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import Statement from "@/components/landing/Statement";
import Automations from "@/components/landing/Automations";
import Portals from "@/components/landing/Portals";
import LiveClasses from "@/components/landing/LiveClasses";
import Payments from "@/components/landing/Payments";
import Growth from "@/components/landing/Growth";
import Learning from "@/components/landing/Learning";
import Controls from "@/components/landing/Controls";
import Connections from "@/components/landing/Connections";
import Pricing from "@/components/landing/Pricing";
import Faq from "@/components/landing/Faq";
import DemoRequest from "@/components/landing/DemoRequest";
import Footer from "@/components/landing/Footer";
import Proof from "@/components/landing/Proof";
import { useScrollReveal, useSpotlight } from "@/hooks";

export default function LandingPage() {
  useScrollReveal();
  useSpotlight();

  return (
    <div className="grain relative overflow-x-clip">
      {/* Violet light falling from the top of the page, behind the nav and hero */}
      <div aria-hidden className="glow-top pointer-events-none absolute inset-x-0 top-0 h-[950px]" />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:font-medium focus:text-night"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <Proof />
        <Statement />
        <Automations />
        <Portals />
        <LiveClasses />
        <Payments />
        <Growth />
        <Learning />
        <Controls />
        <Connections />
        <Pricing />
        <Faq />
        <DemoRequest />
      </main>
      <Footer />
    </div>
  );
}
