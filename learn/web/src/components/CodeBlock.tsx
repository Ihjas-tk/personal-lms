import { useEffect, useRef, useState } from "react";
import { getHighlighter, isSupportedLang, prefersDark } from "./highlighter";

/** ```mermaid fences lazily load Mermaid 12 (§6). */
function MermaidBlock({ code }: { code: string }) {
  const host = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: prefersDark() ? "dark" : "neutral",
          securityLevel: "strict",
        });
        const id = `m${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, code);
        if (alive && host.current) host.current.innerHTML = svg;
      } catch {
        if (alive) setFailed(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [code]);

  if (failed)
    return (
      <pre>
        <code>{code}</code>
      </pre>
    );
  return <div className="mermaid-block" ref={host} data-testid="mermaid-block" />;
}

function ShikiBlock({ code, lang }: { code: string; lang: string }) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const hl = await getHighlighter();
        const out = hl.codeToHtml(code, {
          lang,
          theme: prefersDark() ? "github-dark" : "github-light",
        });
        if (alive) setHtml(out);
      } catch {
        if (alive) setHtml(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [code, lang]);

  if (html)
    return (
      <div
        className="shiki-block"
        data-testid="shiki-block"
        data-lang={lang}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  return (
    <pre data-lang={lang}>
      <code>{code}</code>
    </pre>
  );
}

/** Rendered for every fenced block reaching react-markdown's `pre` slot. */
export default function CodeBlock({ children }: { children?: React.ReactNode }) {
  const el = Array.isArray(children) ? children[0] : children;
  const props = (el as { props?: { className?: string; children?: unknown } } | undefined)
    ?.props;
  const raw = String(props?.children ?? "").replace(/\n$/, "");
  const lang = /language-([\w-]+)/.exec(props?.className ?? "")?.[1];

  if (lang === "mermaid") return <MermaidBlock code={raw} />;
  if (isSupportedLang(lang)) return <ShikiBlock code={raw} lang={lang} />;
  return (
    <pre>
      <code className={props?.className}>{raw}</code>
    </pre>
  );
}
