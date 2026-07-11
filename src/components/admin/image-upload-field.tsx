"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImageOff, TriangleAlert, Upload, X } from "lucide-react";
import { EASE_LUXE } from "../reveal";
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

// Generic image picker: shows the current photo, and opens a modal to swap it
// out via either a local upload or an external URL (one at a time, picked with
// a radio). Reused for products and categories via the fallbackImage/label props.
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
  const [preview, setPreview] = useState<string | null>(
    currentImageUrl ? resolveImageUrl(currentImageUrl) : null,
  );
  const [changeOpen, setChangeOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Draft state for the change modal, reset each time it opens so a cancelled
  // edit never leaks into the next one.
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [urlValue, setUrlValue] = useState("");
  const [urlWarning, setUrlWarning] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasPhoto = !!preview;
  const canApply = mode === "upload" ? !!file : !!urlValue.trim();

  useEffect(() => {
    if (!changeOpen && !lightboxOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setChangeOpen(false);
        setLightboxOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [changeOpen, lightboxOpen]);

  function openChange() {
    setMode("upload");
    setFile(null);
    setFileName(null);
    setFilePreview(null);
    setUrlValue("");
    setUrlWarning(null);
    setDragOver(false);
    setChangeOpen(true);
  }

  function handleDraftFile(f: File | undefined) {
    if (!f) return;
    setFile(f);
    setFileName(f.name);
    setFilePreview(URL.createObjectURL(f));
  }

  function apply() {
    if (mode === "upload" && file && filePreview) {
      setPreview(filePreview);
      onChange({ kind: "file", file, previewUrl: filePreview });
    } else if (mode === "url") {
      const trimmed = urlValue.trim();
      if (!trimmed) return;
      setPreview(trimmed);
      onChange({ kind: "url", url: trimmed });
    }
    setChangeOpen(false);
  }

  function removePhoto() {
    setPreview(null);
    onChange({ kind: "none" });
  }

  return (
    <div>
      <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-cream-muted">
        {label}
      </span>

      <div className="flex items-start gap-4">
        <div className="relative h-32 w-32 shrink-0 overflow-hidden border border-gold-500/20 bg-noir-950">
          <button
            type="button"
            onClick={() => hasPhoto && setLightboxOpen(true)}
            disabled={!hasPhoto}
            aria-label={hasPhoto ? "Preview photo" : undefined}
            className={`block h-full w-full ${hasPhoto ? "cursor-zoom-in" : "cursor-default"}`}
          >
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
          </button>
          {!preview && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-noir-950/75 py-1.5 text-cream-faint">
              <ImageOff size={12} aria-hidden />
              <span className="text-[9px] uppercase tracking-[0.15em]">
                Stock photo
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-start gap-2">
          <div className="flex gap-3 text-[11px] uppercase tracking-[0.15em]">
            <button
              type="button"
              onClick={openChange}
              className="cursor-pointer text-gold-400 transition-colors hover:text-gold-300"
            >
              {hasPhoto ? "Change" : "Add photo"}
            </button>
            {hasPhoto && (
              <button
                type="button"
                onClick={removePhoto}
                className="cursor-pointer text-red-400/80 transition-colors hover:text-red-300"
              >
                Remove
              </button>
            )}
          </div>
          <p className="max-w-64 text-[11px] leading-relaxed text-cream-faint">
            {helperText}
          </p>
        </div>
      </div>

      {/* Change-photo modal */}
      <AnimatePresence>
        {changeOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setChangeOpen(false)}
              className="fixed inset-0 z-[80] bg-noir-950/75 backdrop-blur-sm"
              aria-hidden
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Change photo"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.25, ease: EASE_LUXE }}
              className="fixed inset-x-0 top-[8vh] z-[90] mx-auto flex max-h-[84vh] w-[calc(100%-2rem)] max-w-md flex-col border border-gold-500/15 bg-noir-950"
            >
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-gold-500/10 px-5">
                <h2 className="font-serif text-lg text-cream">Change photo</h2>
                <button
                  type="button"
                  onClick={() => setChangeOpen(false)}
                  aria-label="Close"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center text-cream-muted hover:text-cream"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                <fieldset>
                  <legend className="sr-only">Photo source</legend>
                  <div className="mb-4 flex flex-col gap-2">
                    <label
                      className={`flex cursor-pointer items-center gap-3 border px-4 py-2.5 text-sm transition-colors ${
                        mode === "upload"
                          ? "border-gold-400 bg-gold-500/10 text-gold-300"
                          : "border-gold-500/15 text-cream-muted hover:border-gold-500/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="image-source"
                        checked={mode === "upload"}
                        onChange={() => setMode("upload")}
                        className="h-4 w-4 accent-gold-500"
                      />
                      Upload a file
                    </label>
                    <label
                      className={`flex cursor-pointer items-center gap-3 border px-4 py-2.5 text-sm transition-colors ${
                        mode === "url"
                          ? "border-gold-400 bg-gold-500/10 text-gold-300"
                          : "border-gold-500/15 text-cream-muted hover:border-gold-500/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="image-source"
                        checked={mode === "url"}
                        onChange={() => setMode("url")}
                        className="h-4 w-4 accent-gold-500"
                      />
                      Use an image URL
                    </label>
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
                        handleDraftFile(e.dataTransfer.files[0]);
                      }}
                      className={`flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed px-4 py-6 text-center transition-colors ${
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
                        onChange={(e) => handleDraftFile(e.target.files?.[0])}
                      />
                    </div>
                  ) : (
                    <>
                      <input
                        type="url"
                        value={urlValue}
                        autoFocus
                        onChange={(e) => {
                          setUrlValue(e.target.value);
                          setUrlWarning(pageLinkWarning(e.target.value.trim()));
                        }}
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

                  {filePreview && mode === "upload" && (
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden border border-gold-500/20">
                        {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                        <img src={filePreview} alt="" className="h-full w-full object-cover" />
                      </div>
                      <span className="text-xs text-cream-faint">Ready to apply</span>
                    </div>
                  )}
                </fieldset>
              </div>

              <div className="flex shrink-0 gap-3 border-t border-gold-500/10 px-5 py-4">
                <button
                  type="button"
                  disabled={!canApply}
                  onClick={apply}
                  className="flex-1 cursor-pointer bg-gold-500 px-4 py-2.5 text-[12px] font-medium uppercase tracking-[0.2em] text-noir-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Apply photo
                </button>
                <button
                  type="button"
                  onClick={() => setChangeOpen(false)}
                  className="cursor-pointer border border-gold-500/20 px-4 py-2.5 text-[12px] uppercase tracking-[0.2em] text-cream-muted hover:text-cream"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Full-size preview lightbox */}
      <AnimatePresence>
        {lightboxOpen && preview && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setLightboxOpen(false)}
              className="fixed inset-0 z-[80] bg-noir-950/85 backdrop-blur-sm"
              aria-hidden
            />
            <motion.div
              role="dialog"
              aria-label="Photo preview"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[90] flex items-center justify-center p-6"
              onClick={() => setLightboxOpen(false)}
            >
              <div className="relative max-h-full max-w-full" onClick={(e) => e.stopPropagation()}>
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob/external previews, not an optimizable asset */}
                <img
                  src={preview}
                  alt=""
                  className="max-h-[80vh] max-w-[90vw] border border-gold-500/20 object-contain"
                />
                <button
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  aria-label="Close preview"
                  className="absolute -right-3 -top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gold-500/30 bg-noir-950 text-cream-muted hover:text-cream"
                >
                  <X size={16} aria-hidden />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
