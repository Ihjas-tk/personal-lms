// Render tools/icon.html to a 1024×1024 PNG with a transparent background.
// Usage: node tools/icon.mjs <out.png>   (Playwright is resolved from web/node_modules)
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const require = createRequire(new URL("../web/package.json", import.meta.url));
const { chromium } = require("playwright");

const out = process.argv[2];
if (!out) {
  console.error("usage: node icon.mjs <out.png>");
  process.exit(2);
}
const html = path.join(path.dirname(fileURLToPath(import.meta.url)), "icon.html");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
await page.goto(pathToFileURL(html).href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out, omitBackground: true });
await browser.close();
console.log(`wrote ${out}`);
