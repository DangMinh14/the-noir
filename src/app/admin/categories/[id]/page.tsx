"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BackLink, EmptyState, errorText } from "@/components/admin/table-bits";
import {
  ImageUploadField,
  type ImageSelection,
} from "@/components/admin/image-upload-field";
import { FormError, SubmitButton, TextField } from "@/components/auth/fields";
import { useAuth } from "@/lib/auth-context";
import {
  api,
  uploadImage,
  FALLBACK_CATEGORY_IMAGE,
  type Category,
} from "@/lib/api";

const LIST_HREF = "/admin?tab=categories";

export default function CategoryEditPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const isNew = id === "new";

  const [category, setCategory] = useState<Category | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [imageSelection, setImageSelection] = useState<ImageSelection>({
    kind: "unchanged",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    setReady(false);
    setLoadError(null);
    try {
      if (isNew) {
        setReady(true);
        return;
      }
      const c = await api<Category>(`/api/categories/${id}`);
      setCategory(c);
      setReady(true);
    } catch (err) {
      setLoadError(errorText(err));
    }
  }, [id, isNew]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);

    setBusy(true);
    setError(null);
    try {
      let imageUrl: string;
      if (imageSelection.kind === "file") {
        imageUrl = await uploadImage(imageSelection.file, token);
      } else if (imageSelection.kind === "url") {
        imageUrl = imageSelection.url;
      } else if (imageSelection.kind === "none") {
        imageUrl = ""; // blank -> frontend falls back to the stock photo
      } else {
        imageUrl = category ? category.imageUrl : "";
      }

      const body = {
        name: String(f.get("name")),
        imageUrl,
        allowsToppings: f.get("allowsToppings") === "on",
      };

      if (isNew) {
        await api("/api/categories", { method: "POST", token, body });
      } else {
        await api(`/api/categories/${id}`, { method: "PUT", token, body });
      }
      router.push(LIST_HREF);
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  }

  return (
    <section className="max-w-2xl">
      <BackLink href={LIST_HREF}>Back to categories</BackLink>

      <h2 className="mb-6 font-serif text-2xl text-cream">
        {isNew ? "New category" : "Edit category"}
      </h2>

      {loadError ? (
        <EmptyState message={loadError} />
      ) : !ready ? (
        <EmptyState message="Loading..." />
      ) : (
        <form
          onSubmit={save}
          className="flex flex-col gap-5 border border-gold-500/15 bg-noir-900/60 p-6"
        >
          <ImageUploadField
            currentImageUrl={category?.imageUrl}
            onChange={setImageSelection}
            label="Category photo"
            fallbackImage={FALLBACK_CATEGORY_IMAGE}
            helperText="No photo yet? Leave this empty and a stock photo is used until you upload one."
          />

          <TextField
            label="Name"
            name="name"
            defaultValue={category?.name}
            placeholder="e.g. Milk Tea"
            required
            maxLength={50}
          />

          <label className="flex items-center gap-2.5 text-sm text-cream-muted">
            <input
              type="checkbox"
              name="allowsToppings"
              defaultChecked={category?.allowsToppings ?? true}
              className="h-4 w-4 accent-gold-500"
            />
            Allows toppings
          </label>

          <div className="flex items-center gap-4">
            <div className="w-48">
              <SubmitButton busy={busy}>
                {isNew ? "Create category" : "Save changes"}
              </SubmitButton>
            </div>
            <button
              type="button"
              onClick={() => router.push(LIST_HREF)}
              className="cursor-pointer px-4 text-[12px] uppercase tracking-[0.2em] text-cream-faint hover:text-cream"
            >
              Cancel
            </button>
          </div>

          <FormError message={error} />
        </form>
      )}
    </section>
  );
}
