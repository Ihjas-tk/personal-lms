import type { HighlighterCore } from "shiki/core";

export const SHIKI_LANGS = ["python", "typescript", "bash", "json", "yaml", "sql"] as const;
export type ShikiLang = (typeof SHIKI_LANGS)[number];

let pending: Promise<HighlighterCore> | null = null;

/**
 * Lazily builds a Shiki core highlighter with only the six languages the spec
 * allows (§6). Everything else falls back to plain <pre><code>.
 */
export function getHighlighter(): Promise<HighlighterCore> {
  if (!pending) {
    pending = (async () => {
      const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] = await Promise.all([
        import("shiki/core"),
        import("shiki/engine/javascript"),
      ]);
      return createHighlighterCore({
        themes: [
          import("@shikijs/themes/github-light"),
          import("@shikijs/themes/github-dark"),
        ],
        langs: [
          import("@shikijs/langs/python"),
          import("@shikijs/langs/typescript"),
          import("@shikijs/langs/bash"),
          import("@shikijs/langs/json"),
          import("@shikijs/langs/yaml"),
          import("@shikijs/langs/sql"),
        ],
        engine: createJavaScriptRegexEngine(),
      });
    })();
  }
  return pending;
}

export function isSupportedLang(lang: string | undefined): lang is ShikiLang {
  return !!lang && (SHIKI_LANGS as readonly string[]).includes(lang);
}

export function prefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}
