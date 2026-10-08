import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Frame, Status } from "./primitives";

type Tone = "ok" | "warn" | "data" | "neutral";

interface Entry {
  day: string;
  time: string;
  event: string;
  detail: string;
  by: string;
  tag: { label: string; tone: Tone };
}

// One 1:1 class, as the system records it. Sample data; every step maps to a real platform behaviour.
const ENTRIES: Entry[] = [
  { day: "Mon", time: "09:12", event: "Session scheduled", detail: "Wed 17:00 GST · 60 min · 1:1", by: "Ops", tag: { label: "1 credit blocked", tone: "neutral" } },
  { day: "Mon", time: "09:12", event: "Zoom meeting created", detail: "Start and join links ready", by: "System", tag: { label: "Link ready", tone: "ok" } },
  { day: "Wed", time: "16:00", event: "Reminder sent to parent", detail: "WhatsApp · email · in-app", by: "System", tag: { label: "Delivered", tone: "ok" } },
  { day: "Wed", time: "16:58", event: "Instructor joined", detail: "Detected from Zoom", by: "Zoom", tag: { label: "On time", tone: "ok" } },
  { day: "Wed", time: "17:01", event: "Student joined", detail: "Detected from Zoom", by: "Zoom", tag: { label: "Present", tone: "ok" } },
  { day: "Wed", time: "18:04", event: "Attendance recorded", detail: "Student in class 58 of 60 min", by: "Zoom sync", tag: { label: "58 min", tone: "data" } },
  { day: "Wed", time: "18:20", event: "Post-class report submitted", detail: "Lesson 7 covered · homework set", by: "Instructor", tag: { label: "Report in", tone: "ok" } },
  { day: "Wed", time: "18:20", event: "Credit used", detail: "Moved from blocked to used", by: "Ledger", tag: { label: "12 available", tone: "data" } },
  { day: "Wed", time: "18:46", event: "Recording available", detail: "Private storage · parent notified", by: "System", tag: { label: "Ready", tone: "ok" } },
];

const STEP_MS = 650;

export default function ClassRecord() {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(reduced ? ENTRIES.length : 0);
  const [run, setRun] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  // Start the playback only once the record is on screen.
  useEffect(() => {
    if (reduced) return;
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRun((r) => r + 1);
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (reduced || run === 0) return;
    let i = 1;
    setShown(i);
    const id = window.setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= ENTRIES.length) window.clearInterval(id);
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [run, reduced]);

  const done = shown >= ENTRIES.length;

  return (
    <div ref={rootRef}>
      <Frame
        path="sessions / 4821"
        aside={
          done ? (
            <button
              type="button"
              onClick={() => setRun((r) => r + 1)}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3 hover:text-ink"
            >
              <RotateCcw className="h-3 w-3" aria-hidden />
              Replay
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-data">
              <span className="h-1.5 w-1.5 animate-blink rounded-full bg-data" aria-hidden />
              Recording
            </span>
          )
        }
      >
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-rule px-4 py-4 sm:px-5">
          <div>
            <p className="meta">Session record</p>
            <p className="mt-1 text-[15px] font-semibold text-ink">Python Foundations · Lesson 7</p>
            <p className="mt-0.5 text-[13px] text-ink-3">Instructor Omar K. · Student Layla H. · Wed 17:00 GST</p>
          </div>
          <Status tone={done ? "ok" : "data"} dot>
            {done ? "Completed" : "In progress"}
          </Status>
        </div>

        <ol aria-label="Session timeline" className="relative">
          {ENTRIES.map((e, i) => {
            const visible = i < shown;
            if (!visible) {
              // Unwritten line: keeps the record's height while it fills in.
              return (
                <li
                  key={i}
                  aria-hidden
                  className="grid grid-cols-[52px_1fr] items-center gap-x-3 border-b border-rule px-4 py-2 last:border-0 sm:grid-cols-[64px_1fr_auto] sm:px-5"
                >
                  <span className="font-mono text-[11.5px] leading-5 text-rule-strong">··· ··:··</span>
                  <span className="block py-[11px]">
                    <span className="block h-2 rounded-full bg-rule/60" style={{ width: `${46 + ((i * 17) % 30)}%` }} />
                  </span>
                  <span className="hidden sm:block" />
                </li>
              );
            }
            return (
              <li
                key={i}
                className="grid animate-row-in grid-cols-[52px_1fr] items-start gap-x-3 border-b border-rule px-4 py-2 last:border-0 sm:grid-cols-[64px_1fr_auto] sm:px-5"
              >
                <span className="num pt-px font-mono text-[11.5px] leading-5 text-ink-3">
                  <span className="text-ink-2">{e.day}</span> {e.time}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-medium leading-5 text-ink">{e.event}</span>
                  <span className="block truncate text-[12.5px] leading-5 text-ink-3">
                    {e.detail}
                    <span className="text-rule-strong"> · </span>
                    {e.by}
                  </span>
                  <span className="mt-1.5 block sm:hidden">
                    <Status tone={e.tag.tone}>{e.tag.label}</Status>
                  </span>
                </span>
                <span className="hidden pt-0.5 sm:block">
                  <Status tone={e.tag.tone}>{e.tag.label}</Status>
                </span>
              </li>
            );
          })}
        </ol>
      </Frame>
    </div>
  );
}

function usePrefersReducedMotion() {
  const [reduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  return reduced;
}
