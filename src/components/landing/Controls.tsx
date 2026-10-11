import { Frame, Initials, Section, Stage, Status } from "./primitives";

const QUEUES = [
  { name: "Instructor leave", count: 3, note: "Shows clashing sessions" },
  { name: "Working-hour changes", count: 1 },
  { name: "Peak-hour changes", count: 0 },
  { name: "Student requests", count: 2, note: "From counsellors" },
  { name: "Counsellor assignments", count: 0 },
  { name: "Finance edits", count: 1, note: "To confirmed payments" },
  { name: "Complimentary credits", count: 2 },
  { name: "Renewals", count: 4, note: "Proof attached" },
  { name: "Credit reversals", count: 1 },
];

const SAFEGUARDS = [
  { title: "Access enforced in the database", body: "Rules per role on every table, not just hidden buttons." },
  { title: "Private recordings", body: "Two-hour signed links, checked against the viewer." },
  { title: "Verified Zoom events", body: "Webhook signatures checked before anything changes." },
  { title: "No-shows locked", body: "Only an admin can override, with a reason." },
  { title: "Full audit trail", body: "Credits, lifecycle and approvals keep who and when." },
];

export default function Controls() {
  return (
    <Section
      id="controls"
      index="07"
      label="Controls"
      title="No more “who approved this?”"
      intro={<p>Money, time off and student records: one person asks, another approves.</p>}
    >
      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <Stage tone="aurora">
            <Frame path="admin / approvals" bodyClassName="p-0">
              <ul>
                {QUEUES.map((q) => (
                  <li key={q.name} className="flex items-center justify-between gap-4 border-b border-rule px-4 py-3 last:border-0 sm:px-5">
                    <span className="min-w-0">
                      <span className="block text-[14px] font-medium text-ink">{q.name}</span>
                      {q.note && <span className="block text-[12.5px] leading-snug text-ink-3">{q.note}</span>}
                    </span>
                    {q.count > 0 ? (
                      <Status tone="data">
                        <span className="num">{q.count}</span> pending
                      </Status>
                    ) : (
                      <Status>Clear</Status>
                    )}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-3 border-t border-rule bg-surface-2 px-4 py-3 sm:px-5">
                <Initials name="Nadia R" />
                <p className="text-[12.5px] text-ink-2">
                  <span className="font-medium text-ink">Leave · Omar K.</span> 22–24 Oct clashes with{" "}
                  <span className="num font-medium text-alert">5 sessions</span>. Ops reschedules or cancels each one.
                </p>
              </div>
            </Frame>
          </Stage>
        </div>
        <div className="lg:col-span-6">
          <dl className="divide-y divide-rule border-y border-rule">
            {SAFEGUARDS.map((s) => (
              <div key={s.title} className="py-5">
                <dt className="font-display text-[17px] font-medium text-ink">{s.title}</dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed text-ink-3">{s.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}
