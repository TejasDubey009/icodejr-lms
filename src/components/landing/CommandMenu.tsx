import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, CalendarCheck, CornerDownLeft, MessageCircle, Search, Zap } from "lucide-react";
import { whatsappUrl } from "@/lib/leads";

const SECTIONS = [
  { href: "#automations", label: "Automations", hint: "Try to break a class" },
  { href: "#portals", label: "Portals", hint: "Nine roles, nine views" },
  { href: "#classes", label: "Live classes", hint: "Zoom, attendance, recordings" },
  { href: "#payments", label: "Credits & payments", hint: "The session ledger" },
  { href: "#growth", label: "Sales & retention", hint: "Lead to renewal" },
  { href: "#learning", label: "Curriculum", hint: "Protected lesson content" },
  { href: "#controls", label: "Controls", hint: "Approvals and access" },
  { href: "#connections", label: "Connections", hint: "Zoom, WhatsApp, n8n" },
  { href: "#pricing", label: "Pricing", hint: "Per conducted session" },
  { href: "#faq", label: "FAQ", hint: "Before you switch" },
];

const item =
  "flex cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14.5px] text-ink-2 data-[selected=true]:bg-brand/20 data-[selected=true]:text-ink";

/** ⌘K quick navigation. Loaded on first use. */
export default function CommandMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const go = (href: string) => {
    onOpenChange(false);
    // Let the dialog release focus and scroll lock before moving the page
    window.setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ block: "start" });
      window.history.replaceState(null, "", href);
    }, 60);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Quick navigation"
      overlayClassName="fixed inset-0 z-[80] bg-[rgb(5_11_24/0.7)] backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in"
      contentClassName="fixed left-1/2 top-[14vh] z-[81] w-[min(92vw,560px)] -translate-x-1/2 overflow-hidden rounded-[20px] border border-rule-strong bg-surface shadow-[0_40px_120px_-20px_rgb(0_0_0/0.8)] data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95"
    >
      <Dialog.Title className="sr-only">Quick navigation</Dialog.Title>
      <Dialog.Description className="sr-only">Jump to a section of the page or start an action.</Dialog.Description>
      <div className="flex items-center gap-3 border-b border-rule px-4">
        <Search className="h-4 w-4 shrink-0 text-ink-3" aria-hidden />
        <Command.Input
          placeholder="Jump to a section or action"
          className="h-14 w-full bg-transparent text-[15px] text-ink placeholder:text-ink-3 focus:outline-none"
        />
        <kbd className="rounded-md border border-rule-strong px-1.5 py-0.5 text-[11px] text-ink-3">Esc</kbd>
      </div>
      <Command.List className="max-h-[min(56vh,420px)] overflow-y-auto p-2">
        <Command.Empty className="px-3 py-8 text-center text-[14px] text-ink-3">Nothing matches that.</Command.Empty>

        <Command.Group heading="Do" className="[&_[cmdk-group-heading]]:meta [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2">
          <Command.Item value="book a demo" onSelect={() => go("#demo")} className={item}>
            <CalendarCheck className="h-4 w-4 text-sun" aria-hidden />
            Book a demo
            <CornerDownLeft className="ml-auto h-3.5 w-3.5 text-ink-3" aria-hidden />
          </Command.Item>
          <Command.Item value="try to break a class simulator" onSelect={() => go("#automations")} className={item}>
            <Zap className="h-4 w-4 text-sun" aria-hidden />
            Try to break a class
          </Command.Item>
          <Command.Item
            value="message us on whatsapp"
            onSelect={() => {
              onOpenChange(false);
              window.open(
                whatsappUrl("Hi iCodeJr team, I'd like to learn more about iCodeJr LMS for my academy."),
                "_blank",
                "noopener,noreferrer",
              );
            }}
            className={item}
          >
            <MessageCircle className="h-4 w-4 text-sun" aria-hidden />
            Message us on WhatsApp
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Go to" className="[&_[cmdk-group-heading]]:meta [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2">
          {SECTIONS.map((s) => (
            <Command.Item key={s.href} value={`${s.label} ${s.hint}`} onSelect={() => go(s.href)} className={item}>
              <ArrowRight className="h-4 w-4 text-data" aria-hidden />
              {s.label}
              <span className="ml-auto text-[12.5px] text-ink-3">{s.hint}</span>
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
