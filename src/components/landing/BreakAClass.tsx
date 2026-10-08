import { useEffect, useRef, useState } from "react";
import { Bell, CalendarClock, CircleDollarSign, FileWarning, Mail, MessageCircle, UserX } from "lucide-react";
import { cn } from "@/lib/utils";

type Channel = "bell" | "email" | "whatsapp";

interface Step {
  at: string;
  text: string;
  to?: string;
  via?: Channel[];
}

interface Scenario {
  id: string;
  label: string;
  icon: typeof Bell;
  steps: Step[];
  thinking: string;
  result: string;
}

// Each step mirrors what the platform actually does in that situation.
const SCENARIOS: Scenario[] = [
  {
    id: "late",
    label: "Instructor is running late",
    icon: CalendarClock,
    steps: [
      { at: "17:00", text: "Class starts. No instructor in the room." },
      { at: "17:03", text: "Instructor nudged to join", to: "Omar", via: ["bell", "email"] },
      { at: "17:03", text: "Ops and admin alerted", to: "Ops", via: ["bell", "email"] },
      { at: "17:06", text: "Omar joins. Join time recorded from Zoom." },
      { at: "17:10", text: "Late start drafted for review", to: "Team", via: ["bell", "email"] },
    ],
    thinking: "Watching who joins…",
    result: "Class saved.",
  },
  {
    id: "noshow",
    label: "Instructor never shows",
    icon: UserX,
    steps: [
      { at: "17:00", text: "Class starts. No instructor in the room." },
      { at: "17:03", text: "Instructor nudged, ops alerted", to: "Ops", via: ["bell", "email"] },
      { at: "17:20", text: "Marked no-show. Session locked." },
      { at: "17:20", text: "Layla's credit returned to her balance" },
      { at: "17:20", text: "Penalty drafted for the instructor" },
      { at: "17:20", text: "Instructor, ops and admin told", to: "Team", via: ["bell", "email"] },
    ],
    thinking: "Watching who joins…",
    result: "Credit's back with Layla.",
  },
  {
    id: "move",
    label: "Parent wants to move the class",
    icon: MessageCircle,
    steps: [
      { at: "Mon 10:12", text: "Parent picks a new slot in their portal" },
      { at: "Mon 10:40", text: "Ops approves from the requests queue" },
      { at: "Mon 10:40", text: "Old session cancelled, new one booked for Thu 17:30" },
      { at: "Mon 10:40", text: "New Zoom meeting created" },
      { at: "Mon 10:40", text: "Family told the new time", to: "Parent", via: ["whatsapp", "email", "bell"] },
    ],
    thinking: "Finding the new slot…",
    result: "Moved. New link sent.",
  },
  {
    id: "payment",
    label: "An installment is late",
    icon: CircleDollarSign,
    steps: [
      { at: "1 Oct", text: "Installment 2 of 3 due. Nothing received." },
      { at: "2 Oct", text: "Marked overdue in the daily check", to: "Finance", via: ["bell", "email"] },
      { at: "2 Oct", text: "Ops adds 2 emergency credits. Classes continue." },
      { at: "6 Oct", text: "Finance confirms the bank transfer" },
      { at: "6 Oct", text: "Emergency credits offset automatically" },
    ],
    thinking: "Checking the ledger…",
    result: "Ledger balanced.",
  },
  {
    id: "report",
    label: "Nobody files the class report",
    icon: FileWarning,
    steps: [
      { at: "Wed 18:00", text: "Class ends. Attendance comes in from Zoom." },
      { at: "Thu 09:00", text: "Report still missing after 24 h. Flagged.", to: "Omar", via: ["email"] },
      { at: "Thu 09:00", text: "Listed in ops' pending reports" },
      { at: "Thu 11:15", text: "Report filed. Credit moves from blocked to used." },
    ],
    thinking: "Waiting on the report…",
    result: "Closed out.",
  },
];

const CHANNEL: Record<Channel, { icon: typeof Bell; label: string }> = {
  bell: { icon: Bell, label: "In-app" },
  email: { icon: Mail, label: "Email" },
  whatsapp: { icon: MessageCircle, label: "WhatsApp" },
};

const STEP_MS = 520;

export default function BreakAClass() {
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0);
  const reduced = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const scenario = SCENARIOS[active];
  const done = shown >= scenario.steps.length;
  const sent = scenario.steps.reduce((n, s) => n + (s.via?.length ?? 0), 0);

  useEffect(() => {
    if (reduced.current) {
      setShown(scenario.steps.length);
      return;
    }
    setShown(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= scenario.steps.length) window.clearInterval(id);
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [active, scenario.steps.length]);

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-4">
        <p className="meta">Pick what goes wrong</p>
        <div role="radiogroup" aria-label="Scenario" className="mt-4 flex flex-wrap gap-2 lg:flex-col lg:items-start">
          {SCENARIOS.map((s, i) => {
            const Icon = s.icon;
            const on = i === active;
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setActive(i)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-left text-[14px] transition-colors",
                  on ? "border-ink bg-ink text-white" : "border-rule-strong bg-surface text-ink hover:border-ink",
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", on ? "text-white" : "text-data")} aria-hidden />
                {s.label}
              </button>
            );
          })}
        </div>
        <Mascot done={done} line={done ? scenario.result : scenario.thinking} still={reduced.current} />
      </div>

      <div className="lg:col-span-8">
        <div className="relative overflow-hidden rounded-frame border border-rule-strong bg-surface">
          <div className="flex items-center justify-between border-b border-rule bg-surface-2 px-4 py-2.5 sm:px-5">
            <span className="font-mono text-[12px] text-ink-3">Python Foundations · Lesson 7 · Layla H.</span>
            <span className="num font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">
              {Math.min(shown, scenario.steps.length)}/{scenario.steps.length}
            </span>
          </div>

          <ol className="relative px-4 py-5 sm:px-6 sm:pr-44" aria-live="polite">
            <span aria-hidden className="absolute bottom-8 left-[27px] top-8 w-px bg-rule sm:left-[35px]" />
            {scenario.steps.map((s, i) => {
              const visible = i < shown;
              return (
                <li
                  key={`${scenario.id}-${i}`}
                  className={cn(
                    "relative grid grid-cols-[24px_1fr] gap-x-4 pb-4 last:pb-0",
                    visible ? "animate-row-in" : "invisible",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "relative z-10 mt-1 flex h-[22px] w-[22px] items-center justify-center rounded-full border bg-surface",
                      s.via ? "border-data" : "border-rule-strong",
                    )}
                  >
                    <span className={cn("h-2 w-2 rounded-full", s.via ? "bg-data" : "bg-ink-3/60")} />
                  </span>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
                    <p className="text-[14.5px] leading-snug text-ink">
                      <span className="num mr-2.5 font-mono text-[12px] text-ink-3">{s.at}</span>
                      {s.text}
                    </p>
                    {s.via && (
                      <span className="flex items-center gap-1.5">
                        <span className="text-[12px] text-ink-3">{s.to}</span>
                        {s.via.map((c) => {
                          const C = CHANNEL[c];
                          return (
                            <span
                              key={c}
                              title={C.label}
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-data/25 bg-data/[0.07] text-data"
                            >
                              <C.icon className="h-3 w-3" aria-hidden />
                              <span className="sr-only">{C.label}</span>
                            </span>
                          );
                        })}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="flex items-center justify-between gap-4 border-t border-rule bg-surface-2 px-4 py-3 sm:px-5">
            <p className="text-[13px] text-ink-2">
              Messages you didn't send: <span className="num font-semibold text-ink">{done ? sent : "…"}</span>
              {done && <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ok sm:hidden">· Handled</span>}
            </p>
            <button
              type="button"
              onClick={() => setActive((a) => (a + 1) % SCENARIOS.length)}
              className="whitespace-nowrap text-[13px] font-medium text-data hover:text-navy"
            >
              Next problem →
            </button>
          </div>

          {/* Ledger stamp once the scenario resolves */}
          <div
            aria-hidden={!done}
            className={cn(
              "pointer-events-none absolute right-7 top-1/2 hidden -translate-y-1/2 rotate-[-8deg] rounded-[4px] border-2 border-ok/70 px-3 py-1.5 text-center font-mono uppercase text-ok/80 transition-all duration-300 sm:block",
              done ? "scale-100 opacity-100" : "scale-125 opacity-0",
            )}
          >
            <span className="block text-[15px] font-medium tracking-[0.14em]">Handled</span>
            <span className="block text-[10px] tracking-[0.1em]">by the system</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The robot that guides students through the LMS, reacting to the scenario. */
function Mascot({ done, line, still }: { done: boolean; line: string; still: boolean }) {
  const src = (pose: "think" | "cheer") => `/mascot/mascot-${pose}${still ? "-still" : ""}.webp`;
  return (
    <div className="mt-8 flex items-end gap-3" aria-live="polite">
      <div className="relative h-[96px] w-[78px] shrink-0 sm:h-[128px] sm:w-[104px]">
        <img
          src={src("think")}
          alt=""
          width={253}
          height={320}
          loading="lazy"
          className={cn("absolute inset-0 h-full w-full object-contain transition-opacity duration-200", done ? "opacity-0" : "opacity-100")}
        />
        <img
          src={src("cheer")}
          alt=""
          width={244}
          height={320}
          loading="lazy"
          className={cn("absolute inset-0 h-full w-full object-contain transition-opacity duration-200", done ? "opacity-100" : "opacity-0")}
        />
      </div>
      <p className="relative mb-6 rounded-[10px] rounded-bl-[2px] border border-rule-strong bg-surface px-3 py-2 text-[13px] leading-snug text-ink">
        {line}
      </p>
    </div>
  );
}
