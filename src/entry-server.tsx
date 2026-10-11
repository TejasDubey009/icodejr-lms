import { renderToString } from "react-dom/server";
import App from "./App";
import { structuredData } from "./content/seo";

/** Used by scripts/prerender.mjs to write the page's HTML into dist/index.html at build time. */
export function render(siteUrl: string) {
  return {
    html: renderToString(<App />),
    jsonLd: structuredData(siteUrl),
  };
}
