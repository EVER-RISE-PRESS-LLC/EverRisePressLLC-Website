"use client";

import dynamic from "next/dynamic";
import type { RichTextEditorProps } from "./RichTextEditorImpl";

// Staff writing tools run in the browser. Loading ProseMirror on the Worker
// wastes the free plan's CPU budget even though the editor cannot run there.
const BrowserEditor = dynamic<RichTextEditorProps>(() => import("./RichTextEditorImpl"), {
  ssr: false,
  loading: () => <div className="min-h-80 rounded-lg border bg-card p-6 text-muted-foreground" role="status">Loading writing tools…</div>,
});
export default function RichTextEditor(props: RichTextEditorProps) {
  return <BrowserEditor {...props} />;
}
