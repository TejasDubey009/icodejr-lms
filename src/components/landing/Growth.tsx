import { useRef } from "react";
import { m, useScroll, useSpring } from "framer-motion";
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
  // The line fills in as the timeline moves up the screen
  const trackRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start 80%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 26, restDelta: 0.001 });

  return (
    <Section
      id="growth"
      index="05"
      label="Sales & retention"
      title="Lead to renewal. One record."
      intro={<p>Nobody types the parent's number in twice.</p>}
    >
      <ol ref={trackRef} className="relative lg:grid lg:grid-cols-7">
        <m.li
          aria-hidden
          style={{ scaleY: fill }}
          className="absolute -left-px bottom-0 top-0 w-[3px] origin-top rounded-full bg-gradient-to-b from-brand to-sun lg:hidden"
        />
        <m.li
          aria-hidden
          style={{ scaleX: fill }}
          className="absolute -top-px left-0 right-0 hidden h-[3px] origin-left rounded-full bg-gradient-to-r from-brand to-sun lg:block"
        />
        {STAGES.map((s, i) => (
          <li
            key={s.name}
            className="relative border-l border-rule-strong pb-8 pl-6 last:pb-0 lg:border-l-0 lg:border-t lg:pb-0 lg:pl-0 lg:pr-4 lg:pt-5"
          >
            <span
              aria-hidden
              className="absolute -left-[6px] top-1.5 z-10 h-[11px] w-[11px] rounded-full border-2 border-canvas bg-brand lg:-top-[6px] lg:left-0"
            />
            <p className="num text-sunset font-display text-[20px] font-medium leading-none">
              {String(i + 1).padStart(2, "0")}
            </p>
            <p className="mt-2 font-display text-[17px] font-medium leading-tight text-ink">{s.name}</p>
            <p className="mt-1 text-[12.5px] text-ink-3">{s.owner}</p>
            <p className="mt-2 max-w-[44ch] text-[14.5px] leading-relaxed text-ink-2 lg:mt-3">{s.what}</p>
          </li>
        ))}
      </ol>

      <div className="mt-14 grid gap-10 border-t border-rule pt-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <h3 className="text-h3 font-medium text-ink">Know why families leave.</h3>
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
