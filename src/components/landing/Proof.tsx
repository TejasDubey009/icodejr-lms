import CountUp from "./CountUp";

// Figures iCodeJr publishes about its own academy on icodejr.com.
const NUMBERS = [
  { value: "100,000+", label: "hours trained" },
  { value: "5,000+", label: "students trained" },
  { value: "15+", label: "partner schools" },
];

/** Who built this, in numbers: the academy the LMS was made to run. */
export default function Proof() {
  return (
    <section aria-label="About iCodeJr" className="relative">
      <div className="mx-auto max-w-page px-4 pb-4 sm:px-6 lg:px-8">
        <div data-reveal className="card flex flex-col gap-6 px-6 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-[38ch] font-display text-[18px] font-medium leading-snug text-ink">
            Built by a team that teaches live, every day.
            <span className="mt-1 block text-[14px] font-normal text-ink-3">
              iCodeJr academy, UAE. Figures from{" "}
              <a href="https://icodejr.com" target="_blank" rel="noopener" className="link">
                icodejr.com
              </a>
            </span>
          </p>
          <dl className="grid gap-3 min-[420px]:grid-cols-[auto_auto_auto] min-[420px]:justify-between min-[420px]:gap-4 sm:justify-start sm:gap-10">
            {NUMBERS.map((n) => (
              <div key={n.label}>
                <dt className="sr-only">{n.label}</dt>
                <dd className="flex items-baseline gap-3 min-[420px]:block">
                  <span className="num block min-w-[5.5ch] font-display text-[clamp(1.25rem,0.7rem+2.2vw,2rem)] font-medium leading-none text-ink min-[420px]:min-w-0">
                    <CountUp value={n.value} />
                  </span>
                  <span className="block text-[13px] leading-snug text-ink-3 min-[420px]:mt-1.5 min-[420px]:max-w-[12ch] sm:max-w-none">{n.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
