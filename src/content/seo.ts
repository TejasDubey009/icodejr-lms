import { FAQ } from "./faq";

export const SITE = {
  name: "iCodeJr LMS",
  title: "Online Academy Management Software | iCodeJr LMS",
  description:
    "Run a live online academy from one system: scheduling, Zoom classes, attendance, session credits, payments and parent updates, with a portal for every role.",
  org: "iCodeJr",
  orgUrl: "https://icodejr.com",
};

const FEATURES = [
  "Class scheduling on a 15-minute grid with time-zone handling",
  "Automatic Zoom meeting creation, attendance sync and private recordings",
  "Session credit ledger with approvals and reversals",
  "Instructor no-show detection and late-join alerts",
  "Sales pipeline, trial classes and won-deal handover",
  "Payment reconciliation and installment plans",
  "Parent, student, instructor, counsellor, sales, finance, curriculum, ops and admin portals",
  "Protected, watermarked curriculum viewer",
  "Email, WhatsApp and in-app notifications",
];

/** JSON-LD graph injected into the prerendered page. `siteUrl` may be empty for local builds. */
export function structuredData(siteUrl: string) {
  const url = siteUrl || undefined;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE.orgUrl}/#organization`,
        name: SITE.org,
        url: SITE.orgUrl,
        ...(url && { logo: `${url}/icon-512.png` }),
      },
      {
        "@type": "WebSite",
        name: SITE.name,
        ...(url && { url, "@id": `${url}/#website` }),
        publisher: { "@id": `${SITE.orgUrl}/#organization` },
        inLanguage: "en",
      },
      {
        "@type": "SoftwareApplication",
        name: SITE.name,
        description: SITE.description,
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Learning management system",
        operatingSystem: "Web",
        ...(url && { url, image: `${url}/og.jpg` }),
        featureList: FEATURES,
        audience: { "@type": "Audience", audienceType: "Online academies and tutoring businesses" },
        provider: { "@id": `${SITE.orgUrl}/#organization` },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}
