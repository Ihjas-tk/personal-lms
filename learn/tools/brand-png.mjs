// Render the brand SVGs in `web/public/brand/` to the two raster fallbacks the
// browser still wants, straight back into the same folder:
//
//   node tools/brand-png.mjs        (Playwright is resolved from web/node_modules)
//
//   favicon-32.png       32×32, the mark on transparency, light violet (#6D3BEE).
//                        Only Safari and older browsers reach for it; everything
//                        current takes `favicon.svg`, which swaps colour itself.
//   apple-touch-icon.png 180×180, the app icon — violet tile, white mark, opaque,
//                        because iOS composites it on its own background.
//
// The SVGs are the source of truth; this file only rasterises them.
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";

const require = createRequire(new URL("../web/package.json", import.meta.url));
const { chromium } = require("playwright");

const here = path.dirname(fileURLToPath(import.meta.url));
const brand = path.join(here, "..", "web", "public", "brand");

/** Blow one brand SVG up to `px` and screenshot it at exactly that size. */
async function render(browser, svgName, outName, px, { opaque = false } = {}) {
  const svg = readFileSync(path.join(brand, svgName), "utf8")
    .replace('width="64" height="64"', `width="${px}" height="${px}"`);
  const page = await browser.newPage({ viewport: { width: px, height: px } });
  await page.setContent(
    `<body style="margin:0;width:${px}px;height:${px}px">${svg}</body>`,
    { baseURL: pathToFileURL(brand + "/").href },
  );
  const out = path.join(brand, outName);
  await page.screenshot({ path: out, omitBackground: !opaque });
  await page.close();
  console.log(`wrote ${out} — ${px}×${px}, ${statSync(out).size} B`);
}

const browser = await chromium.launch();
await render(browser, "mark.svg", "favicon-32.png", 32);
await render(browser, "appicon.svg", "apple-touch-icon.png", 180, { opaque: true });
await browser.close();
