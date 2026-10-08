import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Check } from "lucide-react";
import { Frame, Section } from "./primitives";
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

export default function Portals() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const portal = PORTALS[active];

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
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div
          role="tablist"
          aria-label="Portals by role"
          aria-orientation="vertical"
          onKeyDown={onKeyDown}
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:col-span-3 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-t lg:border-ink lg:px-0 [&::-webkit-scrollbar]:hidden"
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
                  "group shrink-0 text-left transition-colors",
                  "rounded-full border px-3.5 py-1.5 text-[14px] lg:rounded-none lg:border-0 lg:border-b lg:border-rule lg:px-0 lg:py-3.5",
                  selected
                    ? "border-ink bg-ink text-white lg:bg-transparent lg:text-ink"
                    : "border-rule-strong text-ink-2 hover:text-ink lg:bg-transparent",
                )}
              >
                <span className="flex items-baseline gap-3">
                  <span
                    className={cn(
                      "num hidden font-mono text-[11px] lg:inline",
                      selected ? "text-data" : "text-ink-3",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={cn("lg:text-[16px]", selected && "font-semibold")}>{p.role}</span>
                </span>
                <span className="ml-[30px] hidden text-[12.5px] text-ink-3 lg:block">{p.who}</span>
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`panel-${portal.id}`}
          aria-labelledby={`tab-${portal.id}`}
          className="grid gap-8 lg:col-span-9 xl:grid-cols-9"
        >
          <div className="xl:col-span-4">
            <p className="text-h3 font-semibold text-ink">{portal.summary}</p>
            <ul className="mt-6 space-y-3.5">
              {portal.can.map((c) => (
                <li key={c} className="flex gap-3 text-[15px] leading-snug text-ink-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-data" aria-hidden />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="xl:col-span-5">
            <Frame key={portal.id} path={portal.path} className="animate-in fade-in duration-300" bodyClassName="min-h-[340px]">
              {portal.mock}
            </Frame>
          </div>
        </div>
      </div>
    </Section>
  );
}
