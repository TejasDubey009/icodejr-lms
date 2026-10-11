import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { FAQ } from "@/content/faq";


export default function Faq() {
  return (
    <section id="faq" className="relative">
      <div aria-hidden className="divider-fade" />
      <div className="mx-auto grid max-w-page gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-12 lg:gap-12 lg:px-8">
        <div className="lg:col-span-4">
          <h2 className="text-gradient text-[clamp(2.5rem,1.6rem+3vw,3.5rem)] font-medium leading-tight">FAQs</h2>
          <p className="mt-3 max-w-[32ch] text-[17px] leading-relaxed text-ink-3">
            The things academies ask us before they switch.
          </p>
          <a href="#demo" className="btn btn-primary mt-7">
            Book a demo
          </a>
        </div>
        <Accordion.Root type="single" collapsible className="space-y-3 lg:col-span-8">
          {FAQ.map((item, i) => (
            <Accordion.Item key={item.q} value={`q${i}`} className="card overflow-hidden transition-colors hover:border-rule-strong data-[state=open]:border-brand/60">
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full items-center justify-between gap-6 px-5 py-4 text-left font-display text-[16.5px] font-medium text-ink sm:px-6">
                  {item.q}
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-ink-3 transition-transform duration-200 group-data-[state=open]:rotate-180"
                    aria-hidden
                  />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content
                forceMount
                className="overflow-hidden data-[state=closed]:hidden data-[state=open]:animate-accordion-down"
              >
                <p className="max-w-[64ch] px-5 pb-5 text-[15.5px] leading-relaxed text-ink-3 sm:px-6">{item.a}</p>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
