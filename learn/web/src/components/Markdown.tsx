import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import CodeBlock from "./CodeBlock";

/**
 * Preview renderer (§6): react-markdown + remark-gfm + remark-math +
 * rehype-katex, with fenced code going through Shiki / Mermaid.
 */
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="preview" data-testid="markdown-preview">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{ pre: CodeBlock as never }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
