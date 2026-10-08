import { Frame, Section, Status } from "./primitives";
import { cn } from "@/lib/utils";

const BALANCE = { total: 25, used: 11, blocked: 2 }; // 24 purchased + 1 complimentary
const available = BALANCE.total - BALANCE.used - BALANCE.blocked;

type Row = { date: string; type: string; amount: string; ref: string; by: string; tone: "ok" | "data" | "warn" | "neutral" };

const LEDGER: Row[] = [
  { date: "12 Sep", type: "Purchase", amount: "+24", ref: "Package · 24 sessions", by: "Finance", tone: "ok" },
  { date: "18 Sep", type: "Used", amount: "−1", ref: "Session 4610 · report filed", by: "Instructor", tone: "neutral" },
  { date: "02 Oct", type: "No-show release", amount: "+1", ref: "Session 4790 · instructor absent", by: "System", tone: "warn" },
  { date: "05 Oct", type: "Complimentary", amount: "+1", ref: "Request #212 · approved", by: "Admin", tone: "data" },
  { date: "09 Oct", type: "Reversal", amount: "+1", ref: "Session 4702 · approved", by: "Admin", tone: "data" },
  { date: "16 Oct", type: "Used", amount: "−1", ref: "Session 4821 · report filed", by: "Instructor", tone: "neutral" },
];

const PAYMENT_STEPS = [
  { label: "Deal won", note: "Manager approves" },
  { label: "Plan set", note: "Full or installments" },
  { label: "Payment in", note: "Gateway or bank" },
  { label: "Finance confirms", note: "Logged" },
  { label: "Credits released", note: "Ready to schedule" },
];

const POINTS = [
  { title: "Blocked on booking, used on report", body: "Cancelled or no-show? The credit goes back." },
  { title: "No credits before the money", body: "Released only when finance confirms payment." },
  { title: "Corrections need two people", body: "Ops requests, admin approves, reason on record." },
  { title: "Emergency credits", body: "Keep a student in class while a payment clears." },
];

export default function Payments() {
  return (
    <Section
      id="payments"
      index="04"
      label="Credits & payments"
      title="A credit ledger finance can trust."
      intro={<p>Every session moves a credit. Every move is logged with who and why.</p>}
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="space-y-4 lg:col-span-7">
          <Frame path="students / layla-h / credits" bodyClassName="p-0">
            <div className="grid grid-cols-2 border-b border-rule sm:grid-cols-4">
              {[
                { k: "Total", v: BALANCE.total },
                { k: "Used", v: BALANCE.used },
                { k: "Blocked", v: BALANCE.blocked },
                { k: "Available", v: available, strong: true },
              ].map((c, i) => (
                <div
                  key={c.k}
                  className={cn(
                    "border-rule px-4 py-4 sm:px-5",
                    i % 2 === 0 && "border-r",
                    i < 2 && "border-b sm:border-b-0",
                    i === 1 && "sm:border-r",
                  )}
                >
                  <p className="meta">{c.k}</p>
                  <p className={cn("num mt-1.5 text-[28px] font-semibold leading-none tracking-tight", c.strong ? "text-data" : "text-ink")}>
                    {c.v}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-b border-rule px-4 py-3 sm:px-5">
              <div className="flex h-2 overflow-hidden rounded-full bg-rule/60" aria-hidden>
                <span className="bg-ink-2" style={{ width: `${(BALANCE.used / BALANCE.total) * 100}%` }} />
                <span className="bg-warn" style={{ width: `${(BALANCE.blocked / BALANCE.total) * 100}%` }} />
                <span className="bg-data" style={{ width: `${(available / BALANCE.total) * 100}%` }} />
              </div>
              <p className="mt-2 font-mono text-[11.5px] text-ink-3">
                available = total − used − blocked ={" "}
                <span className="num text-ink">
                  {BALANCE.total} − {BALANCE.used} − {BALANCE.blocked} = {available}
                </span>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left">
                <caption className="sr-only">Credit ledger for a sample student</caption>
                <thead>
                  <tr className="border-b border-rule bg-surface-2">
                    {["Date", "Type", "Credits", "Reference", "By"].map((h) => (
                      <th key={h} scope="col" className="meta px-4 py-2 font-normal first:pl-5">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {LEDGER.map((r, i) => (
                    <tr key={i} className="border-b border-rule last:border-0">
                      <td className="num whitespace-nowrap px-4 py-2.5 pl-5 font-mono text-[12px] text-ink-3">{r.date}</td>
                      <td className="px-4 py-2.5">
                        <Status tone={r.tone}>{r.type}</Status>
                      </td>
                      <td className={cn("num px-4 py-2.5 font-mono text-[13px]", r.amount.startsWith("+") ? "text-ok" : "text-ink")}>
                        {r.amount}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-ink-2">{r.ref}</td>
                      <td className="px-4 py-2.5 text-ink-3">{r.by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Frame>
        </div>

        <div className="lg:col-span-5">
          <dl className="divide-y divide-rule border-y border-rule">
            {POINTS.map((p) => (
              <div key={p.title} className="py-5">
                <dt className="text-[16px] font-semibold text-ink">{p.title}</dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed text-ink-2">{p.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mt-12">
        <p className="meta">Deal to first class</p>
        <ol className="mt-4 grid border-l border-t border-rule sm:grid-cols-5">
          {PAYMENT_STEPS.map((s, i) => (
            <li key={s.label} className="relative border-b border-r border-rule bg-surface px-4 py-4">
              <span className="num font-mono text-[11px] text-data">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-2 text-[14.5px] font-semibold leading-snug text-ink">{s.label}</p>
              <p className="mt-1 text-[13px] text-ink-3">{s.note}</p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
