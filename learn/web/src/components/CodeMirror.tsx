import { useEffect, useRef } from "react";
import { EditorView, keymap, highlightActiveLine, lineNumbers } from "@codemirror/view";
import { EditorState, type Extension } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { syntaxHighlighting, defaultHighlightStyle } from "@codemirror/language";

export interface CodeMirrorProps {
  value: string;
  onChange(value: string): void;
  extensions?: Extension[];
  readOnly?: boolean;
  /** `code`-type Checks block paste and offer no completion (§4.2, §6). */
  blockPaste?: boolean;
  ariaLabel: string;
  testId?: string;
  /** Escape hatch for stamping text in at the cursor (focus mode, prompt chips). */
  viewRef?: React.RefObject<EditorView | null>;
}

/**
 * Thin controlled wrapper over a CodeMirror 6 EditorView. Deliberately has no
 * autocompletion extension anywhere — the spec forbids completion in the
 * answer editor and does not ask for it in notes.
 */
export default function CodeMirror({
  value,
  onChange,
  extensions = [],
  readOnly = false,
  blockPaste = false,
  ariaLabel,
  testId,
  viewRef,
}: CodeMirrorProps) {
  const host = useRef<HTMLDivElement | null>(null);
  const view = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!host.current) return;
    const base: Extension[] = [
      lineNumbers(),
      history(),
      highlightActiveLine(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      EditorView.lineWrapping,
      EditorView.editable.of(!readOnly),
      EditorState.readOnly.of(readOnly),
      EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
      EditorView.updateListener.of((u) => {
        if (u.docChanged) onChangeRef.current(u.state.doc.toString());
      }),
      ...extensions,
    ];
    if (blockPaste) {
      base.push(
        EditorView.domEventHandlers({
          paste: (event) => {
            event.preventDefault();
            return true;
          },
          drop: (event) => {
            event.preventDefault();
            return true;
          },
        }),
      );
    }
    const v = new EditorView({
      state: EditorState.create({ doc: value, extensions: base }),
      parent: host.current,
    });
    view.current = v;
    if (viewRef) viewRef.current = v;
    return () => {
      v.destroy();
      view.current = null;
      if (viewRef) viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly, blockPaste, ariaLabel]);

  // Keep the view in sync when the value changes from outside.
  useEffect(() => {
    const v = view.current;
    if (!v) return;
    const current = v.state.doc.toString();
    if (current === value) return;
    v.dispatch({ changes: { from: 0, to: current.length, insert: value } });
  }, [value]);

  return <div className="cm-host" ref={host} data-testid={testId} />;
}
