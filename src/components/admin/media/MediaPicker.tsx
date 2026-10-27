"use client";

import { useId, useState } from "react";
import { ImageOff, Images, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MediaLibrary } from "./MediaLibrary";

export function MediaPicker({
  value,
  onChange,
  label = "Image",
  onSelect,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  onSelect?: (image: { url: string; width: number; height: number }) => void;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const canPreview = Boolean(
    value && (/^\/(?!\/)/.test(value) || /^https?:\/\//i.test(value)),
  );
  return (
    <div className="min-w-0 space-y-3">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex min-h-40 items-center justify-center overflow-hidden rounded-lg border bg-muted/30 p-3">
        {canPreview && failedUrl !== value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt={`${label.replace(/\s*\*$/, "")} preview`}
            className="max-h-60 max-w-full object-contain"
            onError={() => setFailedUrl(value)}
          />
        ) : (
          <div className="py-5 text-center text-muted-foreground">
            <ImageOff className="mx-auto mb-2 size-6" />
            <p className="text-sm">
              {value ? "Image preview unavailable" : "No image selected"}
            </p>
            {value ? (
              <p className="mt-1 text-xs">
                Check the image link, or choose another image.
              </p>
            ) : null}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" className="min-h-11 flex-1">
              <Images className="size-4" />
              Choose or upload
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85dvh] overflow-y-auto p-5 sm:max-w-4xl">
            <DialogHeader className="pr-7">
              <DialogTitle className="font-sans text-xl">
                Choose an image
              </DialogTitle>
              <DialogDescription>
                Upload a new image or reuse one from your library. Select it,
                then choose Use image.
              </DialogDescription>
            </DialogHeader>
            <MediaLibrary
              currentUrl={value}
              onSelect={(image) => {
                onChange(image.url);
                onSelect?.({
                  url: image.url,
                  width: image.width,
                  height: image.height,
                });
                setOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11"
            aria-label={`Clear ${label.replace(/\s*\*$/, "").toLowerCase()}`}
            onClick={() => onChange("")}
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </div>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="/images/photo.jpg or https://…"
        aria-describedby={`${id}-help`}
        className="min-h-11"
      />
      <p
        id={`${id}-help`}
        className="text-xs leading-relaxed text-muted-foreground"
      >
        You can also paste an existing image link. Choose Save when you finish
        editing to apply this image.
      </p>
    </div>
  );
}
