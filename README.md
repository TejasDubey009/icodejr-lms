# iCodeJr LMS — sales landing page

Single-page marketing site for iCodeJr LMS. React + Vite + Tailwind, no backend, no login.

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

## Where things live

- `src/pages/LandingPage.tsx` — section order
- `src/components/landing/` — one file per section; product mockups in `mocks/`
- `src/index.css` + `tailwind.config.ts` — colour, type and layout tokens
- `public/mascot/` — the iCodeJr robot used in the LMS tours

Every product claim on the page maps to behaviour in the main LMS codebase. Sample names and figures inside mockups are illustrative; keep it that way when editing copy.
