export interface DemoRequest {
  name: string;
  academy: string;
  email: string;
  phone: string;
  volume: string;
  currentSetup: string;
  notes: string;
}

const DEFAULT_WHATSAPP = "971506942633";

export const SALES_WHATSAPP = (import.meta.env.VITE_SALES_WHATSAPP as string | undefined)?.replace(/\D/g, "") || DEFAULT_WHATSAPP;

const WEBHOOK_URL = (import.meta.env.VITE_LEAD_WEBHOOK_URL as string | undefined)?.trim() || "";

export const hasLeadWebhook = WEBHOOK_URL.length > 0;

export function formatPhoneDisplay(digits: string) {
  // 971506942633 -> +971 50 694 2633
  if (digits.startsWith("971") && digits.length === 12) {
    return `+971 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return `+${digits}`;
}

export function whatsappUrl(text: string) {
  return `https://wa.me/${SALES_WHATSAPP}?text=${encodeURIComponent(text)}`;
}

export function demoRequestMessage(r: DemoRequest) {
  const lines = [
    "Hi iCodeJr team, I'd like a demo of iCodeJr LMS.",
    "",
    `Name: ${r.name}`,
    `Academy: ${r.academy}`,
    `Email: ${r.email}`,
  ];
  if (r.phone) lines.push(`Phone: ${r.phone}`);
  if (r.volume) lines.push(`Live sessions per month: ${r.volume}`);
  if (r.currentSetup) lines.push(`Running on today: ${r.currentSetup}`);
  if (r.notes) lines.push("", r.notes);
  return lines.join("\n");
}

/**
 * Posts the request to the configured webhook (e.g. an n8n workflow).
 * Resolves true only when the endpoint answers 2xx; callers fall back to WhatsApp otherwise.
 */
export async function sendDemoRequest(r: DemoRequest): Promise<boolean> {
  if (!hasLeadWebhook) return false;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...r,
        source: "lms-landing",
        page: window.location.href,
        submitted_at: new Date().toISOString(),
      }),
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}
