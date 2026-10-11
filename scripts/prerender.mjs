// Writes the rendered page, canonical tags, structured data, sitemap and robots.txt into dist/.
// Runs after `vite build` and the SSR build of src/entry-server.tsx (see "build" in package.json).
import { readFile, rm, writeFile } from "node:fs/promises";

const dist = new URL("../dist/", import.meta.url);
const ssr = new URL("../dist-ssr/", import.meta.url);

// Set VITE_SITE_URL to override. On Vercel the production domain is picked up automatically.
const siteUrl = (
  process.env.VITE_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "")
).replace(/\/+$/, "");

const { render } = await import(new URL("entry-server.js", ssr).href);
const { html: app, jsonLd } = render(siteUrl);

let html = await readFile(new URL("index.html", dist), "utf8");
const ROOT = '<div id="root"></div>';
if (!html.includes(ROOT)) throw new Error("prerender: root placeholder not found in dist/index.html");

const head = [
  siteUrl && `<link rel="canonical" href="${siteUrl}/" />`,
  siteUrl && `<meta property="og:url" content="${siteUrl}/" />`,
  `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>`,
]
  .filter(Boolean)
  .join("\n    ");

html = html.replace(ROOT, `<div id="root">${app}</div>`).replace("</head>", `  ${head}\n  </head>`);
if (siteUrl) html = html.replaceAll('content="/og.jpg"', `content="${siteUrl}/og.jpg"`);
await writeFile(new URL("index.html", dist), html);

const robots = ["User-agent: *", "Allow: /", siteUrl && `\nSitemap: ${siteUrl}/sitemap.xml`].filter(Boolean).join("\n");
await writeFile(new URL("robots.txt", dist), robots + "\n");

if (siteUrl) {
  const today = new Date().toISOString().slice(0, 10);
  await writeFile(
    new URL("sitemap.xml", dist),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n    <lastmod>${today}</lastmod>\n  </url>\n</urlset>\n`,
  );
}

await rm(ssr, { recursive: true, force: true });
console.log(`prerender: wrote dist/index.html (${(html.length / 1024).toFixed(0)} kB)${siteUrl ? ` for ${siteUrl}` : " (no site URL set: canonical and sitemap skipped)"}`);
