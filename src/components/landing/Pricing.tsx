import { ArrowRight } from "lucide-react";
import { Section } from "./primitives";

const TERMS = [
  { k: "Per conducted session", v: "Quiet month, smaller bill." },
  { k: "No seat licences", v: "Add every instructor, parent and student." },
  { k: "No fee for inactive users", v: "Breaks and alumni cost nothing." },
];

export default function Pricing() {
  return (
    <Section id="pricing" index="09" label="Pricing" tone="surface" title="Pay for classes, not seats.">
      <div className="card overflow-hidden">
        <dl className="grid divide-y divide-rule sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {TERMS.map((t) => (
            <div key={t.k} className="px-6 py-7 sm:px-8">
              <dt className="font-display text-[19px] font-medium text-ink">{t.k}</dt>
              <dd className="mt-2 text-[15px] leading-relaxed text-ink-3">{t.v}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col items-start justify-between gap-4 border-t border-rule bg-surface-2/60 px-6 py-5 sm:flex-row sm:items-center sm:px-8">
          <p className="text-[16px] text-ink-2">Tell us your monthly volume. We'll send your rate.</p>
          <a href="#demo" className="btn btn-primary">
            Get pricing
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
    </Section>
  );
}
