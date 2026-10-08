import { Section } from "./primitives";
import BreakAClass from "./BreakAClass";

// Mirrors the scheduled jobs and webhooks that ship with the platform.
const RULES = [
  { name: "Class reminders", cadence: "24 h · 1 h · 15 min before", tells: "Students, parents" },
  { name: "Zoom attendance sync", cadence: "Every 5 min", tells: "Ops" },
  { name: "Late instructor alert", cadence: "3 min after start", tells: "Instructor, ops, admin" },
  { name: "No-show + credit return", cadence: "20 min after start", tells: "Instructor, ops, admin" },
  { name: "Late-start & short-session penalties", cadence: "Every 10 min", tells: "Instructor, ops, admin" },
  { name: "Recording to private storage", cadence: "When Zoom finishes", tells: "Parents" },
  { name: "Missing class reports", cadence: "Daily", tells: "Instructor, ops" },
  { name: "Overdue installments", cadence: "Daily", tells: "Finance" },
  { name: "Recording expiry (6 months)", cadence: "Daily", tells: "Parents" },
  { name: "Out-of-credit students", cadence: "Nightly", tells: "Retention list" },
  { name: "Events to your n8n", cadence: "Every 2 min", tells: "Your tools" },
];

export default function Automations() {
  return (
    <Section
      id="automations"
      index="01"
      label="Automations"
      title="Try to break a class."
      intro={<p>Pick a problem. Watch what the system does without your ops team.</p>}
    >
      <BreakAClass />

      <div className="mt-16 border-t border-ink">
        <div className="grid grid-cols-12 gap-4 border-b border-rule py-3">
          <span className="meta col-span-7 sm:col-span-6">Always running</span>
          <span className="meta col-span-5 sm:col-span-3">When</span>
          <span className="meta hidden sm:col-span-3 sm:block">Who's told</span>
        </div>
        <ul>
          {RULES.map((r) => (
            <li key={r.name} className="grid grid-cols-12 items-baseline gap-4 border-b border-rule py-3">
              <span className="col-span-7 text-[15px] font-medium text-ink sm:col-span-6">{r.name}</span>
              <span className="col-span-5 font-mono text-[12px] text-data sm:col-span-3">{r.cadence}</span>
              <span className="hidden text-[14px] text-ink-3 sm:col-span-3 sm:block">{r.tells}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
