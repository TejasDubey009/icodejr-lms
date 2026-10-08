import { useId, useState, type FormEvent } from "react";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import {
  type DemoRequest as DemoRequestData,
  SALES_WHATSAPP,
  demoRequestMessage,
  formatPhoneDisplay,
  hasLeadWebhook,
  sendDemoRequest,
  whatsappUrl,
} from "@/lib/leads";

const VOLUMES = ["Under 200", "200 – 1,000", "1,000 – 5,000", "5,000+", "Not running yet"];
const SETUPS = [
  "Zoom + spreadsheets + WhatsApp",
  "Another LMS",
  "A CRM plus separate tools",
  "Something we built ourselves",
  "Starting a new academy",
];

const AGENDA = [
  "One class, from booking to recording",
  "The portal each person on your team would use",
  "How payments turn into session credits",
  "What moving your academy over involves",
];

const EMPTY: DemoRequestData = {
  name: "",
  academy: "",
  email: "",
  phone: "",
  volume: "",
  currentSetup: "",
  notes: "",
};

type Result = { kind: "sent" } | { kind: "whatsapp"; url: string; opened: boolean };

export default function DemoRequest() {
  const uid = useId();
  const [form, setForm] = useState<DemoRequestData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof DemoRequestData, string>>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const set = (k: keyof DemoRequestData) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Enter your name.";
    if (!form.academy.trim()) next.academy = "Enter your academy's name.";
    if (!form.email.trim()) next.email = "Enter an email we can reply to.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = "Check the email address.";
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) document.getElementById(`${uid}-${first}`)?.focus();
    return !first;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || !validate()) return;
    const data = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()])) as DemoRequestData;
    const url = whatsappUrl(demoRequestMessage(data));

    if (!hasLeadWebhook) {
      // Open synchronously inside the submit gesture so the browser doesn't block it.
      // ("noopener" would make window.open return null, hiding whether it opened.)
      const win = window.open(url, "_blank");
      if (win) win.opener = null;
      setResult({ kind: "whatsapp", url, opened: win !== null });
      return;
    }

    setBusy(true);
    const ok = await sendDemoRequest(data);
    setBusy(false);
    setResult(ok ? { kind: "sent" } : { kind: "whatsapp", url, opened: false });
  };

  return (
    <section id="demo" className="border-t border-rule bg-surface">
      <div className="mx-auto grid max-w-page gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-12 lg:gap-8 lg:px-8">
        <div className="lg:col-span-5">
          <p className="meta">
            <span className="text-ink">10</span>
            <span className="mx-2 text-rule-strong">/</span>
            Demo
          </p>
          <h2 className="mt-6 max-w-[16ch] text-h2 font-semibold">See your week in it.</h2>
          <p className="mt-5 max-w-[40ch] text-[17px] leading-relaxed text-ink-2">
            30 minutes with the team that builds it. You'll see:
          </p>
          <ul className="mt-8 space-y-4">
            {AGENDA.map((item) => (
              <li key={item} className="flex gap-3 text-[15px] leading-snug text-ink">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-data" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex items-end justify-between gap-4 border-t border-rule pt-6">
            <div>
              <p className="meta">Prefer to message?</p>
              <a
                href={whatsappUrl("Hi iCodeJr team, I'd like to learn more about iCodeJr LMS for my academy.")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-[15px] font-medium text-ink hover:text-data"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp <span className="num">{formatPhoneDisplay(SALES_WHATSAPP)}</span>
              </a>
            </div>
            <img
              src="/mascot/mascot-wave.webp"
              alt=""
              width={226}
              height={320}
              loading="lazy"
              className="-mb-1 h-24 w-auto motion-reduce:hidden"
            />
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <div className="rounded-frame border border-rule-strong bg-surface-2 p-5 sm:p-8">
            {result ? (
              <ResultPanel result={result} name={form.name.trim()} email={form.email.trim()} onReset={() => setResult(null)} />
            ) : (
              <form noValidate onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
                <Field id={`${uid}-name`} label="Your name" error={errors.name} required>
                  <input id={`${uid}-name`} className="field" autoComplete="name" value={form.name} onChange={set("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? `${uid}-name-err` : undefined} />
                </Field>
                <Field id={`${uid}-academy`} label="Academy" error={errors.academy} required>
                  <input id={`${uid}-academy`} className="field" autoComplete="organization" value={form.academy} onChange={set("academy")} aria-invalid={!!errors.academy} aria-describedby={errors.academy ? `${uid}-academy-err` : undefined} />
                </Field>
                <Field id={`${uid}-email`} label="Work email" error={errors.email} required>
                  <input id={`${uid}-email`} type="email" inputMode="email" className="field" autoComplete="email" value={form.email} onChange={set("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? `${uid}-email-err` : undefined} />
                </Field>
                <Field id={`${uid}-phone`} label="WhatsApp or phone" hint="Optional">
                  <input id={`${uid}-phone`} type="tel" inputMode="tel" className="field" autoComplete="tel" placeholder="+971" value={form.phone} onChange={set("phone")} />
                </Field>
                <Field id={`${uid}-volume`} label="Live sessions per month" hint="Optional">
                  <select id={`${uid}-volume`} className="field appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-9" style={{ backgroundImage: CHEVRON }} value={form.volume} onChange={set("volume")}>
                    <option value="">Select</option>
                    {VOLUMES.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </Field>
                <Field id={`${uid}-currentSetup`} label="Running on today" hint="Optional">
                  <select id={`${uid}-currentSetup`} className="field appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-9" style={{ backgroundImage: CHEVRON }} value={form.currentSetup} onChange={set("currentSetup")}>
                    <option value="">Select</option>
                    {SETUPS.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Field id={`${uid}-notes`} label="Anything we should prepare?" hint="Optional">
                    <textarea id={`${uid}-notes`} rows={3} className="field h-auto resize-y py-2.5" value={form.notes} onChange={set("notes")} />
                  </Field>
                </div>
                <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-caption text-ink-3">
                    {hasLeadWebhook
                      ? "We reply by email or WhatsApp to agree a time."
                      : "Sending opens WhatsApp with these details filled in."}
                  </p>
                  <button type="submit" className="btn btn-primary" disabled={busy}>
                    {busy ? "Sending…" : "Request a demo"}
                    {!busy && <ArrowRight className="h-4 w-4" aria-hidden />}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%235c6b78' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-baseline justify-between text-[13px] font-medium text-ink">
        <span>
          {label}
          {required && <span className="sr-only"> (required)</span>}
        </span>
        {hint && <span className="text-caption font-normal text-ink-3">{hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} role="alert" className="text-caption text-alert">
          {error}
        </p>
      )}
    </div>
  );
}

function ResultPanel({ result, name, email, onReset }: { result: Result; name: string; email: string; onReset: () => void }) {
  const first = name.split(" ")[0];
  if (result.kind === "sent") {
    return (
      <div role="status" className="py-6">
        <p className="meta text-ok">Request received</p>
        <h3 className="mt-3 text-h3 font-semibold">Thanks{first ? `, ${first}` : ""}.</h3>
        <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-ink-2">
          We'll reply to <span className="font-medium text-ink">{email}</span> to agree a time for your walkthrough.
        </p>
        <button type="button" onClick={onReset} className="link mt-6 text-[14px]">
          Send another request
        </button>
      </div>
    );
  }
  return (
    <div role="status" className="py-6">
      <p className="meta text-data">One more step</p>
      <h3 className="mt-3 text-h3 font-semibold">
        {result.opened ? "Press send in WhatsApp." : "Send your request on WhatsApp."}
      </h3>
      <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-ink-2">
        {result.opened
          ? "WhatsApp opened in a new tab with your details filled in. Your request reaches our team once you send that message."
          : "Your details are ready in a WhatsApp message. Open it and press send to reach our team."}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <a href={result.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          <MessageCircle className="h-4 w-4" aria-hidden />
          {result.opened ? "Open WhatsApp again" : "Open WhatsApp"}
        </a>
        <button type="button" onClick={onReset} className="link text-[14px]">
          Edit details
        </button>
      </div>
    </div>
  );
}
