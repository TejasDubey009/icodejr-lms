import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

/**
 * Counts up to a figure like "100,000+" the first time it scrolls into view.
 * Renders the final value on the server and before scripts run, so the number is always in the page.
 */
export default function CountUp({ value, className }: { value: string; className?: string }) {
  const match = value.match(/^([\d,]+)(.*)$/);
  const target = match ? Number(match[1].replace(/,/g, "")) : NaN;
  const suffix = match ? match[2] : "";
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    if (!inView || Number.isNaN(target)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const controls = animate(0, target, {
      duration: Math.min(1.6, 0.7 + Math.log10(target + 1) * 0.2),
      ease: [0.2, 0.7, 0.2, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, target]);

  return (
    <span ref={ref} className={className}>
      {shown === null || Number.isNaN(target) ? value : shown.toLocaleString("en-US") + suffix}
    </span>
  );
}
