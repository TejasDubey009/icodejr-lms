import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { m } from "framer-motion";
import { Check } from "lucide-react";
import { Frame, Section, Stage } from "./primitives";
import {
  AdminMock,
  CounsellorMock,
  CurriculumMock,
  FinanceMock,
  InstructorMock,
  OpsMock,
  ParentMock,
  SalesMock,
  StudentMock,
} from "./mocks/PortalMocks";
import { cn } from "@/lib/utils";

interface Portal {
  id: string;
  role: string;
  who: string;
  path: string;
  summary: string;
  can: string[];
  mock: ReactNode;
}

const PORTALS: Portal[] = [
  {
    id: "ops",
    role: "Operations",
    who: "Ops team",
    path: "ops / dashboard",
    summary: "Today's classes and every exception.",
    can: ["Bulk-schedule on a 15-minute grid", "Live, late, no-show and missing-report status", "Reschedules, cancellations and renewals in one queue"],
    mock: <OpsMock />,
  },
  {
    id: "instructor",
    role: "Instructor",
    who: "Teachers and tutors",
    path: "instructor",
    summary: "Start class. File the report. Done.",
    can: ["One-click Zoom start", "Post-class reports and grading", "Availability, leave and earnings"],
    mock: <InstructorMock />,
  },
  {
    id: "parent",
    role: "Parent",
    who: "Families",
    path: "parent",
    summary: "Every child, one login.",
    can: ["Join classes and watch recordings", "Reschedule, cancel or book a PTM in-app", "Sessions left, payment plan, receipts"],
    mock: <ParentMock />,
  },
  {
    id: "student",
    role: "Student",
    who: "Learners",
    path: "dashboard",
    summary: "Lessons, work due, progress.",
    can: ["Quizzes, homework, assignments, projects", "Recordings of every class", "Certificates with QR verification"],
    mock: <StudentMock />,
  },
  {
    id: "counsellor",
    role: "Counsellor",
    who: "Student success",
    path: "counsellor / students",
    summary: "Who's at risk, and what was said.",
    can: ["Red / amber / green student list", "Monthly check-ins and call logs", "Renewal outcomes with reasons"],
    mock: <CounsellorMock />,
  },
  {
    id: "sales",
    role: "Sales",
    who: "Executives and managers",
    path: "sales / pipeline",
    summary: "Lead to trial to signed family.",
    can: ["Your own pipeline stages", "Trial links that need no account", "Won deals create the accounts"],
    mock: <SalesMock />,
  },
  {
    id: "finance",
    role: "Finance",
    who: "Accounts",
    path: "finance / gateway",
    summary: "Every receipt matched before credits move.",
    can: ["Gateway and bank reconciliation", "Installments, upcoming and overdue", "Credits released on confirmation"],
    mock: <FinanceMock />,
  },
  {
    id: "curriculum",
    role: "Curriculum",
    who: "Heads and contributors",
    path: "curriculum / courses / build",
    summary: "Build once, review, reuse.",
    can: ["Modules, lessons, quizzes, projects", "Draft → review → approve", "A shared template library"],
    mock: <CurriculumMock />,
  },
  {
    id: "admin",
    role: "Admin",
    who: "Owners",
    path: "admin",
    summary: "The whole academy at a glance.",
    can: ["Retention: who's out of credits, who left and why", "Approval queues for money and time off", "Settings, roles and overrides"],
    mock: <AdminMock />,
  },
];

const STAGE_TONES = ["candy", "aurora", "sunset", "dusk"] as const;

export default function Portals() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = {
      ArrowDown: 1,
      ArrowRight: 1,
      ArrowUp: -1,
      ArrowLeft: -1,
    };
    let next: number | null = null;
    if (e.key in keys) next = (active + keys[e.key] + PORTALS.length) % PORTALS.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = PORTALS.length - 1;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <Section
      id="portals"
      index="02"
      label="Portals"
      tone="surface"
      title="Nine portals. One academy."
      intro={<p>Same session: a Start button for the instructor, Join for the family, a status for ops.</p>}
    >
      <div
        role="tablist"
        aria-label="Portals by role"
        onKeyDown={onKeyDown}
        className="flex flex-wrap justify-center gap-2"
      >
        {PORTALS.map((p, i) => {
          const selected = i === active;
          return (
            <button
              key={p.id}
              ref={(el) => (tabRefs.current[i] = el)}
              role="tab"
              id={`tab-${p.id}`}
              aria-selected={selected}
              aria-controls={`panel-${p.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={cn(
                "relative isolate rounded-full border px-4 py-2 font-display text-[14.5px] transition-colors duration-200",
                selected
                  ? "border-brand font-medium text-night"
                  : "border-rule-strong/60 bg-surface/70 text-ink-2 hover:border-brand hover:text-ink",
              )}
            >
              {/* One highlight that slides between tabs */}
              {selected && (
                <m.span
                  aria-hidden
                  layoutId="portal-pill"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-0 -z-10 rounded-full bg-brand"
                />
              )}
              {p.role}
            </button>
          );
        })}
      </div>

      {/* Every panel's copy is in the page for search engines; only the open one shows its screen */}
      {PORTALS.map((p, i) => {
        const selected = i === active;
        return (
          <div
            key={p.id}
            role="tabpanel"
            id={`panel-${p.id}`}
            aria-labelledby={`tab-${p.id}`}
            hidden={!selected}
            className={cn("mt-10 items-center gap-10 lg:grid-cols-12 lg:gap-12", selected && "grid")}
          >
            <div className="lg:col-span-5">
              <p className="meta">{p.who}</p>
              <h3 className="mt-2 text-h3 font-medium text-ink">{p.summary}</h3>
              <ul className="mt-6">
                {p.can.map((c) => (
                  <li
                    key={c}
                    className="flex gap-3 border-t border-rule py-4 text-[16px] leading-snug text-ink-2 last:border-b"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-mint" aria-hidden />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-7">
              {selected && (
                <Stage tone={STAGE_TONES[i % STAGE_TONES.length]} className="animate-in fade-in zoom-in-[0.985] duration-300">
                  <Frame path={p.path} bodyClassName="min-h-[340px]">
                    {p.mock}
                  </Frame>
                </Stage>
              )}
            </div>
          </div>
        );
      })}
    </Section>
  );
}
