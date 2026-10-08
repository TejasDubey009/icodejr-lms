import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  index: string;
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** "surface" sits on white instead of the ledger canvas */
  tone?: "canvas" | "surface";
}

/** Page section with a ruled top edge and a mono index, like a numbered ledger page. */
export function Section({ id, index, label, title, intro, children, className, tone = "canvas" }: SectionProps) {
  return (
    <section
      id={id}
      className={cn("border-t border-rule", tone === "surface" ? "bg-surface" : "bg-canvas", className)}
    >
      <div className="mx-auto max-w-page px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="grid gap-6 md:grid-cols-12 md:gap-8">
          <p className="meta md:col-span-3 md:pt-3">
            <span className="text-ink">{index}</span>
            <span className="mx-2 text-rule-strong">/</span>
            {label}
          </p>
          <div className="md:col-span-9">
            <h2 className="max-w-[22ch] text-h2 font-semibold text-ink">{title}</h2>
            {intro && <div className="mt-5 max-w-[62ch] text-[17px] leading-relaxed text-ink-2">{intro}</div>}
          </div>
        </div>
        {children && <div className="mt-12 md:mt-16">{children}</div>}
      </div>
    </section>
  );
}

interface FrameProps {
  path: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  aside?: ReactNode;
}

/** Product window. The path label stands in for the portal route the screen lives at. */
export function Frame({ path, children, className, bodyClassName, aside }: FrameProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-frame border border-rule-strong bg-surface shadow-[0_1px_0_hsl(var(--rule)),0_24px_48px_-32px_hsl(var(--ink)/0.25)]",
        className,
      )}
    >
      <div className="flex h-10 items-center justify-between gap-3 border-b border-rule bg-surface-2 px-4">
        <span className="truncate font-mono text-[12px] text-ink-3">
          <span className="text-ink-2">icodejr</span>
          <span className="mx-1 text-rule-strong">/</span>
          {path}
        </span>
        {aside}
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
        "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy/10 text-[10px] font-semibold text-navy",
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
