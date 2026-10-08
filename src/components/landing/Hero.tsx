import { ArrowRight } from "lucide-react";
import ClassRecord from "./ClassRecord";

// Values taken from the platform's own configuration, not marketing estimates.
const FACTS = [
  { value: "9", unit: "", label: "Role portals" },
  { value: "15", unit: "min", label: "Scheduling grid" },
  { value: "5", unit: "min", label: "Zoom attendance sync" },
  { value: "20", unit: "min", label: "Auto no-show check" },
  { value: "6", unit: "mo", label: "Private recordings" },
];

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-canvas">
      <div
        aria-hidden
        className="ledger-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />
      <div className="relative mx-auto max-w-page px-4 pb-16 pt-12 sm:px-6 md:pt-16 lg:px-8 lg:pb-20 lg:pt-20">
        <p className="meta">Operations platform for live online academies</p>
        <h1 className="mt-6 max-w-[13ch] text-display font-semibold text-ink lg:max-w-[16ch]">
          Every live class, accounted for.
        </h1>

        <div className="mt-10 grid items-start gap-12 lg:mt-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5 xl:col-span-4">
            <p className="max-w-[40ch] text-[19px] leading-relaxed text-ink-2">
              Scheduling, Zoom, attendance, credits, payments and parent updates for live online academies. One
              system, nine portals.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#demo" className="btn btn-primary">
                Book a demo
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <a href="#portals" className="btn btn-secondary">
                See the nine portals
              </a>
            </div>
            <p className="mt-8 max-w-[40ch] border-t border-rule pt-5 text-[14px] leading-relaxed text-ink-3">
              Built by iCodeJr to run its own live coding classes.
            </p>
          </div>

          <div className="lg:col-span-7 xl:col-span-8">
            <ClassRecord />
            <p className="mt-3 text-caption text-ink-3">Sample session. Every line is written automatically.</p>
          </div>
        </div>

        <dl className="mt-16 grid grid-cols-2 border-l border-t border-rule sm:grid-cols-3 lg:mt-20 lg:grid-cols-5">
          {FACTS.map((f) => (
            <div key={f.label} className="border-b border-r border-rule bg-canvas/80 px-4 py-5 sm:px-5">
              <dt className="sr-only">{f.label}</dt>
              <dd>
                <span className="num text-[34px] font-semibold leading-none tracking-tight text-data">
                  {f.value}
                  {f.unit && <span className="ml-1 text-[18px] font-medium">{f.unit}</span>}
                </span>
                <span className="mt-2 block text-[13px] leading-snug text-ink-2">{f.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
