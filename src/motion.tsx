import type { ReactNode } from "react";
import { LazyMotion, MotionConfig } from "framer-motion";

// Loaded after first paint, so the page is readable before any animation code arrives
const loadFeatures = () => import("./motionFeatures").then((mod) => mod.default);

/** Provides Framer Motion's features lazily and honours the user's reduced-motion setting. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
