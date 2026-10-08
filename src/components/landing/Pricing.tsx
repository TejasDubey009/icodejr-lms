import { ArrowRight } from "lucide-react";
import { Section } from "./primitives";

const TERMS = [
  { k: "Per conducted session", v: "Quiet month, smaller bill." },
  { k: "No seat licences", v: "Add every instructor, parent and student." },
  { k: "No fee for inactive users", v: "Breaks and alumni cost nothing." },
];

export default function Pricing() {
  return (
    <Section
      id="pricing"
      index="08"
      label="Pricing"
      tone="surface"
      title="Pay for classes, not seats."
    >
      <div className="grid gap-8 border-t border-ink pt-8 lg:grid-cols-12">
        <dl className="grid gap-8 sm:grid-cols-3 lg:col-span-9">
          {TERMS.map((t) => (
            <div key={t.k}>
              <dt className="text-[18px] font-semibold text-ink">{t.k}</dt>
              <dd className="mt-2 text-[15px] leading-relaxed text-ink-2">{t.v}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col items-start gap-3 lg:col-span-3 lg:items-end lg:text-right">
          <p className="text-[15px] leading-relaxed text-ink-2">Tell us your monthly volume. We'll send your rate.</p>
          <a href="#demo" className="btn btn-primary">
            Get pricing
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
    </Section>
  );
}
