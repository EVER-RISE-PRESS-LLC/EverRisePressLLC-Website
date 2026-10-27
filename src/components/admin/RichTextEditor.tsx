"use client";

import { useEffect, useId, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { Bold, Italic, Heading2, List, ListOrdered, Quote, Link2, ImagePlus, Table2, Undo2, Redo2, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MediaPicker } from "./media/MediaPicker";
import "./rich-text-editor.css";

export default function RichTextEditor({ value, onChange, label = "Article content", placeholder = "Start writing here…", disabled = false, errorId }: {
  value: string; onChange: (html: string) => void; label?: string; placeholder?: string; disabled?: boolean; errorId?: string;
}) {
  const id = useId();
  const change = useRef(onChange);
  const emitted = useRef(value);
  const [dialog, setDialog] = useState<"link" | "image" | null>(null);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { change.current = onChange; }, [onChange]);
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, codeBlock: false, link: { openOnClick: false, defaultProtocol: "https" } }), Image.extend({ addAttributes() { return { ...this.parent?.(), caption: { default: null, parseHTML: element => element.getAttribute("data-caption"), renderHTML: attributes => attributes.caption ? { "data-caption": attributes.caption } : {} } }; } }).configure({ allowBase64: false }), TableKit.configure({ table: { resizable: false } })],
    content: value,
    editable: !disabled,
    editorProps: { attributes: { id, role: "textbox", "aria-multiline": "true", "aria-label": label, ...(errorId ? { "aria-describedby": errorId } : {}), "data-placeholder": placeholder, class: "admin-prose-editor" } },
    onUpdate: ({ editor }) => { const html = editor.getHTML(); emitted.current = html; change.current(html); },
  });
  useEffect(() => { if (editor && value !== emitted.current) { emitted.current = value; editor.commands.setContent(value, { emitUpdate: false }); } }, [editor, value]);
  useEffect(() => { editor?.setEditable(!disabled, false); }, [editor, disabled]);
  const validLink = (href: string) => /^\/(?!\/)/.test(href) || /^https?:\/\/\S+$/i.test(href) || /^mailto:[^\s@]+@[^\s@]+$/i.test(href);
  function insert() {
    if (!editor) return;
    if (dialog === "link") {
      if (!validLink(url.trim())) return setError("Enter a full https:// link, an email link, or a page path starting with /.");
      editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
    } else {
      if (!/^\/(?!\/)/.test(url) && !/^https:\/\/\S+$/i.test(url)) return setError("Choose an image or paste a secure image link.");
      if (!alt.trim()) return setError("Describe the image so readers using a screen reader can understand it.");
      editor.chain().focus().insertContent({ type: "image", attrs: { src: url, alt: alt.trim(), ...(dimensions || {}) } }).run();
    }
    setDialog(null);
  }
  const tool = (name: string, icon: React.ReactNode, action: () => void, active = false, unavailable = false) => <button type="button" title={name} aria-label={name} aria-pressed={active} disabled={!editor || disabled || unavailable} className="admin-editor-tool" onClick={action}>{icon}</button>;
  return <div className="admin-rich-editor">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><Label htmlFor={id}>{label}</Label><span className="text-xs text-muted-foreground">Select text to format it</span></div>
    <div className="admin-editor-frame" aria-disabled={disabled}>
      <div className="admin-editor-toolbar" role="toolbar" aria-label="Text formatting">
        {tool("Bold", <Bold />, () => editor?.chain().focus().toggleBold().run(), editor?.isActive("bold"))}
        {tool("Italic", <Italic />, () => editor?.chain().focus().toggleItalic().run(), editor?.isActive("italic"))}
        <span className="admin-editor-separator" />
        {tool("Section heading", <Heading2 />, () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), editor?.isActive("heading", { level: 2 }))}
        {tool("Bullet list", <List />, () => editor?.chain().focus().toggleBulletList().run(), editor?.isActive("bulletList"))}
        {tool("Numbered list", <ListOrdered />, () => editor?.chain().focus().toggleOrderedList().run(), editor?.isActive("orderedList"))}
        {tool("Quote", <Quote />, () => editor?.chain().focus().toggleBlockquote().run(), editor?.isActive("blockquote"))}
        <span className="admin-editor-separator" />
        {tool("Add or edit link", <Link2 />, () => { setUrl(editor?.getAttributes("link").href || ""); setError(""); setDialog("link"); }, editor?.isActive("link"))}
        {editor?.isActive("link") && tool("Remove link", <Unlink />, () => editor.chain().focus().unsetLink().run())}
        {tool("Insert image", <ImagePlus />, () => { setUrl(""); setAlt(""); setDimensions(null); setError(""); setDialog("image"); })}
        {tool("Insert table", <Table2 />, () => editor?.chain().focus().insertTable({ rows: 3, cols: 2, withHeaderRow: true }).run())}
        <span className="admin-editor-separator" />
        {tool("Undo", <Undo2 />, () => editor?.chain().focus().undo().run(), false, !editor?.can().undo())}
        {tool("Redo", <Redo2 />, () => editor?.chain().focus().redo().run(), false, !editor?.can().redo())}
      </div>
      {editor?.isActive("table") && <div className="flex flex-wrap gap-2 border-b bg-muted/50 p-2"><Button type="button" variant="ghost" onClick={() => editor.chain().focus().addRowAfter().run()}>Add row</Button><Button type="button" variant="ghost" onClick={() => editor.chain().focus().addColumnAfter().run()}>Add column</Button><Button type="button" variant="ghost" onClick={() => editor.chain().focus().deleteRow().run()}>Remove row</Button><Button type="button" variant="ghost" onClick={() => editor.chain().focus().deleteTable().run()}>Remove table</Button></div>}
      {editor ? <EditorContent editor={editor} /> : <div className="min-h-80 p-6 text-muted-foreground" role="status">Loading writing tools…</div>}
    </div>
    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Paste text from your document, then add headings, links, and images. Formatting stays consistent with the website.</p>
    <Dialog open={Boolean(dialog)} onOpenChange={open => { if (!open) setDialog(null); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle>{dialog === "image" ? "Add an image" : "Add a link"}</DialogTitle><DialogDescription>{dialog === "image" ? "Choose a photo and describe what it shows." : "Select words in the editor first, then add their destination."}</DialogDescription></DialogHeader>
        {dialog === "image" ? <><MediaPicker value={url} onChange={v => { setUrl(v); setDimensions(null); }} onSelect={image => { setUrl(image.url); setDimensions(image); }} label="Image" /><div className="space-y-2"><Label htmlFor={`${id}-alt`}>Image description</Label><Input id={`${id}-alt`} value={alt} onChange={e => setAlt(e.target.value)} placeholder="What should the reader know about this image?" /></div></> : <div className="space-y-2"><Label htmlFor={`${id}-url`}>Destination</Label><Input id={`${id}-url`} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" autoFocus /></div>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}<DialogFooter><Button type="button" variant="outline" onClick={() => setDialog(null)}>Cancel</Button><Button type="button" onClick={insert}>{dialog === "image" ? "Insert image" : "Apply link"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </div>;
}
