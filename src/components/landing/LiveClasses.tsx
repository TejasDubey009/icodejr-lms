import { useState } from "react";
import { Frame, Section } from "./primitives";
import { cn } from "@/lib/utils";

type Kind = "class" | "trial" | "flag";

interface Slot {
  day: number;
  start: number; // minutes from 15:00 academy time
  len: number;
  title: string;
  who: string;
  kind: Kind;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const START_HOUR = 15;
const HOURS = 4; // 15:00 – 19:00
const ROW = 18; // px per 15 minutes

const SLOTS: Slot[] = [
  { day: 0, start: 0, len: 60, title: "Python · L6", who: "Layla H.", kind: "class" },
  { day: 0, start: 90, len: 45, title: "Scratch · L2", who: "Zayd R.", kind: "class" },
  { day: 1, start: 60, len: 60, title: "Web Design · L5", who: "Lina M.", kind: "class" },
  { day: 1, start: 165, len: 45, title: "Scratch · L2", who: "Yara B.", kind: "class" },
  { day: 3, start: 120, len: 30, title: "Trial", who: "Hana T.", kind: "trial" },
  { day: 2, start: 120, len: 60, title: "Python · L7", who: "Layla H.", kind: "class" },
  { day: 2, start: 15, len: 45, title: "Roblox · L1", who: "Omar S.", kind: "class" },
  { day: 3, start: 30, len: 60, title: "Python · L9", who: "Noor A.", kind: "flag" },
  { day: 3, start: 150, len: 45, title: "Scratch · L3", who: "Zayd R.", kind: "class" },
  { day: 4, start: 45, len: 60, title: "Python · L8", who: "Layla H.", kind: "class" },
];

const ZONES = [
  { id: "gst", label: "Academy · GST", offset: 0 },
  { id: "bst", label: "Parent in London", offset: -3 },
] as const;

const POINTS = [
  { title: "Local time for everyone", body: "Booked in academy time, shown in each user's own." },
  { title: "Zoom follows the session", body: "Created, moved and deleted with the booking." },
  { title: "One link, every class", body: "Each student's permanent link opens their next class." },
  { title: "Attendance from Zoom", body: "Join and leave times, with no one taking a register." },
  { title: "Requests, not chats", body: "Parents ask to reschedule; ops approves in one click." },
  { title: "Live control room", body: "Every class running right now, on one screen." },
];

function fmt(mins: number, offset: number) {
  const total = (START_HOUR + offset) * 60 + mins;
  const h = Math.floor((((total / 60) % 24) + 24) % 24);
  const m = ((total % 60) + 60) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function LiveClasses() {
  const [zone, setZone] = useState<(typeof ZONES)[number]["id"]>("gst");
  const offset = ZONES.find((z) => z.id === zone)!.offset;

  return (
    <Section
      id="classes"
      index="03"
      label="Live classes"
      title="Zoom does the video. We do the rest."
      intro={<p>Connect Zoom once. Links, attendance and recordings follow the timetable.</p>}
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <Frame
            path="instructor / schedule"
            aside={
              <div role="group" aria-label="Show times in" className="flex rounded-full border border-rule-strong bg-surface p-0.5">
                {ZONES.map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    aria-pressed={zone === z.id}
                    onClick={() => setZone(z.id)}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11.5px] transition-colors",
                      zone === z.id ? "bg-ink text-white" : "text-ink-2 hover:text-ink",
                    )}
                  >
                    {z.label}
                  </button>
                ))}
              </div>
            }
          >
            <div className="flex items-baseline justify-between gap-4 border-b border-rule px-4 py-3 sm:px-5">
              <p className="text-[14px] font-semibold text-ink">Omar K. · week of 13 Oct</p>
              <p className="font-mono text-[11.5px] text-ink-3">15-min grid</p>
            </div>
            <div className="overflow-x-auto">
              <div className="grid min-w-[560px] grid-cols-[52px_repeat(5,1fr)]">
                <div className="border-b border-r border-rule bg-surface-2" />
                {DAYS.map((d) => (
                  <div key={d} className="border-b border-r border-rule bg-surface-2 px-2 py-1.5 text-center font-mono text-[11px] text-ink-2 last:border-r-0">
                    {d}
                  </div>
                ))}

                <div className="relative border-r border-rule" style={{ height: HOURS * 4 * ROW }}>
                  {Array.from({ length: HOURS }).map((_, h) => (
                    <span
                      key={h}
                      className="num absolute right-2 font-mono text-[10.5px] text-ink-3"
                      style={{ top: h * 4 * ROW + 3 }}
                    >
                      {fmt(h * 60, offset)}
                    </span>
                  ))}
                </div>

                {DAYS.map((d, di) => (
                  <div
                    key={d}
                    className="relative border-r border-rule last:border-r-0"
                    style={{
                      height: HOURS * 4 * ROW,
                      backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 ${ROW * 4 - 1}px, hsl(var(--rule)) ${ROW * 4 - 1}px ${ROW * 4}px), repeating-linear-gradient(to bottom, transparent 0 ${ROW - 1}px, hsl(var(--rule) / 0.45) ${ROW - 1}px ${ROW}px)`,
                    }}
                  >
                    {SLOTS.filter((s) => s.day === di).map((s) => (
                      <div
                        key={s.title + s.start}
                        className={cn(
                          "absolute inset-x-1 overflow-hidden rounded-[3px] border px-1.5 py-1 leading-tight",
                          s.kind === "class" && "border-navy/25 bg-navy/[0.07]",
                          s.kind === "trial" && "border-dashed border-data/50 bg-data/[0.06]",
                          s.kind === "flag" && "border-alert/30 bg-alert/[0.07]",
                        )}
                        style={{ top: (s.start / 15) * ROW + 1, height: (s.len / 15) * ROW - 2 }}
                      >
                        <p className="num truncate font-mono text-[10px] text-ink-3">
                          {fmt(s.start, offset)}
                        </p>
                        <p className="truncate text-[11.5px] font-medium text-ink">{s.title}</p>
                        {s.len >= 45 && (
                          <p className={cn("truncate text-[10.5px]", s.kind === "flag" ? "text-alert" : "text-ink-3")}>
                            {s.kind === "flag" ? "No-show flagged" : s.who}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-rule bg-surface-2 px-4 py-2.5 text-[11.5px] text-ink-3 sm:px-5">
              <Legend className="border-navy/25 bg-navy/[0.07]" label="Class" />
              <Legend className="border-dashed border-data/50 bg-data/[0.06]" label="Trial" />
              <Legend className="border-alert/30 bg-alert/[0.07]" label="Flagged" />
            </div>
          </Frame>
          <p className="mt-3 text-caption text-ink-3">Switch time zones to see the week as a parent abroad would.</p>
        </div>

        <div className="lg:col-span-5">
          <dl className="grid gap-x-8 divide-y divide-rule border-y border-rule sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-1 lg:divide-y">
            {POINTS.map((p) => (
              <div key={p.title} className="py-4 sm:border-b sm:border-rule lg:border-0">
                <dt className="text-[15.5px] font-semibold text-ink">{p.title}</dt>
                <dd className="mt-1 text-[14.5px] leading-relaxed text-ink-2">{p.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-2.5 w-4 rounded-[2px] border", className)} aria-hidden />
      {label}
    </span>
  );
}
