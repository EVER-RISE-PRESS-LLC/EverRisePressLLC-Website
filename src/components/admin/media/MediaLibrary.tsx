"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  ExternalLink,
  ImagePlus,
  Images,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/admin/EmptyState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  formatMediaBytes,
  type MediaItem,
  type MediaUsage,
} from "@/lib/admin/media";
import { prepareImage } from "./prepareImage";
import { toast } from "sonner";

export function MediaLibrary({
  onSelect,
  currentUrl,
}: {
  onSelect?: (image: MediaItem) => void;
  currentUrl?: string;
}) {
  const [images, setImages] = useState<MediaItem[]>([]);
  const [usage, setUsage] = useState<MediaUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const activeUpload = useRef<XMLHttpRequest | null>(null);
  const alive = useRef(true);
  const selected = images.find((image) => image.id === selectedId) ?? null;
  const full = Boolean(
    usage && (usage.count >= usage.maxCount || usage.bytes >= usage.maxBytes),
  );
  const filtered = images.filter((image) =>
    image.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const load = useCallback(() => {
    return fetch("/api/admin/media", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json().catch(() => null)) as {
          images?: MediaItem[];
          usage?: MediaUsage;
          error?: string;
        } | null;
        if (!response.ok || !data?.images || !data.usage)
          throw new Error(
            data?.error ??
              "The image library could not load. Please try again.",
          );
        return { images: data.images, usage: data.usage };
      })
      .then((data) => {
        if (!alive.current) return;
        setError(null);
        setImages(data.images);
        setUsage(data.usage);
        setSelectedId(
          (value) =>
            value ??
            data.images.find((image) => image.url === currentUrl)?.id ??
            null,
        );
      })
      .catch((cause: unknown) => {
        if (alive.current)
          setError(
            cause instanceof Error
              ? cause.message
              : "The image library could not load.",
          );
      })
      .finally(() => {
        if (alive.current) setLoading(false);
      });
  }, [currentUrl]);
  useEffect(() => {
    alive.current = true;
    void load();
    return () => {
      alive.current = false;
      activeUpload.current?.abort();
    };
  }, [load]);

  async function upload(file: File | undefined) {
    if (!file || uploading) return;
    setError(null);
    setUploading(true);
    setProgress(null);
    try {
      const prepared = await prepareImage(file);
      if (!alive.current) return;
      setProgress(0);
      const image = await new Promise<MediaItem>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        activeUpload.current = xhr;
        xhr.open("POST", "/api/admin/media");
        xhr.withCredentials = true;
        xhr.setRequestHeader("Content-Type", prepared.blob.type);
        xhr.setRequestHeader("X-File-Name", encodeURIComponent(prepared.name));
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && alive.current)
            setProgress(Math.round((event.loaded / event.total) * 100));
        };
        xhr.onload = () => {
          let data: { image?: MediaItem; error?: string } = {};
          try {
            data = JSON.parse(xhr.responseText);
          } catch {
            /* Return a recoverable upload error. */
          }
          if (xhr.status >= 200 && xhr.status < 300 && data.image)
            resolve(data.image);
          else
            reject(
              new Error(
                data.error ?? "The upload did not finish. Please try again.",
              ),
            );
        };
        xhr.onerror = () =>
          reject(
            new Error(
              "The upload could not reach the server. Check your connection and try again.",
            ),
          );
        xhr.onabort = () =>
          reject(
            new Error("Upload cancelled. Your existing image is unchanged."),
          );
        xhr.send(prepared.blob);
      });
      if (!alive.current) return;
      setImages((items) => [image, ...items]);
      setSelectedId(image.id);
      setQuery("");
      setUsage((value) =>
        value
          ? {
              ...value,
              count: value.count + 1,
              bytes: value.bytes + image.byteSize,
            }
          : null,
      );
      toast.success("Image uploaded and ready to use");
    } catch (cause) {
      if (alive.current)
        setError(
          cause instanceof Error
            ? cause.message
            : "The upload did not finish. Please try again.",
        );
    } finally {
      activeUpload.current = null;
      if (alive.current) {
        setUploading(false);
        setProgress(null);
        if (input.current) input.current.value = "";
      }
    }
  }

  async function deleteImage(event: React.MouseEvent) {
    event.preventDefault();
    if (!selected || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/media/${selected.id}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok)
        throw new Error(
          data?.error ?? "This image could not be deleted. Please try again.",
        );
      setImages((items) => items.filter((image) => image.id !== selected.id));
      setUsage((value) =>
        value
          ? {
              ...value,
              count: Math.max(0, value.count - 1),
              bytes: Math.max(0, value.bytes - selected.byteSize),
            }
          : null,
      );
      setSelectedId(null);
      setDeleteOpen(false);
      toast.success("Unused image deleted");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "This image could not be deleted.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {usage
              ? `${usage.count} of ${usage.maxCount} images · ${formatMediaBytes(usage.bytes)} of ${formatMediaBytes(usage.maxBytes)}`
              : "Images for your books, authors and articles"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            JPEG, PNG or WebP. Images are resized for the web, up to 1600 px and
            500 KB each.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setLoading(true);
              setError(null);
              void load();
            }}
            disabled={loading || uploading}
            aria-label="Refresh image library"
            size="icon"
            className="size-11"
          >
            <RefreshCw
              className={`size-4 ${loading ? "animate-spin motion-reduce:animate-none" : ""}`}
            />
          </Button>
          <Button
            type="button"
            onClick={() => input.current?.click()}
            disabled={uploading || full || loading}
            className="min-h-11"
          >
            <ImagePlus className="size-4" />
            Upload image
          </Button>
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            aria-label="Choose an image to upload"
            onChange={(event) => void upload(event.target.files?.[0])}
          />
        </div>
      </div>
      {full ? (
        <p
          role="status"
          className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm"
        >
          Your image library is full. Select an unused image and delete it to
          make room, or reuse an image already here.
        </p>
      ) : null}
      {uploading ? (
        <div
          role="status"
          aria-live="polite"
          className="space-y-2 rounded-lg bg-muted p-3"
        >
          <p className="flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
            {progress === null
              ? "Preparing your image…"
              : progress === 100
                ? "Finishing upload…"
                : `Uploading image… ${progress}%`}
          </p>
          {progress !== null ? (
            <progress
              max={100}
              value={progress}
              aria-label="Image upload progress"
              className="h-2 w-full accent-primary"
            />
          ) : null}
          <Button
            type="button"
            variant="ghost"
            className="min-h-11"
            disabled={progress === null}
            onClick={() => activeUpload.current?.abort()}
          >
            Cancel upload
          </Button>
        </div>
      ) : null}
      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {error}
          {!images.length && !loading ? (
            <Button
              type="button"
              variant="outline"
              className="ml-2 min-h-11"
              onClick={() => {
                setLoading(true);
                setError(null);
                void load();
              }}
            >
              Try again
            </Button>
          ) : null}
        </div>
      ) : null}
      {loading ? (
        <div
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          aria-label="Loading images"
          aria-busy="true"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="aspect-square animate-pulse rounded-lg bg-muted motion-reduce:animate-none"
            />
          ))}
        </div>
      ) : images.length === 0 ? (
        <EmptyState
          icon={Images}
          title="A home for your images"
          message="Upload a book cover, author photo or article image. Then reuse it anywhere in the workspace."
          action={
            <Button
              type="button"
              onClick={() => input.current?.click()}
              disabled={uploading}
              className="min-h-11"
            >
              <ImagePlus className="size-4" />
              Upload your first image
            </Button>
          }
        />
      ) : (
        <>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search image names"
              aria-label="Search image names"
              className="min-h-11 pl-9"
            />
          </div>
          {filtered.length === 0 ? (
            <p
              role="status"
              className="py-8 text-center text-sm text-muted-foreground"
            >
              No images match “{query}”. Try another name.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((image) => (
                <button
                  key={image.id}
                  type="button"
                  aria-pressed={selectedId === image.id}
                  className={`min-w-0 overflow-hidden rounded-lg border text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring ${selectedId === image.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-background"}`}
                  onClick={() => {
                    setSelectedId(image.id);
                    setError(null);
                  }}
                >
                  <span className="relative flex aspect-[4/3] items-center justify-center bg-muted/40 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-contain"
                    />
                    {selectedId === image.id ? (
                      <span className="absolute right-2 top-2 rounded-full bg-primary p-1 text-primary-foreground">
                        <Check className="size-4" />
                      </span>
                    ) : null}
                  </span>
                  <span
                    className="block truncate px-3 pt-3 text-sm font-medium"
                    title={image.name}
                  >
                    {image.name}
                  </span>
                  <span className="block px-3 pb-3 pt-1 text-xs text-muted-foreground">
                    {image.width} × {image.height} ·{" "}
                    {formatMediaBytes(image.byteSize)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
      {selected ? (
        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background p-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{selected.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {selected.inUse
                ? "Used on the website. Replace it there before deleting."
                : "Not currently used in a saved book, author or article."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              asChild
              className="min-h-11"
            >
              <a
                href={selected.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Preview ${selected.name} in a new tab`}
              >
                <ExternalLink className="size-4" />
                <span className="hidden sm:inline">Preview</span>
              </a>
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={selected.inUse || uploading}
              aria-label={`Delete ${selected.name}`}
              size="icon"
              className="size-11 text-destructive hover:text-destructive"
              onClick={() => {
                setError(null);
                setDeleteOpen(true);
              }}
            >
              <Trash2 className="size-4" />
            </Button>
            {onSelect ? (
              <Button
                type="button"
                className="min-h-11"
                disabled={uploading}
                onClick={() => onSelect(selected)}
              >
                <Check className="size-4" />
                Use image
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
      <AlertDialog
        open={deleteOpen}
        onOpenChange={(next) => {
          if (!deleting) setDeleteOpen(next);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans">
              Delete this unused image?
            </AlertDialogTitle>
            <AlertDialogDescription>
              “{selected?.name}” will be permanently removed from the library.
              Saved book, author and article images are protected. Unsaved
              selections and links shared elsewhere are not tracked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11" disabled={deleting}>
              Keep image
            </AlertDialogCancel>
            <AlertDialogAction
              className="min-h-11 bg-destructive text-background hover:bg-destructive/90"
              disabled={deleting}
              onClick={deleteImage}
            >
              {deleting ? "Deleting…" : "Delete image"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
