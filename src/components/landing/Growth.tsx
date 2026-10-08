import { Section } from "./primitives";

const STAGES = [
  { name: "Lead", owner: "Sales", what: "Your stages. Stale leads flagged after 3 days." },
  { name: "Trial", owner: "Sales", what: "Join link, no account. Feedback on the lead." },
  { name: "Won", owner: "Manager", what: "Approved. Parent and student accounts created." },
  { name: "Paid", owner: "Finance", what: "Confirmed. Credits released." },
  { name: "Active", owner: "Ops · Counsellor", what: "Classes, check-ins, call logs." },
  { name: "Out of credits", owner: "System", what: "Flagged nightly for a renewal call." },
  { name: "Renewed or lost", owner: "Counsellor", what: "Renewal approved, or a reason recorded." },
];

const REASONS = [
  "Price",
  "Schedule conflict",
  "Child lost interest",
  "Switched to a competitor",
  "Moved",
  "Family circumstance",
  "Dissatisfied",
  "No response",
  "Other, with notes",
];

export default function Growth() {
  return (
    <Section
      id="growth"
      index="05"
      label="Sales & retention"
      title="Lead to renewal. One record."
      intro={<p>Nobody types the parent's number in twice.</p>}
    >
      <ol className="-mx-4 flex snap-x overflow-x-auto px-4 pb-2 [scrollbar-width:thin] sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-7 lg:overflow-visible lg:px-0">
        {STAGES.map((s, i) => (
          <li
            key={s.name}
            className="relative w-[240px] shrink-0 snap-start border-l border-t border-ink/80 pr-4 pt-4 first:border-l-0 lg:w-auto lg:border-l-0"
          >
            <span className="absolute -top-[5px] left-0 h-[9px] w-[9px] rounded-full border-2 border-canvas bg-ink" aria-hidden />
            <div className="pl-4 lg:pl-0 lg:pr-3">
              <p className="num font-mono text-[11px] text-data">{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-2 text-[16px] font-semibold leading-tight text-ink">{s.name}</p>
              <p className="mt-1 text-[12.5px] text-ink-3">{s.owner}</p>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{s.what}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-14 grid gap-10 border-t border-rule pt-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <h3 className="text-h3 font-semibold text-ink">Know why families leave.</h3>
          <p className="mt-3 max-w-[44ch] text-[15.5px] leading-relaxed text-ink-2">
            Every lost renewal needs a reason. Admins see the breakdown by month.
          </p>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <p className="meta">Reason codes</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {REASONS.map((r) => (
              <li key={r} className="rounded-panel border border-rule-strong bg-surface px-3 py-1.5 text-[13.5px] text-ink-2">
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
