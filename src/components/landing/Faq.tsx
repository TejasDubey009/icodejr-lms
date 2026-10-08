import * as Accordion from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { Section } from "./primitives";

const QUESTIONS: { q: string; a: string }[] = [
  {
    q: "Do we need our own Zoom account?",
    a: "Yes. Connect it once and the platform creates, moves and deletes meetings for you.",
  },
  {
    q: "What if an instructor doesn't show up?",
    a: "They're nudged at 3 minutes. At 20, the session is marked no-show, the credit goes back and ops is alerted. Admins can override with a reason.",
  },
  {
    q: "How do parents get recordings?",
    a: "In their portal, automatically. Links are signed for two hours and recordings are kept for six months.",
  },
  {
    q: "Families in other time zones?",
    a: "Everyone sees sessions in their own local time.",
  },
  {
    q: "Who can see what?",
    a: "Access is set by role and enforced in the database. Parents see only their children; instructors only their classes.",
  },
  {
    q: "Can we connect our own tools?",
    a: "Yes. Events are forwarded to your n8n webhook for Sheets, a CRM or WhatsApp flows.",
  },
  {
    q: "How is it priced?",
    a: "Per conducted session. No seat licences, no fee for inactive users.",
  },
  {
    q: "How do we switch over?",
    a: "We plan the move of your students, instructors and timetable with you on the demo call.",
  },
];

export default function Faq() {
  return (
    <Section id="faq" index="09" label="FAQ" title="Before you switch.">
      <div className="grid gap-6 md:grid-cols-12 md:gap-8">
        <Accordion.Root type="single" collapsible className="border-t border-ink md:col-span-9 md:col-start-4">
          {QUESTIONS.map((item, i) => (
            <Accordion.Item key={item.q} value={`q${i}`} className="border-b border-rule">
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full items-center justify-between gap-6 py-5 text-left text-[17px] font-medium text-ink transition-colors hover:text-navy">
                  {item.q}
                  <Plus
                    className="h-4 w-4 shrink-0 text-ink-3 transition-transform duration-200 group-data-[state=open]:rotate-45"
                    aria-hidden
                  />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <p className="max-w-[68ch] pb-6 text-[15.5px] leading-relaxed text-ink-2">{item.a}</p>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </Section>
  );
}
