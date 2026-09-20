# README assets

| File | How it is made |
| --- | --- |
| `demo.gif` | `cd learn/web && npx playwright test -c playwright.demo.config.ts` (`e2e/demo-capture.spec.ts`), then `bash learn/tools/demo-gif.sh` turns the newest WebM into the GIF |
| `desk.png`, `module.png`, `attempt-compare.png`, `debrief.png`, `focus.png` | `cd learn/web && npx playwright test -c playwright.readme.config.ts` (`e2e/readme-capture.spec.ts`) writes all five straight into this folder |
| `social-preview.png` | `node learn/tools/social-preview.mjs docs/assets/social-preview.png` (1280x640; upload under Settings, then Social preview) |

The five PNGs are viewport shots at 1440x900, light scheme, `fullPage: false`. Full-page
captures do not work here: the left rail is sticky, so on a tall page it is painted halfway
down and a crop of the top 900 px shows it floating in the middle of the picture.

`e2e/readme-answer.ts` holds the one check the compare screenshot and the GIF both walk
through, along with the typed answer, the self-marks and the diagnosis, so the two never
drift apart.

`learn/web/e2e/ux-capture.spec.ts` is a separate thing and stays that way: it is the design
record, full page and in both schemes, and writes `learn/docs/ux/screens-v2/`.

All capture runs use a throwaway vault on port 8799, never a learner's vault.
