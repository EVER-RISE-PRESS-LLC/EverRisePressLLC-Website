"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowUpRight, Check, Circle, Eye, Loader2, Plus, Save, Send, Trash2, Archive, ChevronDown, Copy } from "lucide-react";
import type { BlogArticle, StoredArticle } from "@/lib/blog/model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/admin/PageHeader";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import { useUnsavedChanges } from "@/components/admin/books/useUnsavedChanges";
import { useDraftRecovery } from "@/components/admin/books/useDraftRecovery";
import { DraftRecoveryNotice } from "@/components/admin/books/DraftRecoveryNotice";
import { removeDraftSnapshot } from "@/lib/admin/draft-recovery";
import { articleStatus } from "./ArticlesClient";
import { blocksToHtml, htmlToBlocks, plainWordCount } from "./article-html";
import "./article-editor.css";

function parseRecovery(value: unknown): BlogArticle | null {
  if (!value || typeof value !== "object") return null;
  const article = value as BlogArticle;
  if (![article.slug, article.title, article.description, article.section, article.imageUrl, article.imageAlt, article.editorialNotes].every(item => typeof item === "string") || !article.author || ![article.author.name, article.author.url].every(item => typeof item === "string") || !["Person", "Organization"].includes(article.author.type) || typeof article.author.confirmed !== "boolean" || !Array.isArray(article.blocks) || !Array.isArray(article.sources) || !article.sources.every(source => source && [source.id, source.title, source.url].every(item => typeof item === "string")) || !Array.isArray(article.relatedSlugs) || !article.relatedSlugs.every(item => typeof item === "string")) return null;
  if (!article.blocks.every(block => block && ["paragraph", "heading", "list", "quote", "table", "richtext", "image"].includes(block.type))) return null;
  try { blocksToHtml(article.blocks); return documentOf(article); } catch { return null; }
}

export type AuthorChoice = { name: string; slug: string };
type Action = "save" | "publish" | "unpublish" | "archive" | "restore";
function documentOf(article: BlogArticle): BlogArticle {
  const { slug, status, title, description, section, author, publishedAt, updatedAt, review, imageUrl, imageAlt, imageWidth, imageHeight, blocks, sources, relatedSlugs, editorialNotes } = article;
  return { slug, status, title, description, section, author, publishedAt, updatedAt, review, imageUrl, imageAlt, ...(imageWidth ? { imageWidth } : {}), ...(imageHeight ? { imageHeight } : {}), blocks, sources, relatedSlugs, editorialNotes };
}
const signature = (article: BlogArticle) => JSON.stringify(documentOf(article));
const slugify = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);

export default function ArticleEditor({ initial, empty, authors, otherArticles, editorId }: { editorId: string; initial?: StoredArticle; empty: BlogArticle; authors: AuthorChoice[]; otherArticles: { slug: string; title: string }[] }) {
  const router = useRouter();
  const first = documentOf(initial || empty);
  const [document, setDocument] = useState(first);
  const latest = useRef(first);
  const [stored, setStored] = useState(initial);
  const storedRef = useRef(initial);
  const [savedSignature, setSavedSignature] = useState(signature(first));
  const [html, setHtml] = useState(() => blocksToHtml(first.blocks));
  const [tab, setTab] = useState<"write" | "settings">("write");
  const [busy, setBusy] = useState<Action | null>(null);
  const inFlight = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [conflict, setConflict] = useState(false);
  const [notice, setNotice] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"unpublish" | "archive" | "restore" | "reload" | null>(null);
  const [recoveredNeedsReview, setRecoveredNeedsReview] = useState(false);
  const clearRecovery = useRef<() => void>(() => {});
  const [slugEdited, setSlugEdited] = useState(Boolean(initial));
  const dirty = signature(document) !== savedSignature;
  const recovery = useDraftRecovery({
    storageKey: `article:${editorId}:${stored?.id || "new"}`,
    baseline: savedSignature, current: document, dirty, parse: parseRecovery,
    onRestore(value, info) {
      const restored = { ...value, ...(storedRef.current?.everPublishedAt ? { slug: storedRef.current.slug } : {}) };
      latest.current = restored; setDocument(restored); setHtml(blocksToHtml(restored.blocks));
      setRecoveredNeedsReview(info.baselineChanged); setError(null); setIssues([]);
      setNotice(info.baselineChanged ? "Local draft restored. Review it against the saved version, then choose Save draft. Autosave is paused for this recovery." : "Local draft restored. Your writing is back in the editor.");
    },
  });
  useEffect(() => { clearRecovery.current = recovery.clear; });
  const navigation = useUnsavedChanges(dirty, recovery.clear);
  const words = plainWordCount(html);
  const archived = Boolean(stored?.archivedAt);
  const readonly = archived || busy === "publish" || busy === "archive" || busy === "unpublish" || busy === "restore";

  function update(patch: Partial<BlogArticle>) {
    const next = { ...latest.current, ...patch };
    latest.current = next;
    setDocument(next);
    setNotice("");
    if (!conflict) { setError(null); setIssues([]); }
  }

  const save = useCallback(async (action: Action = "save", reviewConfirmed = false): Promise<StoredArticle | undefined> => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(action); setError(null); setIssues([]); setNotice("");
    const snapshot = latest.current;
    const before = signature(snapshot);
    const previous = storedRef.current;
    try {
      const response = await fetch(previous ? `/api/admin/articles/${previous.id}` : "/api/admin/articles", { method: previous ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(previous ? { action, revision: previous.revision, document: snapshot, reviewConfirmed } : { document: snapshot }) });
      const result = await response.json().catch(() => null) as { article?: StoredArticle; issues?: string[]; error?: string; code?: string } | null;
      if (!response.ok) {
        if (result?.code === "REVISION_CONFLICT") setConflict(true);
        setIssues(Array.isArray(result?.issues) ? result.issues : []);
        throw new Error(result?.error || (response.status === 401 ? "Your session has ended. Open sign-in in another tab, then retry without closing this draft." : "Your changes could not be saved. Check your connection and retry."));
      }
      const saved = result?.article;
      if (!saved?.id) throw new Error("The server did not confirm this save. Your text is still in the editor.");
      const noNewerEdits = signature(latest.current) === before;
      if (noNewerEdits) clearRecovery.current();
      else if (!previous) { try { removeDraftSnapshot(window.sessionStorage, `article:${editorId}:new`); } catch { /* The current draft remains in the editor. */ } }
      setRecoveredNeedsReview(false);
      storedRef.current = saved; setStored(saved);
      const normalized = documentOf(saved);
      setSavedSignature(signature(normalized));
      if (signature(latest.current) === before) { latest.current = normalized; setDocument(normalized); }
      if (action === "save") {
        if (window.location.pathname !== `/admin/articles/${saved.slug}`) window.history.replaceState(null, "", `/admin/articles/${saved.slug}`);
      } else {
        setReviewOpen(false); setConfirmed(false); setConfirmAction(null);
        const message = action === "publish" ? "Published. Your article is now on the blog." : action === "unpublish" ? "Unpublished. The article is now a private draft." : action === "archive" ? "Archived. You can restore it from Articles → Archived." : "Restored with its previous visibility.";
        setNotice(message); toast.success(message);
        router.refresh();
      }
      return saved;
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to save. Your text is still here."); return; }
    finally { inFlight.current = false; setBusy(null); }
  }, [router, editorId]);

  useEffect(() => {
    if (!dirty || busy || error || conflict || archived || recovery.recovery || recoveredNeedsReview || !document.title.trim() && !document.blocks.length) return;
    const timer = setTimeout(() => { void save(); }, 1500);
    return () => clearTimeout(timer);
  }, [document, dirty, busy, error, conflict, archived, recovery.recovery, recoveredNeedsReview, save]);

  const checks: [string, boolean][] = [
    ["A clear title and category", Boolean(document.title.trim()) && document.title.length <= 90 && Boolean(document.section.trim())],
    ["A search description of 70–200 characters", document.description.trim().length >= 70 && document.description.trim().length <= 200],
    ["Article content with complete paragraphs", html.replace(/<[^>]*>/g, " ").trim().length >= 80 && document.blocks.some(block => block.type === "paragraph" || block.type === "richtext")],
    ["Approved byline and author profile link", document.author.confirmed && Boolean(document.author.name.trim()) && Boolean(document.author.url.trim())],
    ["Sharing image with an image description", Boolean(document.imageUrl) && Boolean(document.imageAlt.trim())],
    ["At least one complete supporting source", document.sources.length > 0 && document.sources.every(source => source.title.trim() && /^https:\/\//.test(source.url))],
    ["Descriptions for article images", document.blocks.every(block => block.type !== "image" || Boolean(block.alt.trim()))],
  ];
  const ready = checks.every(([, passes]) => passes);
  async function preview() { const article = dirty || !storedRef.current ? await save() : storedRef.current; if (article) router.push(`/admin/articles/${article.slug}/preview`); }
  async function copyDraft() { try { await navigator.clipboard.writeText(`${latest.current.title}\n\n${latest.current.description}\n\n${new DOMParser().parseFromString(html, "text/html").body.textContent}`); setNotice("Draft text copied."); } catch { setError("Copy is unavailable in this browser. Select and copy your text from the editor."); } }

  return <>
    <DraftRecoveryNotice {...recovery} noun="article" />
    <Link href="/admin/articles" className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />All articles</Link>
    <PageHeader title={initial ? "Edit article" : "Write an article"} description="A useful story, one paragraph at a time. Drafts save automatically while you write." />
    <div className="admin-article-commandbar">
      <div className="flex min-w-0 flex-wrap items-center gap-3"><span className={`admin-status-tag ${stored?.isLive && !stored.hasUnpublishedChanges ? "admin-status-tag-live" : ""}`}>{archived ? "Archived" : stored ? articleStatus(stored) : "New draft"}</span><p role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-muted-foreground">{busy ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" /> : !dirty && stored ? <Check className="size-4" /> : <Circle className="size-2 fill-current" />}{busy ? busy === "save" ? "Saving…" : "Working…" : error ? "Save needs attention" : dirty ? "Unsaved changes" : stored ? "All changes saved" : "Private until you publish"}</p></div>
      <div className="flex flex-wrap gap-2">{stored?.isLive && <Button variant="ghost" asChild><Link href={`/blog/${stored.slug}`} target="_blank">View live<ArrowUpRight className="size-4" /></Link></Button>}<Button variant="outline" onClick={() => void save()} disabled={Boolean(busy) || conflict || archived || !dirty && Boolean(stored)}><Save className="size-4" />Save draft</Button><Button variant="outline" onClick={() => void preview()} disabled={Boolean(busy) || conflict}><Eye className="size-4" />Preview</Button>{!archived && <Button onClick={() => { setConfirmed(false); setReviewOpen(true); }} disabled={Boolean(busy) || conflict || Boolean(stored?.isLive && !stored.hasUnpublishedChanges && !dirty)}><Send className="size-4" />{stored?.isLive ? stored.hasUnpublishedChanges || dirty ? "Publish changes" : "Published" : "Review & publish"}</Button>}</div>
    </div>
    {stored?.isLive && stored.hasUnpublishedChanges && <div className="my-5 flex items-start gap-3 rounded-lg border bg-secondary/50 p-4 text-sm leading-relaxed"><Circle className="mt-1 size-3 shrink-0" /><p>Your saved changes are private. The previously published version stays live until you choose <strong>Publish changes</strong>.</p></div>}
    {archived && <div className="my-5 rounded-lg border bg-muted p-4 text-sm leading-relaxed"><strong>This article is archived.</strong> Restore it to edit again. Restoring also restores its previous public visibility.<Button variant="outline" className="ml-3" onClick={() => setConfirmAction("restore")} disabled={Boolean(busy)}>Restore article</Button></div>}
    {error && <div role="alert" className="my-5 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm leading-relaxed text-destructive"><strong>{error}</strong>{issues.length > 0 && <ul className="mt-2 list-disc pl-5">{issues.map((issue, index) => <li key={index}>{issue}</li>)}</ul>}<div className="mt-3 flex flex-wrap gap-2">{conflict ? <><Button variant="outline" onClick={() => void copyDraft()}><Copy className="size-4" />Copy draft text</Button><Button variant="outline" onClick={() => setConfirmAction("reload")}>Reload saved version</Button></> : <Button variant="outline" onClick={() => void save()} disabled={Boolean(busy)}>Retry save</Button>}</div></div>}
    {notice && <div role="status" className="my-5 flex flex-wrap items-center gap-3 rounded-lg border bg-secondary p-4 text-sm"><Check className="size-4" /><span>{notice}</span>{stored?.isLive && <Link href={`/blog/${stored.slug}`} target="_blank" className="inline-flex min-h-11 items-center gap-1 font-semibold underline">View live article<ArrowUpRight className="size-4" /></Link>}</div>}
    <div className="mb-6 mt-6 flex w-fit gap-1 rounded-lg bg-muted p-1" aria-label="Editor sections"><Button variant={tab === "write" ? "outline" : "ghost"} aria-pressed={tab === "write"} onClick={() => setTab("write")}>Write</Button><Button variant={tab === "settings" ? "outline" : "ghost"} aria-pressed={tab === "settings"} onClick={() => setTab("settings")}>Details & sharing</Button></div>
    <fieldset disabled={readonly} className="min-w-0">{tab === "write" ? <div className="admin-article-writing-grid"><div className="min-w-0 space-y-6"><div className="admin-writing-sheet"><div className="space-y-3"><Label htmlFor="article-title">Article title</Label><Textarea id="article-title" value={document.title} maxLength={90} rows={2} className="admin-article-title-input resize-none" disabled={readonly} onChange={e => { const title = e.target.value; update({ title, ...(!slugEdited && !stored ? { slug: slugify(title) } : {}) }); }} placeholder="Give your story a clear title" /><p className="text-xs text-muted-foreground">{document.title.length}/90 characters</p></div><div className="mt-7 space-y-3"><Label htmlFor="article-summary">Short introduction</Label><Textarea id="article-summary" value={document.description} maxLength={200} disabled={readonly} onChange={e => update({ description: e.target.value })} placeholder="What will readers understand or be able to do after reading?" /><p className="text-xs text-muted-foreground">Also used in search results. {document.description.length}/200 characters; aim for at least 70.</p></div></div><RichTextEditor value={html} disabled={readonly} onChange={value => { setHtml(value); update({ blocks: htmlToBlocks(value) }); }} /></div><aside className="space-y-5"><div className="rounded-xl border bg-card p-5"><h2 className="text-base font-semibold">Your writing desk</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{words} {words === 1 ? "word" : "words"} · about {Math.max(1, Math.ceil(words / 200))} min read</p><div className="mt-5 space-y-2"><Label htmlFor="article-category">Category</Label><Input id="article-category" value={document.section} disabled={readonly} onChange={e => update({ section: e.target.value })} placeholder="e.g. Money habits" /></div><p className="mt-5 text-sm leading-relaxed text-muted-foreground">Start with what the reader needs. Add your own examples, link to your sources, and finish with one useful next step.</p><Button variant="outline" className="mt-4 w-full" onClick={() => setTab("settings")}>Add author & sharing details</Button></div>{document.editorialNotes && <details className="rounded-xl border bg-card p-5" open><summary className="flex min-h-6 cursor-pointer items-center justify-between gap-3 font-semibold">Editorial brief<ChevronDown className="size-4" /></summary><p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{document.editorialNotes}</p><p className="mt-3 text-xs text-muted-foreground">Private note. This never appears in the published article.</p></details>}<div className="px-1"><p className="text-xs leading-relaxed text-muted-foreground">Autosave starts after you add a title or content. If a save fails, your text stays here and navigation asks before discarding it.</p></div></aside></div> : <div className="admin-article-details-grid"><div className="space-y-6"><section className="admin-writing-sheet"><h2 className="mb-5 text-xl font-semibold">Author & article link</h2><div className="space-y-5"><div className="space-y-2"><Label htmlFor="article-byline">Byline</Label><select id="article-byline" className="admin-native-select" disabled={readonly} value={document.author.type === "Organization" ? "publisher" : authors.some(author => `/authors/${author.slug}` === document.author.url) ? document.author.url : "custom"} onChange={e => { const chosen = authors.find(author => `/authors/${author.slug}` === e.target.value); update({ author: chosen ? { type: "Person", name: chosen.name, url: `/authors/${chosen.slug}`, confirmed: false } : e.target.value === "publisher" ? { type: "Organization", name: "EverRise Press", url: "/about", confirmed: false } : { type: "Person", name: "", url: "", confirmed: false } }); }}><option value="publisher">EverRise Press</option>{authors.map(author => <option key={author.slug} value={`/authors/${author.slug}`}>{author.name}</option>)}<option value="custom">Another contributor</option></select></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="article-author-name">Published author name</Label><Input id="article-author-name" value={document.author.name} disabled={readonly} onChange={e => update({ author: { ...document.author, name: e.target.value, confirmed: false } })} /></div><div className="space-y-2"><Label htmlFor="article-author-url">Author profile link</Label><Input id="article-author-url" value={document.author.url} disabled={readonly} onChange={e => update({ author: { ...document.author, url: e.target.value, confirmed: false } })} placeholder="/authors/name or https://…" /></div></div><label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border p-4 text-sm leading-relaxed"><input type="checkbox" className="mt-1 size-4 shrink-0 accent-current" checked={document.author.confirmed} disabled={readonly} onChange={e => update({ author: { ...document.author, confirmed: e.target.checked } })} /><span>I have approval to publish this article under this byline.</span></label><div className="space-y-2"><Label htmlFor="article-slug">Article URL</Label><div className="flex items-center gap-1 rounded-lg border bg-muted/30 px-3"><span className="text-sm text-muted-foreground">/blog/</span><Input id="article-slug" value={document.slug} disabled={readonly || Boolean(stored?.everPublishedAt)} className="border-0 bg-transparent! px-0 shadow-none" onChange={e => { setSlugEdited(true); update({ slug: slugify(e.target.value) }); }} /></div><p className="text-xs leading-relaxed text-muted-foreground">{stored?.everPublishedAt ? "The link is fixed after first publication so shared links keep working." : "Use a short, clear address. It becomes fixed after the first publication."}</p></div></div></section><section className="admin-writing-sheet"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-semibold">Sources & further reading</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Add original sources for factual claims. These links appear below the article.</p></div><Button variant="outline" disabled={readonly} onClick={() => update({ sources: [...document.sources, { id: `source${document.sources.length + 1}-${Date.now().toString(36)}`, title: "", url: "" }] })}><Plus className="size-4" />Add source</Button></div>{document.sources.length === 0 ? <p className="mt-5 rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">No sources yet. You can keep writing and add them before publishing.</p> : <div className="mt-5 space-y-5">{document.sources.map((source, index) => <div key={source.id} className="rounded-lg border p-4"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold">Source {index + 1}</h3><Button variant="ghost" size="icon" aria-label={`Remove source ${index + 1}`} disabled={readonly} onClick={() => update({ sources: document.sources.filter((_, i) => i !== index) })}><Trash2 className="size-4" /></Button></div><div className="space-y-4"><div className="space-y-2"><Label htmlFor={`source-title-${index}`}>Source title</Label><Input id={`source-title-${index}`} value={source.title} disabled={readonly} onChange={e => update({ sources: document.sources.map((item, i) => i === index ? { ...item, title: e.target.value } : item) })} /></div><div className="space-y-2"><Label htmlFor={`source-url-${index}`}>Secure source link</Label><Input id={`source-url-${index}`} value={source.url} disabled={readonly} placeholder="https://…" onChange={e => update({ sources: document.sources.map((item, i) => i === index ? { ...item, url: e.target.value } : item) })} /></div></div></div>)}</div>}</section><section className="admin-writing-sheet"><h2 className="mb-4 text-xl font-semibold">Related reading</h2><p className="mb-4 text-sm text-muted-foreground">Choose other articles to recommend. Only published articles appear publicly.</p><div className="space-y-2">{otherArticles.length ? otherArticles.map(article => <label key={article.slug} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"><input type="checkbox" className="size-4 accent-current" checked={document.relatedSlugs.includes(article.slug)} disabled={readonly} onChange={e => update({ relatedSlugs: e.target.checked ? [...document.relatedSlugs, article.slug] : document.relatedSlugs.filter(slug => slug !== article.slug) })} /><span>{article.title || article.slug}</span></label>) : <p className="text-sm text-muted-foreground">Your other articles will appear here.</p>}</div></section><section className="admin-writing-sheet"><Label htmlFor="editorial-note">Private editorial notes</Label><Textarea id="editorial-note" className="mt-3" value={document.editorialNotes} disabled={readonly} onChange={e => update({ editorialNotes: e.target.value })} placeholder="Reminders, interview notes, or an editorial brief…" /><p className="mt-2 text-xs text-muted-foreground">Visible to staff only.</p></section></div><aside className="space-y-6"><section className="admin-writing-sheet"><h2 className="mb-5 text-xl font-semibold">Sharing image</h2><MediaPicker label="Image for search & social sharing" value={document.imageUrl} onChange={value => update({ imageUrl: value, imageWidth: undefined, imageHeight: undefined })} onSelect={image => update({ imageUrl: image.url, imageWidth: image.width, imageHeight: image.height })} /><div className="mt-5 space-y-2"><Label htmlFor="article-image-alt">Image description</Label><Input id="article-image-alt" value={document.imageAlt} disabled={readonly} onChange={e => update({ imageAlt: e.target.value })} /></div><p className="mt-3 text-xs leading-relaxed text-muted-foreground">A 1200 × 630 landscape image works well when the article is shared.</p></section><section className="admin-writing-sheet"><h2 className="text-base font-semibold">Search preview</h2><p className="mt-4 truncate text-xs text-muted-foreground">everrisepress.com › blog › {document.slug || "your-article"}</p><p className="mt-2 text-lg font-medium leading-snug text-[var(--admin-accent-text)]">{document.title || "Your article title"} | EverRise Press</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{document.description || "Your short introduction will appear here."}</p><p className="mt-4 text-xs text-muted-foreground">Search engines may choose different text.</p></section>{stored && <section className="admin-writing-sheet"><h2 className="text-base font-semibold">Visibility</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{archived ? "Archived articles are hidden from the public blog." : stored.isLive ? "The approved version is public. Saving changes keeps that version live." : "This draft is private and excluded from search indexing."}</p><div className="mt-4 flex flex-wrap gap-2">{stored.isLive && <Button variant="outline" disabled={Boolean(busy)} onClick={() => setConfirmAction("unpublish")}>Unpublish</Button>}{!archived && <Button variant="ghost" disabled={Boolean(busy)} onClick={() => setConfirmAction("archive")}><Archive className="size-4" />Archive</Button>}</div></section>}</aside></div>}</fieldset>
    <Dialog open={reviewOpen} onOpenChange={setReviewOpen}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>{stored?.isLive ? "Publish your changes" : "Ready for readers?"}</DialogTitle><DialogDescription>Review the content and details. Publishing makes the approved version public immediately.</DialogDescription></DialogHeader><ul className="space-y-3 py-2">{checks.map(([label, passes]) => <li key={label} className="flex items-start gap-3 text-sm leading-relaxed">{passes ? <Check className="mt-0.5 size-4 shrink-0 text-[var(--admin-positive)]" /> : <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}<span>{label}</span></li>)}</ul>{!ready && <div className="rounded-lg bg-muted p-4 text-sm leading-relaxed">Finish the unchecked items before publishing. <button type="button" className="min-h-11 font-semibold underline" onClick={() => { setReviewOpen(false); setTab("settings"); }}>Open details & sharing</button></div>}<label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-sm leading-relaxed"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-1 size-4 shrink-0 accent-current" /><span>I have reviewed this article, checked its factual claims and sources, and approve publishing it.</span></label>{error && <div role="alert" className="text-sm text-destructive"><p>{error}</p>{issues.length > 0 && <ul className="mt-2 list-disc pl-5">{issues.map((issue, i) => <li key={i}>{issue}</li>)}</ul>}</div>}<DialogFooter><Button variant="outline" onClick={() => setReviewOpen(false)}>Keep editing</Button><Button disabled={!ready || !confirmed || Boolean(busy) || !stored} onClick={() => void save("publish", confirmed)}>{busy ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" /> : <Send className="size-4" />}{stored?.isLive ? "Publish changes" : "Publish article"}</Button></DialogFooter>{!stored && <p className="text-xs text-muted-foreground">Save the draft first to enable publication.</p>}</DialogContent></Dialog>
    <AlertDialog open={Boolean(confirmAction)} onOpenChange={open => { if (!open) setConfirmAction(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{confirmAction === "reload" ? "Reload the saved version?" : confirmAction === "restore" ? "Restore this article?" : confirmAction === "archive" ? "Archive this article?" : "Unpublish this article?"}</AlertDialogTitle><AlertDialogDescription>{confirmAction === "reload" ? "Your unsaved changes will be discarded. Copy your draft text first if you need to keep it." : confirmAction === "restore" ? "This restores the article’s previous visibility. If it had a published version, that approved version becomes public again." : confirmAction === "archive" ? "This hides the article from the public blog and your active list. Its content is kept, and you can restore it from the Archived filter." : "Readers will no longer be able to open the public article. Its content stays here as a private draft."}</AlertDialogDescription></AlertDialogHeader>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<AlertDialogFooter><AlertDialogCancel>Keep editing</AlertDialogCancel><AlertDialogAction onClick={e => { e.preventDefault(); if (confirmAction === "reload") window.location.reload(); else if (confirmAction) void save(confirmAction); }} disabled={Boolean(busy)}>{busy ? "Working…" : confirmAction === "reload" ? "Reload saved version" : confirmAction === "restore" ? "Restore article" : confirmAction === "archive" ? "Archive article" : "Unpublish article"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <AlertDialog open={Boolean(navigation.pendingHref)} onOpenChange={open => { if (!open) navigation.cancel(); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Keep your unsaved writing?</AlertDialogTitle><AlertDialogDescription>Your latest changes have not reached the server. Stay here to save them, or discard them and leave.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep editing</AlertDialogCancel><AlertDialogAction onClick={navigation.discard}>Discard changes</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </>;
}
