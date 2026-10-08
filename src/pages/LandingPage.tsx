import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import Automations from "@/components/landing/Automations";
import Portals from "@/components/landing/Portals";
import LiveClasses from "@/components/landing/LiveClasses";
import Payments from "@/components/landing/Payments";
import Growth from "@/components/landing/Growth";
import Learning from "@/components/landing/Learning";
import Controls from "@/components/landing/Controls";
import Pricing from "@/components/landing/Pricing";
import Faq from "@/components/landing/Faq";
import DemoRequest from "@/components/landing/DemoRequest";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <Automations />
        <Portals />
        <LiveClasses />
        <Payments />
        <Growth />
        <Learning />
        <Controls />
        <Pricing />
        <Faq />
        <DemoRequest />
      </main>
      <Footer />
    </>
  );
}
