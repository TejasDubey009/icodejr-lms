import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { m, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, BadgeCheck, MessageCircle, PlayCircle, Sparkles } from "lucide-react";
import ClassRecord from "./ClassRecord";
import CountUp from "./CountUp";
import { Stage } from "./primitives";

// Values taken from the platform's own configuration, not marketing estimates.
const FACTS = [
  { value: "9", unit: "", label: "Role portals" },
  { value: "15", unit: "min", label: "Scheduling grid" },
  { value: "5", unit: "min", label: "Attendance sync" },
  { value: "3", unit: "min", label: "Late-instructor alert" },
  { value: "20", unit: "min", label: "Auto no-show check" },
  { value: "6", unit: "mo", label: "Private recordings" },
];

const REPLACES = ["Zoom links pasted in chats", "Attendance sheets", "Reminder messages by hand", "Payment trackers"];

const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

export default function Hero() {
  return (
    <section id="top" className="relative">
      <div aria-hidden className="dot-grid pointer-events-none absolute inset-x-0 -top-24 h-[760px]" />
      <div className="relative mx-auto max-w-page px-4 pb-16 pt-10 sm:px-6 md:pt-14 lg:px-8 lg:pb-20 lg:pt-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Copy column stretches to the card's height; the "no more" strip sits at its foot */}
          <div className="relative z-10 flex flex-col lg:col-span-5">
            <p className="rise pill-grad self-start">
              <Sparkles className="h-4 w-4 text-ember" aria-hidden />
              Built by iCodeJr for its own live classes
            </p>
            <h1
              style={delay(70)}
              className="rise text-gradient mt-7 text-display font-medium lg:text-[clamp(2.75rem,0.9rem+3vw,3.75rem)]"
            >
              Every live class, <span className="hl">handled.</span>
            </h1>
            <p style={delay(140)} className="rise mt-6 max-w-[40ch] text-[18px] leading-relaxed text-ink-2">
              Academy management software for live online classes: scheduling, Zoom, attendance, credits, payments
              and parent updates. One system, nine portals, zero chasing.
            </p>
            <div style={delay(210)} className="rise mt-8 flex flex-wrap items-center gap-3">
              <Magnetic>
                <a href="#demo" className="btn btn-primary">
                  Book a demo
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              </Magnetic>
              <a href="#automations" className="btn btn-secondary">
                See it in action
              </a>
            </div>
            {/* The LMS tour robot, pointing at the live record */}
            <div className="hidden min-h-[150px] flex-1 items-center justify-end lg:flex">
              <img
                src="/mascot/mascot-point-still.webp"
                alt=""
                width={310}
                height={320}
                className="h-40 w-auto motion-safe:animate-floaty"
              />
            </div>
            <div style={delay(280)} className="rise mt-10 lg:mt-0">
              <div aria-hidden className="divider-fade" />
              <p className="meta mt-5">No more</p>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
                {REPLACES.map((r) => (
                  <li key={r} className="text-[15px] text-ink-2 line-through decoration-ember/80 decoration-[1.5px]">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={delay(160)} className="rise lg:col-span-7">
            <LiveStage />
            <p className="mt-4 text-center text-caption text-ink-3 lg:mt-11">
              Sample session. Every line is written automatically.
            </p>
          </div>
        </div>

        <dl className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:mt-16 lg:grid-cols-6">
          {FACTS.map((f, i) => (
            <div key={f.label} data-reveal style={delay(i * 70)} className="card px-5 py-5">
              <dt className="sr-only">{f.label}</dt>
              <dd>
                <span className="num text-sunset whitespace-nowrap font-display text-[34px] font-medium leading-none tracking-tight">
                  <CountUp value={f.value} />
                  {f.unit && <span className="ml-1 text-[20px]">{f.unit}</span>}
                </span>
                <span className="mt-2.5 block text-[14px] leading-snug text-ink-3">{f.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/**
 * The session record on its gradient stage: lit from above, tilting toward the pointer,
 * with frosted chips that surface as the matching lines are written.
 */
function LiveStage() {
  const [lines, setLines] = useState(0);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 140, damping: 18, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [3.5, -3.5]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-4.5, 4.5]), spring);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div className="relative [perspective:1400px]" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div
        aria-hidden
        className="light-beam pointer-events-none absolute -top-44 left-1/2 hidden h-[820px] w-[460px] -translate-x-1/2 rotate-[10deg] lg:block"
      />
      <m.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative">
        <Stage tone="sunset" className="edge-light">
          <ClassRecord onProgress={setLines} />
        </Stage>

        <Chip show={lines >= 3} className="-top-6 right-8" icon={<MessageCircle className="h-4 w-4" />} tone="bg-mint/25 text-mint">
          <b>Reminder delivered</b>
          <span>WhatsApp · 16:00</span>
        </Chip>
        <Chip show={lines >= 8} className="-bottom-6 left-8" icon={<BadgeCheck className="h-4 w-4" />} tone="bg-sun/25 text-sun">
          <b>Credit used</b>
          <span>12 sessions left</span>
        </Chip>
        <Chip show={lines >= 9} className="-bottom-6 right-8" icon={<PlayCircle className="h-4 w-4" />} tone="bg-white/20 text-white">
          <b>Recording ready</b>
          <span>Parent notified</span>
        </Chip>
      </m.div>
    </div>
  );
}

function Chip({
  show,
  className,
  icon,
  tone,
  children,
}: {
  show: boolean;
  className: string;
  icon: ReactNode;
  tone: string;
  children: ReactNode;
}) {
  return (
    <m.div
      aria-hidden
      initial={false}
      animate={show ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 10 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      style={{ z: 60 }}
      className={`glass pointer-events-none absolute z-10 hidden items-center gap-2.5 py-2 pl-2 pr-3.5 lg:flex ${className}`}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone}`}>{icon}</span>
      <span className="flex flex-col text-[12px] leading-tight text-white/75 [&>b]:text-[13px] [&>b]:font-medium [&>b]:text-white">
        {children}
      </span>
    </m.div>
  );
}

/** Pulls its child a few pixels toward the pointer. */
function Magnetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useSpring(0, { stiffness: 220, damping: 16 });
  const y = useSpring(0, { stiffness: 220, damping: 16 });

  const onMove = (e: PointerEvent<HTMLSpanElement>) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.18);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.28);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <m.span ref={ref} style={{ x, y }} onPointerMove={onMove} onPointerLeave={onLeave} className="inline-flex">
      {children}
    </m.span>
  );
}
