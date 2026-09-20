// Render tools/social-preview.html to the 1280×640 PNG GitHub wants for a repo's
// social preview (Settings → General → Social preview; PNG, under 1 MB).
// Usage: node tools/social-preview.mjs <out.png>   (Playwright is in web/node_modules)
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { statSync } from "node:fs";

const require = createRequire(new URL("../web/package.json", import.meta.url));
const { chromium } = require("playwright");

const out = process.argv[2];
if (!out) {
  console.error("usage: node social-preview.mjs <out.png>");
  process.exit(2);
}
const html = path.join(path.dirname(fileURLToPath(import.meta.url)), "social-preview.html");
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 640 },
  deviceScaleFactor: 1,
  colorScheme: "light", // the card is a fixed light design; it never follows the OS
});
await page.goto(pathToFileURL(html).href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out });
await browser.close();

const bytes = statSync(out).size;
console.log(`wrote ${out} — 1280×640, ${(bytes / 1024).toFixed(0)} KB`);
if (bytes > 1_000_000) {
  console.error("social preview is over GitHub's 1 MB limit");
  process.exit(1);
}
