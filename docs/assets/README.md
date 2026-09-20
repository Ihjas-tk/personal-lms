# README assets

| File | How it is made |
| --- | --- |
| `demo.gif` | `cd learn/web && npx playwright test -c playwright.demo.config.ts`, then `learn/tools/demo-gif.sh` (ffmpeg/gifski when present) |
| `desk.png`, `module.png`, `attempt-compare.png`, `debrief.png`, `focus.png` | `cd learn/web && npx playwright test -c playwright.ux.config.ts` writes `learn/docs/ux/screens-v2/`; the light shots are cropped to 1440×900 and copied here |
| `social-preview.png` | `node learn/tools/social-preview.mjs docs/assets/social-preview.png` (1280×640; upload under Settings → Social preview) |

All capture runs use a throwaway vault on port 8799, never a learner's vault.
