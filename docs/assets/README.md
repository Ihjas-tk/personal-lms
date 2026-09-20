# README assets

| File | How it is made |
| --- | --- |
| `demo.gif` | `cd learn/web && npx playwright test -c playwright.demo.config.ts` (`e2e/demo-capture.spec.ts`), then `bash learn/tools/demo-gif.sh` turns the newest WebM into the GIF |
| `desk.png`, `module.png`, `attempt-compare.png`, `debrief.png`, `focus.png` | `cd learn/web && npx playwright test -c playwright.readme.config.ts` (`e2e/readme-capture.spec.ts`) writes all five straight into this folder |
| `social-preview.png` | `node learn/tools/social-preview.mjs docs/assets/social-preview.png` (1280x640; upload under Settings, then Social preview) |
| `mark.svg` | `cp learn/web/public/brand/mark.svg docs/assets/mark.svg` — the light production mark, unchanged. It heads the root README; GitHub renders SVG there, and the violet reads on both GitHub themes, so there is no dark twin to keep in step |

The brand files themselves live in `learn/web/public/brand/` and ship with the app:
`mark.svg` (light), `mark-dark.svg`, `mark-onecolour.svg`, `appicon.svg`, `favicon.svg`
(one file, with its own `prefers-color-scheme` swap), plus `favicon-32.png` and
`apple-touch-icon.png` rendered from those two by `node learn/tools/brand-png.mjs`.
The designer's originals, C2PA metadata and all, stay verbatim in
`learn/docs/ux/redesign/design_handoff_learn_redesign/brand/`; the production copies are
the same geometry with the metadata stripped. `learn/tools/icon.html` is the macOS app
icon (`python3 tools/make_mac_app.py` from `learn/`).

The five PNGs are viewport shots at 1440x900, light scheme, `fullPage: false`. Full-page
captures do not work here: the left rail is sticky, so on a tall page it is painted halfway
down and a crop of the top 900 px shows it floating in the middle of the picture.

`e2e/readme-answer.ts` holds the one check the compare screenshot and the GIF both walk
through, along with the typed answer, the self-marks and the diagnosis, so the two never
drift apart.

`learn/web/e2e/ux-capture.spec.ts` is a separate thing and stays that way: it is the design
record, full page and in both schemes, and writes `learn/docs/ux/screens-v2/`.

All capture runs use a throwaway vault on port 8799, never a learner's vault.
