"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import { uploadImage } from "@/lib/api";

// Hand-rolled WYSIWYG editor: a contentEditable div driven by the browser's
// own execCommand implementation. Every browser this project targets still
// implements it fully for these commands, and it avoids pulling in a
// Quill/Tiptap-sized dependency (plus its own CSS) just to get bold/italic/
// lists/links/images. Matches this project's existing "hand-rolled" bent
// (see the admin analytics charts).
type ToolbarButton = {
  label: string;
  icon: React.ElementType;
  command: string;
  value?: string;
};

const INLINE_BUTTONS: ToolbarButton[] = [
  { label: "Bold", icon: Bold, command: "bold" },
  { label: "Italic", icon: Italic, command: "italic" },
  { label: "Underline", icon: Underline, command: "underline" },
  { label: "Strikethrough", icon: Strikethrough, command: "strikeThrough" },
];

const BLOCK_BUTTONS: ToolbarButton[] = [
  { label: "Heading", icon: Heading2, command: "formatBlock", value: "h3" },
  { label: "Quote", icon: Quote, command: "formatBlock", value: "blockquote" },
  { label: "Bulleted list", icon: List, command: "insertUnorderedList" },
  { label: "Numbered list", icon: ListOrdered, command: "insertOrderedList" },
];

export function RichTextEditor({
  value,
  onChange,
  token,
  placeholder = "Full story for the product page: tasting notes, origin, how it's served...",
}: {
  value: string;
  onChange: (html: string) => void;
  token: string | null;
  placeholder?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [empty, setEmpty] = useState(!value);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Seeded once on mount only; the editor's own DOM is the source of truth
  // afterwards (re-syncing from `value` on every render would fight the
  // caret while typing, same reasoning as ImageUploadField's one-time preview).
  useEffect(() => {
    // Without this, execCommand treats the whole editable as one block when
    // it contains only bare text nodes (no <p>/<div> yet), so the first
    // Enter press or list/heading command can swallow unrelated content.
    // Forcing <p> as the paragraph separator gives every line real block
    // structure to operate on.
    document.execCommand("defaultParagraphSeparator", false, "p");
    if (editorRef.current) editorRef.current.innerHTML = value;
    setEmpty(!value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function refreshActiveState() {
    setActive({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    });
  }

  function emitChange() {
    onChange(editorRef.current?.innerHTML ?? "");
    setEmpty(!editorRef.current?.textContent?.trim());
  }

  function run(command: string, commandValue?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    refreshActiveState();
    emitChange();
  }

  function insertLink() {
    const selection = window.getSelection();
    const hasSelection = selection && !selection.isCollapsed;
    const url = window.prompt(
      hasSelection ? "Link URL" : "Link URL (add text after inserting)",
      "https://",
    );
    if (!url) return;
    editorRef.current?.focus();
    if (hasSelection) {
      document.execCommand("createLink", false, url);
    } else {
      const label = window.prompt("Link text", url) ?? url;
      document.execCommand(
        "insertHTML",
        false,
        `<a href="${url.replace(/"/g, "&quot;")}">${label.replace(/</g, "&lt;")}</a>`,
      );
    }
    emitChange();
  }

  async function insertImage(file: File) {
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file, token);
      editorRef.current?.focus();
      document.execCommand(
        "insertHTML",
        false,
        `<img src="${url.replace(/"/g, "&quot;")}" alt="" />`,
      );
      emitChange();
    } catch {
      setError("Couldn't upload that image. Try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-cream-muted">
        Full description
      </span>
      <div className="border border-gold-500/20 bg-noir-950">
        <div className="flex flex-wrap items-center gap-1 border-b border-gold-500/15 p-1.5">
          {INLINE_BUTTONS.map(({ label, icon: Icon, command }) => (
            <button
              key={command}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={active[command] ?? false}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => run(command)}
              className={`flex h-8 w-8 cursor-pointer items-center justify-center transition-colors ${
                active[command]
                  ? "bg-gold-500/15 text-gold-300"
                  : "text-cream-muted hover:bg-gold-500/10 hover:text-cream"
              }`}
            >
              <Icon size={15} aria-hidden />
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-gold-500/15" aria-hidden />
          {BLOCK_BUTTONS.map(({ label, icon: Icon, command, value: v }) => (
            <button
              key={label}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={active[command] ?? false}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => run(command, v)}
              className={`flex h-8 w-8 cursor-pointer items-center justify-center transition-colors ${
                active[command]
                  ? "bg-gold-500/15 text-gold-300"
                  : "text-cream-muted hover:bg-gold-500/10 hover:text-cream"
              }`}
            >
              <Icon size={15} aria-hidden />
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-gold-500/15" aria-hidden />
          <button
            type="button"
            title="Link"
            aria-label="Insert link"
            onMouseDown={(e) => e.preventDefault()}
            onClick={insertLink}
            className="flex h-8 w-8 cursor-pointer items-center justify-center text-cream-muted transition-colors hover:bg-gold-500/10 hover:text-cream"
          >
            <LinkIcon size={15} aria-hidden />
          </button>
          <button
            type="button"
            title="Image"
            aria-label="Insert image"
            disabled={uploading}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="flex h-8 w-8 cursor-pointer items-center justify-center text-cream-muted transition-colors hover:bg-gold-500/10 hover:text-cream disabled:cursor-wait disabled:opacity-50"
          >
            <ImageIcon size={15} aria-hidden />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) insertImage(file);
            }}
          />
          <span className="mx-1 h-5 w-px bg-gold-500/15" aria-hidden />
          <button
            type="button"
            title="Undo"
            aria-label="Undo"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run("undo")}
            className="flex h-8 w-8 cursor-pointer items-center justify-center text-cream-muted transition-colors hover:bg-gold-500/10 hover:text-cream"
          >
            <Undo2 size={15} aria-hidden />
          </button>
          <button
            type="button"
            title="Redo"
            aria-label="Redo"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run("redo")}
            className="flex h-8 w-8 cursor-pointer items-center justify-center text-cream-muted transition-colors hover:bg-gold-500/10 hover:text-cream"
          >
            <Redo2 size={15} aria-hidden />
          </button>
        </div>

        <div className="relative">
          {empty && (
            <p className="pointer-events-none absolute left-4 top-3 text-sm text-cream-faint">
              {placeholder}
            </p>
          )}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={emitChange}
            onKeyUp={refreshActiveState}
            onMouseUp={refreshActiveState}
            className="rich-text min-h-40 max-w-none px-4 py-3 text-sm text-cream focus:outline-none"
          />
        </div>
      </div>
      {error && <p className="mt-2 text-[12px] text-red-400">{error}</p>}
    </div>
  );
}
