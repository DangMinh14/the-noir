"use client";

import { useRef, useState } from "react";
import { ImageOff, TriangleAlert, Upload } from "lucide-react";
import { resolveImageUrl } from "@/lib/api";

// Common mistake: pasting a photo-page link (unsplash.com/photos/slug-id)
// instead of the direct image link (images.unsplash.com/photo-id). The
// page link isn't an image, so it just fails to load with no clear reason.
function pageLinkWarning(url: string): string | null {
  if (/^https?:\/\/(www\.)?unsplash\.com\/photos\//i.test(url)) {
    return 'This is an Unsplash page link, not the image itself. Right-click the photo and choose "Copy image address" instead (the correct link looks like images.unsplash.com/photo-...).';
  }
  return null;
}

export type ImageSelection =
  | { kind: "unchanged" } // editing, keep whatever is already saved
  | { kind: "file"; file: File; previewUrl: string }
  | { kind: "url"; url: string }
  | { kind: "none" }; // fall back to the stock photo

// Generic image picker: drag/pick a local file (with instant preview), paste
// an external URL instead, or leave it for a stock-photo fallback. Reused
// for both products and categories via the fallbackImage/label/helperText props.
export function ImageUploadField({
  currentImageUrl,
  onChange,
  label = "Photo",
  fallbackImage,
  helperText = "No photo yet? Leave this empty and a stock photo is used until you upload one.",
}: {
  currentImageUrl?: string;
  onChange: (selection: ImageSelection) => void;
  label?: string;
  fallbackImage: string;
  helperText?: string;
}) {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [preview, setPreview] = useState<string | null>(
    currentImageUrl ? resolveImageUrl(currentImageUrl) : null,
  );
  const [urlValue, setUrlValue] = useState(currentImageUrl ?? "");
  const [urlWarning, setUrlWarning] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setFileName(file.name);
    onChange({ kind: "file", file, previewUrl });
  }

  function handleUrlChange(value: string) {
    const trimmed = value.trim();
    setUrlValue(value);
    setUrlWarning(pageLinkWarning(trimmed));
    setPreview(trimmed || null);
    onChange(trimmed ? { kind: "url", url: trimmed } : { kind: "none" });
  }

  return (
    <div>
      <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-cream-muted">
        {label}
      </span>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative h-32 w-32 shrink-0 overflow-hidden border border-gold-500/20 bg-noir-950">
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob/external previews, not an optimizable asset */}
          <img
            src={preview || fallbackImage}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              if (e.currentTarget.src !== fallbackImage) {
                setPreview(fallbackImage);
              }
            }}
          />
          {!preview && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-noir-950/75 py-1.5 text-cream-faint">
              <ImageOff size={12} aria-hidden />
              <span className="text-[9px] uppercase tracking-[0.15em]">
                Stock photo
              </span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="mb-3 flex gap-1 border border-gold-500/15 p-1 text-[11px] uppercase tracking-[0.15em]" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "upload"}
              onClick={() => setMode("upload")}
              className={`flex-1 cursor-pointer px-3 py-1.5 transition-colors ${
                mode === "upload"
                  ? "bg-gold-500/15 text-gold-300"
                  : "text-cream-faint hover:text-cream"
              }`}
            >
              Upload
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "url"}
              onClick={() => setMode("url")}
              className={`flex-1 cursor-pointer px-3 py-1.5 transition-colors ${
                mode === "url"
                  ? "bg-gold-500/15 text-gold-300"
                  : "text-cream-faint hover:text-cream"
              }`}
            >
              Image URL
            </button>
          </div>

          {mode === "upload" ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFile(e.dataTransfer.files[0]);
              }}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed px-4 py-5 text-center transition-colors ${
                dragOver
                  ? "border-gold-400 bg-gold-500/10"
                  : "border-gold-500/25 hover:border-gold-500/50"
              }`}
            >
              <Upload size={18} className="text-gold-400" aria-hidden />
              <p className="text-xs text-cream-muted">
                {fileName ?? "Drop an image or click to browse"}
              </p>
              <p className="text-[11px] text-cream-faint">
                JPG, PNG or WEBP, up to 5 MB
              </p>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
          ) : (
            <>
              <input
                type="url"
                value={urlValue}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://..."
                className="w-full border border-gold-500/20 bg-noir-950 px-4 py-3 text-sm text-cream placeholder:text-cream-faint focus:border-gold-400 focus:outline-none"
              />
              {urlWarning && (
                <p
                  role="alert"
                  className="mt-2 flex items-start gap-2 border border-amber-400/25 bg-amber-950/20 px-3 py-2.5 text-[11px] leading-relaxed text-amber-300"
                >
                  <TriangleAlert size={14} className="mt-0.5 shrink-0" aria-hidden />
                  {urlWarning}
                </p>
              )}
            </>
          )}

          <p className="mt-2.5 text-[11px] leading-relaxed text-cream-faint">
            {helperText}
          </p>
        </div>
      </div>
    </div>
  );
}
