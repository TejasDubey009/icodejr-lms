import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ['"Golos Text"', "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        // Timestamps and figures: same family, tabular digits (see .font-mono in index.css)
        mono: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
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
        // iCodeJr brand colours (from icodejr.com), identical on the dark page and light product screens
        brand: "#4294D7",
        sun: "#FACC15",
        ember: "#F78511",
        grape: "#9239C7",
        mint: "#34C98A",
        night: "#0A1529",
        // Radix accordion / focus compatibility
        border: "hsl(var(--rule))",
        background: "hsl(var(--canvas))",
        foreground: "hsl(var(--ink))",
        ring: "hsl(var(--data))",
      },
      borderRadius: {
        panel: "12px",
        frame: "16px",
        stage: "28px",
      },
      fontSize: {
        caption: ["12px", { lineHeight: "1.4" }],
        meta: ["13px", { lineHeight: "1.4" }],
        display: ["clamp(2.5rem, 1.5rem + 4vw, 4.25rem)", { lineHeight: "1.08", letterSpacing: "-0.02em" }],
        h2: ["clamp(1.875rem, 1.35rem + 2vw, 3rem)", { lineHeight: "1.15", letterSpacing: "-0.015em" }],
        h3: ["clamp(1.25rem, 1.1rem + 0.6vw, 1.625rem)", { lineHeight: "1.25", letterSpacing: "-0.01em" }],
      },
      maxWidth: {
        page: "1200px",
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
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "row-in": "row-in 0.35s cubic-bezier(0.2, 0.7, 0.2, 1) both",
        blink: "blink 1.6s ease-in-out infinite",
        floaty: "floaty 5s ease-in-out infinite",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
