import { Frame, Section, Stage, Status } from "./primitives";
import { cn } from "@/lib/utils";

const BALANCE = { total: 25, used: 11, blocked: 2 }; // 24 purchased + 1 complimentary
const available = BALANCE.total - BALANCE.used - BALANCE.blocked;

type Row = { date: string; type: string; amount: string; ref: string; by: string; tone: "ok" | "data" | "warn" | "neutral" };

const LEDGER: Row[] = [
  { date: "12 Sep", type: "Purchase", amount: "+24", ref: "Package · 24 sessions", by: "Finance", tone: "ok" },
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
      title="Credits that always add up."
      intro={<p>Every session moves a credit. Every move is logged with who and why.</p>}
    >
      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="space-y-4 lg:col-span-7">
          <Stage tone="dusk">
            <Frame path="students / layla-h / credits" bodyClassName="p-0">
              <div className="cq-cols gap-px border-b border-rule bg-rule">
                {[
                  { k: "Total", v: BALANCE.total },
                  { k: "Used", v: BALANCE.used },
                  { k: "Blocked", v: BALANCE.blocked },
                  { k: "Available", v: available, strong: true },
                ].map((c) => (
                  <div key={c.k} className="bg-surface px-3 py-4">
                    <p className="meta">{c.k}</p>
                    <p
                      className={cn(
                        "num mt-1.5 text-[28px] font-semibold leading-none tracking-tight",
                        c.strong ? "text-data" : "text-ink",
                      )}
                    >
                      {c.v}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-b border-rule px-3 py-3">
                <div className="flex h-2 overflow-hidden rounded-full bg-rule/60" aria-hidden>
                  <span className="bg-ink-2" style={{ width: `${(BALANCE.used / BALANCE.total) * 100}%` }} />
                  <span className="bg-warn" style={{ width: `${(BALANCE.blocked / BALANCE.total) * 100}%` }} />
                  <span className="bg-data" style={{ width: `${(available / BALANCE.total) * 100}%` }} />
                </div>
                <p className="mt-2 text-[11.5px] leading-relaxed text-ink-3">
                  available = total − used − blocked{" "}
                  <span className="num whitespace-nowrap text-ink">
                    = {BALANCE.total} − {BALANCE.used} − {BALANCE.blocked} = {available}
                  </span>
                </p>
              </div>
              {/* The reference folds under the type in a tight frame, so nothing scrolls sideways */}
              <table className="w-full text-left">
                <caption className="sr-only">Credit ledger for a sample student</caption>
                <thead>
                  <tr className="border-b border-rule bg-surface-2">
                    <th scope="col" className="meta py-2 pl-3 pr-2 font-normal">Date</th>
                    <th scope="col" className="meta px-2 py-2 font-normal">Type</th>
                    <th scope="col" className="cq-wide meta px-3 py-2 font-normal">Reference</th>
                    <th scope="col" className="cq-xwide meta px-3 py-2 font-normal">By</th>
                    <th scope="col" className="meta py-2 pl-2 pr-3 text-right font-normal">Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {LEDGER.map((r, i) => (
                    <tr key={i} className="border-b border-rule align-top last:border-0">
                      <td className="num whitespace-nowrap py-2.5 pl-3 pr-2 text-[12px] leading-6 text-ink-3">{r.date}</td>
                      <td className="px-2 py-2.5">
                        <Status tone={r.tone}>{r.type}</Status>
                        <span className="cq-narrow mt-1 block text-[11.5px] leading-snug text-ink-3">{r.ref}</span>
                      </td>
                      <td className="cq-wide px-3 py-2.5 leading-6 text-ink-2">{r.ref}</td>
                      <td className="cq-xwide px-3 py-2.5 leading-6 text-ink-3">{r.by}</td>
                      <td
                        className={cn(
                          "num py-2.5 pl-2 pr-3 text-right text-[13px] font-medium leading-6",
                          r.amount.startsWith("+") ? "text-ok" : "text-ink",
                        )}
                      >
                        {r.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Frame>
          </Stage>
        </div>

        <div className="lg:col-span-5">
          <dl className="divide-y divide-rule border-y border-rule">
            {POINTS.map((p) => (
              <div key={p.title} className="py-5">
                <dt className="font-display text-[17px] font-medium text-ink">{p.title}</dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed text-ink-3">{p.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mt-12">
        <p className="meta">Deal to first class</p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-5">
          {PAYMENT_STEPS.map((s, i) => (
            <li key={s.label} className="card px-4 py-4">
              <span className="num text-sunset font-display text-[20px] font-medium">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-2 font-display text-[15.5px] font-medium leading-snug text-ink">{s.label}</p>
              <p className="mt-1 text-[13px] text-ink-3">{s.note}</p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
