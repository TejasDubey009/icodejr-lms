import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  index: string;
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** "surface" adds brand-coloured light in the corners of the band */
  tone?: "canvas" | "surface";
}

/** Page section: numbered pill, soft-white headline, content below. */
export function Section({ id, index, label, title, intro, children, className, tone = "canvas" }: SectionProps) {
  return (
    <section id={id} className={cn("relative", className)}>
      <div aria-hidden className="divider-fade" />
      {tone === "surface" && <div aria-hidden className="glow-corners pointer-events-none absolute inset-0" />}
      <div className="relative mx-auto max-w-page px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        <div data-reveal className="mx-auto max-w-[760px] text-center">
          <p className="pill-grad">
            <span className="text-sunset font-medium">{index}</span>
            {label}
          </p>
          <h2 className="text-gradient mt-6 text-h2 font-medium">{title}</h2>
          {intro && <div className="mx-auto mt-4 max-w-[52ch] text-[18px] leading-relaxed text-ink-3">{intro}</div>}
        </div>
        {children && (
          <div data-reveal style={{ "--reveal-delay": "90ms" } as CSSProperties} className="mt-12 md:mt-16">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

// Literal names so Tailwind keeps the classes
const stageTone = {
  sunset: "stage-sunset",
  candy: "stage-candy",
  aurora: "stage-aurora",
  dusk: "stage-dusk",
} as const;

/** Vivid gradient tile that a light product screen sits on. */
export function Stage({
  tone = "sunset",
  children,
  className,
}: {
  tone?: keyof typeof stageTone;
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("stage", stageTone[tone], className)}>{children}</div>;
}

interface FrameProps {
  path: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  aside?: ReactNode;
}

/** Product window, rendered light like the LMS itself. The path stands in for the portal route. */
export function Frame({ path, children, className, bodyClassName, aside }: FrameProps) {
  return (
    <div
      className={cn(
        "light frame-cq overflow-hidden rounded-frame bg-surface shadow-[0_24px_60px_-24px_rgb(0_0_0/0.55)]",
        className,
      )}
    >
      <div className="flex h-11 items-center justify-between gap-3 border-b border-rule bg-surface-2 px-4">
        <span className="min-w-0 whitespace-nowrap text-[12.5px] text-ink-3">
          <span className="cq-wide font-medium text-ink-2">icodejr</span>
          <span className="cq-wide mx-1.5 text-rule-strong">/</span>
          {path}
        </span>
        {aside && <span className="shrink-0">{aside}</span>}
      </div>
      <div className={cn("text-[13px]", bodyClassName)}>{children}</div>
    </div>
  );
}

type Tone = "ok" | "warn" | "alert" | "data" | "neutral";

const toneClass: Record<Tone, string> = {
  ok: "border-ok/25 bg-ok/[0.07] text-ok",
  warn: "border-warn/25 bg-warn/[0.08] text-warn",
  alert: "border-alert/25 bg-alert/[0.07] text-alert",
  data: "border-data/25 bg-data/[0.07] text-data",
  neutral: "border-rule-strong bg-surface-2 text-ink-2",
};

export function Status({ tone = "neutral", children, dot }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  return (
    <span className={cn("chip whitespace-nowrap", toneClass[tone])}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

/** Tiny initials avatar for sample people inside product mocks. */
export function Initials({ name, className }: { name: string; className?: string }) {
  const letters = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-data/10 text-[10px] font-semibold text-data",
        className,
      )}
    >
      {letters}
    </span>
  );
}

export function Meter({ value, max, tone = "data" }: { value: number; max: number; tone?: "data" | "ok" | "warn" | "alert" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const bar = { data: "bg-data", ok: "bg-ok", warn: "bg-warn", alert: "bg-alert" }[tone];
  return (
    <span className="block h-1.5 w-full overflow-hidden rounded-full bg-rule/70" aria-hidden>
      <span className={cn("block h-full rounded-full", bar)} style={{ width: `${pct}%` }} />
    </span>
  );
}
