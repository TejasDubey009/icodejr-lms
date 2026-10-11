import { Cloud, Mail, MessageCircle, Video, Workflow } from "lucide-react";
import logo from "@/assets/icodejr-logo-light.webp";
import { Section } from "./primitives";

const NODES = [
  { name: "Zoom", does: "Meetings, attendance, recordings", icon: Video, x: 10, twoWay: true },
  { name: "WhatsApp", does: "Reminders and class updates", icon: MessageCircle, x: 30 },
  { name: "Email", does: "Notifications and welcome emails", icon: Mail, x: 50 },
  { name: "Cloud storage", does: "Private recordings and lesson files", icon: Cloud, x: 70 },
  { name: "n8n", does: "Events to your own workflows", icon: Workflow, x: 90 },
];

// Curve from the hub (top centre) down to a node at horizontal position x, in a 0–100 box
const curve = (x: number) => `M 50 0 C 50 55, ${x} 45, ${x} 100`;

export default function Connections() {
  return (
    <Section
      id="connections"
      index="08"
      label="Connections"
      title="Plugs into what you already run."
      intro={<p>Your Zoom account, your WhatsApp number, your tools. The LMS sits in the middle.</p>}
    >
      <div className="mx-auto max-w-[980px]">
        <div className="relative mx-auto flex w-fit items-center gap-3 rounded-[20px] border border-brand/50 bg-surface px-6 py-4 shadow-[0_0_0_6px_rgb(66_148_215/0.1),0_0_70px_rgb(66_148_215/0.4)]">
          <img src={logo} alt="" width={320} height={159} loading="lazy" className="h-9 w-auto" />
          <span className="font-display text-[17px] font-medium text-ink">LMS</span>
        </div>

        {/* Connector lines with data moving along them; drawn only where the nodes sit in one row */}
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="hidden h-24 w-full lg:block"
          fill="none"
        >
          {NODES.map((n) => (
            <g key={n.name}>
              <path d={curve(n.x)} stroke="rgb(46 69 115)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <path
                d={curve(n.x)}
                pathLength={100}
                stroke="#6db3f2"
                strokeWidth="2"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                className="flow-line"
                style={{ animationDelay: `${(n.x / 100) * -2.6}s` }}
              />
              {n.twoWay && (
                <path
                  d={curve(n.x)}
                  pathLength={100}
                  stroke="#facc15"
                  strokeWidth="2"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  className="flow-line-back"
                />
              )}
            </g>
          ))}
        </svg>
        <div aria-hidden className="mx-auto h-8 w-px bg-rule-strong lg:hidden" />

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {NODES.map((n) => (
            <li
              key={n.name}
              className="card flex items-center gap-3.5 px-4 py-4 last:sm:col-span-2 lg:flex-col lg:items-center lg:gap-3 lg:px-3 lg:py-5 lg:text-center last:lg:col-span-1"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/15 text-data">
                <n.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <span>
                <span className="block font-display text-[16px] font-medium text-ink">{n.name}</span>
                <span className="mt-0.5 block text-[13.5px] leading-snug text-ink-3">{n.does}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
