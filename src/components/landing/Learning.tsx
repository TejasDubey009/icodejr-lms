import { BadgeCheck, Lock, MonitorSmartphone } from "lucide-react";
import { Frame, Section } from "./primitives";


const BUILD = [
  { title: "Reviewed before it's taught", body: "Contributor drafts, head reviews, admin publishes." },
  { title: "A copy per student", body: "Adjust one student's path without touching the template." },
  { title: "Feedback from instructors", body: "Lesson issues go straight to the curriculum queue." },
];

const PROTECT = [
  { icon: Lock, text: "The PDF never reaches the browser. Pages arrive as images." },
  { icon: BadgeCheck, text: "Each page is watermarked with the viewer's name and a hidden fingerprint." },
  { icon: MonitorSmartphone, text: "One device at a time. Copy and right-click are blocked and logged." },
];

export default function Learning() {
  return (
    <Section
      id="learning"
      index="06"
      label="Curriculum & learning"
      tone="surface"
      title="Your curriculum, protected."
      intro={<p>Build it once. Teach it everywhere. Nobody downloads it.</p>}
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <Frame
            path="courses / python-foundations / lesson-6"
            aside={<span className="font-mono text-[11px] text-ink-3">Page 3 of 12</span>}
          >
            <div className="relative overflow-hidden bg-surface">
              <div className="px-6 py-7 sm:px-10 sm:py-9">
                <p className="meta">Module 2 · Control flow</p>
                <p className="mt-2 text-[26px] font-semibold tracking-tight text-ink">While loops</p>
                <p className="mt-2 max-w-[46ch] text-[14px] leading-relaxed text-ink-2">
                  A while loop repeats its block for as long as its condition stays true. Use it when you don't know in
                  advance how many times to repeat.
                </p>
                <pre className="mt-5 overflow-x-auto rounded-[4px] bg-ink px-4 py-3.5 font-mono text-[12.5px] leading-6 text-white/90">
                  <code>
                    <span className="text-[#9ccfff]">secret</span> = <span className="text-[#ffd479]">7</span>
                    {"\n"}
                    <span className="text-[#9ccfff]">guess</span> = <span className="text-[#ffd479]">0</span>
                    {"\n"}
                    <span className="text-[#ff9ec4]">while</span> guess != secret:
                    {"\n"}
                    {"    "}guess = <span className="text-[#9ccfff]">int</span>(<span className="text-[#9ccfff]">input</span>(
                    <span className="text-[#b7e4a6]">"Guess: "</span>))
                    {"\n"}
                    <span className="text-[#9ccfff]">print</span>(<span className="text-[#b7e4a6]">"Got it!"</span>)
                  </code>
                </pre>
              </div>
              {/* Per-viewer watermark, as burned into each rendered page */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-[-40%] flex rotate-[-24deg] flex-col justify-center gap-16 font-mono text-[12px] text-ink/[0.07]"
              >
                {Array.from({ length: 7 }).map((_, r) => (
                  <p key={r} className="whitespace-nowrap" style={{ marginLeft: `${(r % 2) * 120}px` }}>
                    {Array.from({ length: 6 })
                      .map(() => "Layla H. · 16 Oct 18:04 · 7f3a")
                      .join("        ")}
                  </p>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-rule bg-surface-2 px-4 py-2.5 text-[11.5px] text-ink-3 sm:px-5">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-ok" aria-hidden />
                Open on this device
              </span>
              <span>Protected view · opens are logged</span>
            </div>
          </Frame>
        </div>

        <div className="lg:col-span-5">
          <ul className="space-y-5 border-t border-ink pt-6">
            {PROTECT.map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-4">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-data" strokeWidth={1.75} aria-hidden />
                <p className="text-[15.5px] leading-relaxed text-ink">{text}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-8 divide-y divide-rule border-y border-rule">
            {BUILD.map((b) => (
              <div key={b.title} className="py-4">
                <dt className="text-[15.5px] font-semibold text-ink">{b.title}</dt>
                <dd className="mt-1 text-[14.5px] leading-relaxed text-ink-2">{b.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mt-14 grid gap-10 border-t border-rule pt-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <h3 className="text-h3 font-semibold text-ink">Quizzes, homework, projects.</h3>
          <p className="mt-3 max-w-[50ch] text-[15.5px] leading-relaxed text-ink-2">
            Quizzes auto-mark. Instructors grade the rest, and student and parent are notified.
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-rule bg-rule sm:grid-cols-4">
            {[
              ["Quizzes", "Auto-marked"],
              ["Homework", "Graded, parent told"],
              ["Assignments", "Files or links"],
              ["Projects", "File uploads"],
            ].map(([k, v]) => (
              <li key={k} className="bg-surface px-4 py-3.5">
                <p className="text-[14.5px] font-semibold text-ink">{k}</p>
                <p className="mt-0.5 text-[12.5px] text-ink-3">{v}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-5">
          <div className="rounded-frame border border-rule-strong bg-surface p-5">
            <p className="font-mono text-[11.5px] text-ink-3">icodejr / verify / ICJR-2026-01847</p>
            <div className="mt-4 flex items-start gap-3">
              <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-ok" aria-hidden />
              <div>
                <p className="text-[15px] font-semibold text-ink">Certificate verified</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">
                  Python Foundations · awarded to Layla H. · issued 2 Nov 2026
                </p>
              </div>
            </div>
            <p className="mt-4 border-t border-rule pt-3 text-[13px] leading-relaxed text-ink-3">
              QR on every certificate. Anyone can check it. Admins can revoke it.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
