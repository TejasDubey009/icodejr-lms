import type { ReactNode } from "react";
import { Initials, Meter, Status } from "../primitives";
import { cn } from "@/lib/utils";

/* Shared bits ------------------------------------------------------------ */

function Panel({ title, meta, children, className }: { title: string; meta?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("border-b border-rule last:border-b-0", className)}>
      <div className="flex items-baseline justify-between gap-3 px-4 pb-1 pt-3 sm:px-5">
        <p className="meta">{title}</p>
        {meta && <span className="text-[12px] text-ink-3">{meta}</span>}
      </div>
      <div className="px-4 pb-3 sm:px-5">{children}</div>
    </div>
  );
}

function Kpi({ label, value, note, tone }: { label: string; value: string; note?: string; tone?: "data" | "alert" | "warn" }) {
  return (
    <div className="px-3 py-3">
      <p className="meta">{label}</p>
      <p
        className={cn(
          "num mt-1 text-[24px] font-semibold leading-none tracking-tight",
          tone === "data" && "text-data",
          tone === "alert" && "text-alert",
          tone === "warn" && "text-warn",
          !tone && "text-ink",
        )}
      >
        {value}
      </p>
      {note && <p className="mt-1 text-[11.5px] text-ink-3">{note}</p>}
    </div>
  );
}

function KpiRow({ children }: { children: ReactNode }) {
  return <div className="cq-cols gap-px border-b border-rule bg-rule [&>*]:bg-surface">{children}</div>;
}

function Line({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex items-center justify-between gap-3 border-b border-rule py-2 last:border-0", className)}>{children}</div>;
}

const t = "font-mono text-[11.5px] text-ink-3 num";

/* Admin ------------------------------------------------------------------ */

export function AdminMock() {
  const reasons = [
    { r: "Schedule conflict", n: 3 },
    { r: "Price", n: 2 },
    { r: "Moved", n: 1 },
    { r: "Child lost interest", n: 1 },
  ];
  return (
    <>
      <KpiRow>
        <Kpi label="Active students" value="312" />
        <Kpi label="Sessions this week" value="486" />
        <Kpi label="Approvals" value="14" tone="data" note="9 request types" />
        <Kpi label="Reports overdue" value="3" tone="alert" note="older than 24 h" />
      </KpiRow>
      <div className="grid sm:grid-cols-2 sm:divide-x sm:divide-rule">
        <Panel title="Credits exhausted" meta="needs a renewal call">
          {[
            ["Yousef A.", "6 days", "Counsellor: Hiba"],
            ["Mira S.", "3 days", "Counsellor: Hiba"],
            ["Adam K.", "Today", "Unassigned"],
          ].map(([n, d, c]) => (
            <Line key={n}>
              <span className="flex min-w-0 items-center gap-2">
                <Initials name={n} />
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium text-ink">{n}</span>
                  <span className="block text-[11.5px] text-ink-3">{c}</span>
                </span>
              </span>
              <span className={t}>{d}</span>
            </Line>
          ))}
        </Panel>
        <Panel title="Not renewed" meta="this month · 7">
          <ul className="space-y-2.5 pt-1">
            {reasons.map((x) => (
              <li key={x.r}>
                <div className="flex justify-between text-[12.5px]">
                  <span className="text-ink-2">{x.r}</span>
                  <span className="num text-ink">{x.n}</span>
                </div>
                <div className="mt-1">
                  <Meter value={x.n} max={3} tone="warn" />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

/* Ops -------------------------------------------------------------------- */

export function OpsMock() {
  const sessions: [string, string, string, ReactNode][] = [
    ["16:30", "Minecraft · Lesson 2", "Sara M. → Yara B.", <Status tone="ok" dot>Live</Status>],
    ["15:30", "Python · Lesson 9", "Omar K. → Noor A.", <Status tone="alert">No-show</Status>],
    ["17:00", "Trial · Python", "Omar K. → Hana T.", <Status tone="data">In 12 min</Status>],
    ["15:00", "Web Design · Lesson 3", "Ali F. → Karim D.", <Status tone="warn">Report due</Status>],
  ];
  return (
    <>
      <Panel title="Today" meta="Thu 16 Oct · GST">
        {sessions.map(([time, title, who, s]) => (
          <Line key={title}>
            <span className="flex min-w-0 items-start gap-3">
              <span className={cn(t, "pt-0.5")}>{time}</span>
              <span className="min-w-0">
                <span className="block text-[13px] font-medium leading-snug text-ink">{title}</span>
                <span className="block text-[11.5px] text-ink-3">{who}</span>
              </span>
            </span>
            {s}
          </Line>
        ))}
      </Panel>
      <Panel title="Requests from parents and instructors">
        <div className="cq-cols gap-x-6">
          {[
            ["Reschedules", "2"],
            ["Cancellations", "1"],
            ["Instructor changes", "1"],
            ["Helpdesk", "4"],
          ].map(([k, v]) => (
            <div key={k} className="py-1.5">
              <p className="num text-[20px] font-semibold text-ink">{v}</p>
              <p className="text-[11.5px] text-ink-3">{k}</p>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

/* Instructor ------------------------------------------------------------- */

export function InstructorMock() {
  return (
    <>
      <Panel title="Next class" meta="in 25 min">
        <div className="flex flex-wrap items-center justify-between gap-3 py-1.5">
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-ink">Python Foundations · Lesson 7</p>
            <p className="text-[12px] text-ink-3">Layla H. · 1:1 · 17:00–18:00 GST</p>
          </div>
          <span className="inline-flex h-8 items-center rounded-full bg-ink px-3.5 text-[12.5px] font-medium text-white">Start Zoom</span>
        </div>
      </Panel>
      <Panel title="Post-class report" meta="Roblox · Lesson 1 · Omar S. · 15:15">
        <div className="space-y-2 py-1">
          <div className="flex flex-wrap gap-1.5">
            <Status tone="ok">Attended · 44 min</Status>
            <Status>Objectives met</Status>
            <Status tone="data">Homework set</Status>
          </div>
          <div className="rounded-[4px] border border-rule bg-surface-2 px-3 py-2 text-[12.5px] leading-relaxed text-ink-2">
            Built and published a first obby course. Next lesson: checkpoints with a short script. Needs more practice with the move tool.
          </div>
        </div>
      </Panel>
      <div className="grid grid-cols-3 divide-x divide-rule">
        <Kpi label="To grade" value="6" tone="data" />
        <Kpi label="This week" value="18" note="sessions" />
        <Kpi label="Penalties" value="0" />
      </div>
    </>
  );
}

/* Parent ----------------------------------------------------------------- */

export function ParentMock() {
  return (
    <>
      <div className="flex items-center gap-2 border-b border-rule px-4 py-2.5 sm:px-5">
        {["Layla H.", "Sami H."].map((n, i) => (
          <span
            key={n}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border py-0.5 pl-0.5 pr-2.5 text-[12px]",
              i === 0 ? "border-ink bg-surface text-ink" : "border-rule text-ink-3",
            )}
          >
            <Initials name={n} className="h-5 w-5 text-[9px]" />
            {n}
          </span>
        ))}
      </div>
      <Panel title="Next class">
        <div className="flex flex-wrap items-center justify-between gap-3 py-1">
          <div>
            <p className="text-[14px] font-semibold text-ink">Wed 17:00 · Python Foundations</p>
            <p className="text-[12px] text-ink-3">with Omar K. · Meeting ID and passcode ready</p>
          </div>
          <div className="flex gap-1.5">
            <span className="inline-flex h-8 items-center rounded-full border border-rule-strong px-3 text-[12px] text-ink">Reschedule</span>
            <span className="inline-flex h-8 items-center rounded-full bg-ink px-3 text-[12px] font-medium text-white">Join</span>
          </div>
        </div>
      </Panel>
      <div className="grid sm:grid-cols-2 sm:divide-x sm:divide-rule">
        <Panel title="Sessions">
          <p className="num pt-1 text-[24px] font-semibold leading-none text-data">
            12 <span className="text-[13px] font-normal text-ink-3">available of 25</span>
          </p>
          <div className="mt-2.5">
            <Meter value={12} max={25} />
          </div>
          <p className="mt-2 text-[11.5px] text-ink-3">Attendance this term 94% · 1 late join</p>
        </Panel>
        <Panel title="Recordings">
          {[
            ["Lesson 6", "6 Oct"],
            ["Lesson 5", "29 Sep"],
          ].map(([l, d]) => (
            <Line key={l}>
              <span className="text-[13px] text-ink">{l}</span>
              <span className={t}>{d}</span>
            </Line>
          ))}
        </Panel>
      </div>
    </>
  );
}

/* Student ---------------------------------------------------------------- */

export function StudentMock() {
  const done = 14;
  const total = 24;
  const lessons: [string, boolean[]][] = [
    ["L11", [true, true, true, true]],
    ["L12", [true, true, false, true]],
    ["L13", [true, true, true, false]],
    ["L14", [true, false, false, false]],
  ];
  return (
    <>
      <Panel title="Python Foundations" meta="Ages 10–13">
        <div className="flex items-end justify-between gap-4 pt-1">
          <p className="num text-[30px] font-semibold leading-none text-data">
            {done}
            <span className="text-[15px] font-medium text-ink-3"> / {total} sessions</span>
          </p>
          <p className="num font-mono text-[12px] text-ink-3">{Math.round((done / total) * 100)}%</p>
        </div>
        <div className="mt-2.5">
          <Meter value={done} max={total} />
        </div>
      </Panel>
      <Panel title="Recent lessons">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-1 font-normal" />
              {["Attended", "Homework", "Quiz", "Assignment"].map((h) => (
                <th key={h} scope="col" className="py-1 text-center text-[11px] font-normal text-ink-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lessons.map(([l, ticks]) => (
              <tr key={l} className="border-t border-rule">
                <th scope="row" className="py-1.5 font-mono text-[11.5px] font-normal text-ink-2">
                  {l}
                </th>
                {ticks.map((t, i) => (
                  <td key={i} className="py-1.5 text-center">
                    <span
                      aria-label={t ? "done" : "not done"}
                      className={cn(
                        "inline-block h-3.5 w-3.5 rounded-[3px] border",
                        t ? "border-ok bg-ok/80" : "border-rule-strong bg-surface",
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <Panel title="Due this week">
        <Line>
          <span className="text-[13px] text-ink">Quiz · Loops</span>
          <span className="flex items-center gap-3">
            <span className={t}>Fri</span>
            <Status tone="data">Open</Status>
          </span>
        </Line>
      </Panel>
    </>
  );
}

/* Counsellor ------------------------------------------------------------- */

export function CounsellorMock() {
  const rows: [string, string, "ok" | "warn" | "alert", string, string][] = [
    ["Yousef A.", "Credits exhausted", "alert", "Red", "Check-in due"],
    ["Noor A.", "Active", "warn", "Amber", "Missed 2 classes"],
    ["Layla H.", "Active", "ok", "Green", "Checked in 2 Oct"],
    ["Hana T.", "Trial", "ok", "Green", "Trial booked"],
  ];
  return (
    <>
      <Panel title="My students" meta="assigned to you · 38">
        {rows.map(([n, stage, tone, rag, note]) => (
          <Line key={n}>
            <span className="flex min-w-0 items-center gap-2">
              <Initials name={n} />
              <span className="min-w-0">
                <span className="block text-[13px] font-medium text-ink">{n}</span>
                <span className="block text-[11.5px] text-ink-3">{note}</span>
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span className="hidden text-[11.5px] text-ink-3 sm:inline">{stage}</span>
              <Status tone={tone} dot>
                {rag}
              </Status>
            </span>
          </Line>
        ))}
      </Panel>
      <Panel title="Logged interaction" meta="WhatsApp · today 11:40">
        <p className="py-1 text-[12.5px] leading-relaxed text-ink-2">
          Spoke to Yousef's mother about renewing. Wants weekend slots; following up Sunday.
        </p>
      </Panel>
    </>
  );
}

/* Sales ------------------------------------------------------------------ */

export function SalesMock() {
  const cols: { stage: string; leads: { n: string; d: string; tag?: ReactNode }[] }[] = [
    { stage: "New", leads: [{ n: "Rania K.", d: "Meta Ads · 2 kids" }, { n: "Omar S.", d: "Referral" }] },
    { stage: "Trial set", leads: [{ n: "Hana T.", d: "Thu 17:00", tag: <Status tone="data">Link sent</Status> }] },
    { stage: "Trial done", leads: [{ n: "Faris M.", d: "Feedback 5/5" }] },
    { stage: "Won", leads: [{ n: "Dana E.", d: "24 sessions", tag: <Status tone="warn">To approve</Status> }] },
  ];
  return (
    <div className="cq-cols gap-px bg-rule">
      {cols.map((c) => (
        <div key={c.stage} className="min-h-[150px] min-w-0 bg-surface-2 p-3">
          <p className="meta flex justify-between gap-2 whitespace-nowrap">
            {c.stage}
            <span className="num text-ink">{c.leads.length}</span>
          </p>
          <ul className="mt-3 space-y-2">
            {c.leads.map((l) => (
              <li key={l.n} className="rounded-[4px] border border-rule bg-surface p-2.5">
                <p className="text-[12.5px] font-medium text-ink">{l.n}</p>
                <p className="mt-0.5 text-[11.5px] text-ink-3">{l.d}</p>
                {l.tag && <div className="mt-2">{l.tag}</div>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* Finance ---------------------------------------------------------------- */

export function FinanceMock() {
  const rows: [string, string, string, string, "ok" | "warn" | "data" | "alert" | "neutral"][] = [
    ["Dana E.", "Full Payment", "4,800", "Pending Gateway", "data"],
    ["Faris M.", "Installment 2 of 3", "1,600", "Pending Bank Recon", "warn"],
    ["Layla H.", "Installment 3 of 3", "1,600", "Confirmed", "ok"],
    ["Sami H.", "Installment 1 of 2", "2,400", "Overdue", "alert"],
    ["Mira S.", "Renewal", "3,200", "Upcoming", "neutral"],
  ];
  return (
    <div>
      <table className="w-full text-left">
        <caption className="sr-only">Sample payment receipts</caption>
        <thead>
          <tr className="border-b border-rule bg-surface-2">
            <th scope="col" className="meta py-2 pl-4 pr-3 font-normal">Student</th>
            <th scope="col" className="cq-wide meta px-3 py-2 font-normal">Plan</th>
            <th scope="col" className="cq-wide meta px-3 py-2 text-right font-normal">AED</th>
            <th scope="col" className="meta py-2 pl-3 pr-4 font-normal">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([n, plan, amt, st, tone]) => (
            <tr key={n} className="border-b border-rule last:border-0">
              <td className="py-2.5 pl-4 pr-3 text-[13px] font-medium text-ink">
                {n}
                <span className="cq-narrow block text-[11.5px] font-normal text-ink-3">{plan}</span>
              </td>
              <td className="cq-wide px-3 py-2.5 text-[12.5px] text-ink-2">{plan}</td>
              <td className="cq-wide num px-3 py-2.5 text-right text-[12.5px] text-ink">{amt}</td>
              <td className="py-2.5 pl-3 pr-4">
                <Status tone={tone}>{st}</Status>
                <span className="cq-narrow num mt-1 block text-[11.5px] text-ink-2">AED {amt}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-rule bg-surface-2 px-4 py-2.5 text-[11.5px] text-ink-3">
        <span>
          Confirmed this month <span className="num font-medium text-ink">AED 38,400</span>
        </span>
        <span>
          Awaiting match <span className="num font-medium text-ink">AED 6,400</span>
        </span>
      </div>
    </div>
  );
}

/* Curriculum ------------------------------------------------------------- */

export function CurriculumMock() {
  const lessons: [string, string[], ReactNode][] = [
    ["Lesson 5 · Lists", ["Slides", "Quiz", "Homework"], <Status tone="ok">Approved</Status>],
    ["Lesson 6 · While loops", ["Slides", "Homework"], <Status tone="ok">Approved</Status>],
    ["Lesson 7 · Functions", ["Slides", "Quiz", "Assignment"], <Status tone="warn">In review</Status>],
    ["Project · Number game", ["Brief", "Starter files"], <Status>Draft</Status>],
  ];
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-4 py-3 sm:px-5">
        <div>
          <p className="text-[14px] font-semibold text-ink">Python Foundations</p>
          <p className="text-[12px] text-ink-3">Template · Ages 10–13 · 24 sessions</p>
        </div>
        <Status tone="warn">1 lesson in review</Status>
      </div>
      <Panel title="Module 2 · Control flow" meta="4 items">
        {lessons.map(([name, items, s]) => (
          <Line key={name}>
            <span className="min-w-0">
              <span className="block text-[13px] font-medium text-ink">{name}</span>
              <span className="mt-0.5 flex flex-wrap gap-1">
                {items.map((i) => (
                  <span key={i} className="rounded-[3px] bg-surface-2 px-1.5 py-px text-[10.5px] text-ink-3 ring-1 ring-rule">
                    {i}
                  </span>
                ))}
              </span>
            </span>
            {s}
          </Line>
        ))}
      </Panel>
    </>
  );
}
