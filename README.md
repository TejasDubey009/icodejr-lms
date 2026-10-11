# iCodeJr LMS — sales landing page

Single-page marketing site for iCodeJr LMS. No backend, no login.

Built with React 18, Vite, Tailwind, Framer Motion (tilt, sliding highlights, scroll-linked lines, count-ups), Radix UI, cmdk (the ⌘K menu) and CSS container queries (product screens adapt to their own frame). Animation code and the ⌘K menu load as separate chunks after first paint.

```bash
npm install
npm run dev      # http://localhost:8080
npm run build    # outputs to dist/
```

## Demo requests

The form in `src/components/landing/DemoRequest.tsx` never fakes a confirmation:

- If `VITE_LEAD_WEBHOOK_URL` is set, the request is POSTed there as JSON (an n8n webhook works well). The visitor only sees "Request received" on a 2xx response.
- Otherwise, or if the webhook fails, it opens WhatsApp to `VITE_SALES_WHATSAPP` with the details filled in.

Copy `.env.example` to `.env` to configure both.

## Search engines and link previews

`npm run build` prerenders the page: `scripts/prerender.mjs` writes the full HTML, canonical tag, structured data (Organization, SoftwareApplication, FAQPage), `robots.txt` and `sitemap.xml` into `dist/`. The site URL comes from `VITE_SITE_URL`, or from Vercel's production domain when that is unset. FAQ answers live in `src/content/faq.ts` and feed both the page and the structured data.

## Where things live

- `src/pages/LandingPage.tsx` — section order
- `src/components/landing/` — one file per section; product mockups in `mocks/`
- `src/index.css` + `tailwind.config.ts` — colour, type and layout tokens. The page is dark; anything inside a `.light` container (every product mockup) uses the light token set
- `public/mascot/` — the iCodeJr robot used in the LMS tours

Every product claim on the page maps to behaviour in the main LMS codebase. Sample names and figures inside mockups are illustrative; keep it that way when editing copy.
