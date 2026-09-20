## What and why

<!-- One or two sentences. Link the issue: Fixes #123. Open an issue first for anything large. -->

## Checks

- [ ] `cd learn && uv run pytest` and `uv run ruff check .`
- [ ] `cd learn/web && npx tsc -b && npx vitest run && npm run build`
- [ ] `npx playwright test` if this touches a screen or a flow
- [ ] Nothing under `learn/vault/` is committed
- [ ] The [design constraints](../CONTRIBUTING.md#design-constraints-prs-must-respect) still hold
- [ ] `CHANGELOG.md` updated under `[Unreleased]` if this is user-visible
