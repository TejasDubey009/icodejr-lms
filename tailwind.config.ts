import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Instrument Sans"', "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        canvas: "hsl(var(--canvas))",
        surface: "hsl(var(--surface))",
        "surface-2": "hsl(var(--surface-2))",
        ink: {
          DEFAULT: "hsl(var(--ink))",
          2: "hsl(var(--ink-2))",
          3: "hsl(var(--ink-3))",
        },
        rule: {
          DEFAULT: "hsl(var(--rule))",
          strong: "hsl(var(--rule-strong))",
        },
        data: "hsl(var(--data))",
        navy: "hsl(var(--navy))",
        ok: "hsl(var(--ok))",
        warn: "hsl(var(--warn))",
        alert: "hsl(var(--alert))",
        // shadcn compatibility (accordion, sonner)
        border: "hsl(var(--rule))",
        background: "hsl(var(--canvas))",
        foreground: "hsl(var(--ink))",
        ring: "hsl(var(--data))",
      },
      borderRadius: {
        panel: "2px",
        frame: "6px",
      },
      fontSize: {
        caption: ["12px", { lineHeight: "1.4", letterSpacing: "0.01em" }],
        meta: ["11px", { lineHeight: "1.4", letterSpacing: "0.08em" }],
        display: ["clamp(2.75rem, 1.6rem + 4.6vw, 5.25rem)", { lineHeight: "0.98", letterSpacing: "-0.035em" }],
        h2: ["clamp(2rem, 1.45rem + 2.2vw, 3.25rem)", { lineHeight: "1.04", letterSpacing: "-0.03em" }],
        h3: ["clamp(1.375rem, 1.2rem + 0.6vw, 1.75rem)", { lineHeight: "1.15", letterSpacing: "-0.015em" }],
      },
      maxWidth: {
        page: "1240px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "row-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.25" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "row-in": "row-in 0.35s cubic-bezier(0.2, 0.7, 0.2, 1) both",
        blink: "blink 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
