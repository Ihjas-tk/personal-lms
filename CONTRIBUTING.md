# Contributing

Thanks for looking. **Open an issue before a big PR.** The design constraints below rule out
a lot of otherwise reasonable ideas, and it is better to find that out before you write the
code.

## Set up

```bash
uv sync --project learn            # Python 3.12+, deps and the `learn` entry point
cd learn/web && npm install        # the React app
npm run build                      # writes learn/src/learn/static, which the server serves
```

## Checks (all of these must pass)

```bash
cd learn && uv run pytest          # backend
cd learn && uv run ruff check .    # lint; `ruff format` is not enforced
cd learn/web && npx tsc --noEmit   # typecheck
cd learn/web && npx vitest run     # unit tests
cd learn/web && npx playwright test   # browser flows, on port 8799 against a temp vault
```

Playwright never uses port 8765 and never touches your own `vault/`. If you change the
curriculum models, run `cd learn && uv run learn schema`, because a test fails when
`schema.json` drifts.

## Design constraints PRs must respect

These are the point of the project rather than preferences:

- **Files are the truth.** Everything the app records is Markdown or YAML in the vault. The
  SQLite index under `.cache/` is derived and must stay deletable.
- **Typed-answer checks, with the reference un-renderable until the answer is frozen.** This
  is enforced in the store rather than by hiding a `<div>`.
- **Confidence is captured before the answer** and cannot be skipped.
- **The re-test ladder stays.** `lasting` requires two clean passes at least seven days apart.
- **No streaks, no points, no badges, no single percent-complete bar, no "mark as complete."**
- **AI never generates content.** Three optional actions exist: copy-edit a note as a
  reviewed diff, restructure a note as a reviewed diff (layout and the source it came from,
  never a new fact), and a second opinion on an already-frozen answer. None of them writes
  without review, and a checker refuses anything that loses or alters what the note said.
- **The vault stays git-ignored forever.** Never commit anything under `learn/vault/`.

By contributing you agree your work is MIT-licensed, and to the [Code of Conduct](CODE_OF_CONDUCT.md).
