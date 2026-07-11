"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BackLink, EmptyState, errorText } from "@/components/admin/table-bits";
import {
  ImageUploadField,
  type ImageSelection,
} from "@/components/admin/image-upload-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import {
  FormError,
  SelectField,
  SubmitButton,
  TextField,
} from "@/components/auth/fields";
import { sanitizeDescriptionHtml } from "@/lib/sanitize-html";
import { useAuth } from "@/lib/auth-context";
import {
  api,
  uploadImage,
  FALLBACK_PRODUCT_IMAGE,
  type Category,
  type Product,
} from "@/lib/api";

const LIST_HREF = "/admin?tab=products";

export default function ProductEditPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const isNew = id === "new";

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [imageSelection, setImageSelection] = useState<ImageSelection>({
    kind: "unchanged",
  });
  const [nameDraft, setNameDraft] = useState("");
  const [descriptionHtmlDraft, setDescriptionHtmlDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    setReady(false);
    setLoadError(null);
    try {
      const cats = await api<Category[]>("/api/categories");
      if (isNew) {
        setCategories(cats);
        setReady(true);
        return;
      }
      const p = await api<Product>(`/api/products/${id}`);
      setProduct(p);
      setCategories(cats);
      setNameDraft(p.name);
      setDescriptionHtmlDraft(p.descriptionHtml);
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
        imageUrl = ""; // blank -> backend applies the stock-photo fallback
      } else {
        imageUrl = product ? product.imageUrl : "";
      }

      const body = {
        name: String(f.get("name")),
        description: String(f.get("description")),
        descriptionHtml: sanitizeDescriptionHtml(descriptionHtmlDraft),
        priceVnd: Number(f.get("priceVnd")),
        categoryId: Number(f.get("categoryId")),
        imageUrl,
        imageAlt: String(f.get("imageAlt")).trim(),
      };

      if (isNew) {
        await api("/api/products", { method: "POST", token, body });
      } else {
        await api(`/api/products/${id}`, { method: "PUT", token, body });
      }
      router.push(LIST_HREF);
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  }

  return (
    <section className="max-w-3xl">
      <BackLink href={LIST_HREF}>Back to products</BackLink>

      <h2 className="mb-6 font-serif text-2xl text-cream">
        {isNew ? "New product" : "Edit product"}
      </h2>

      {loadError ? (
        <EmptyState message={loadError} />
      ) : !ready || !categories ? (
        <EmptyState message="Loading..." />
      ) : (
        <form
          onSubmit={save}
          className="flex flex-col gap-5 border border-gold-500/15 bg-noir-900/60 p-6"
        >
          <ImageUploadField
            currentImageUrl={product?.imageUrl}
            onChange={setImageSelection}
            label="Product photo"
            fallbackImage={FALLBACK_PRODUCT_IMAGE}
            helperText="No photo yet? Leave this empty and a stock tea photo is used until you upload one."
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <TextField
              label="Name"
              name="name"
              defaultValue={product?.name}
              onChange={(e) => setNameDraft(e.target.value)}
              required
              maxLength={100}
            />
            <SelectField
              label="Category"
              name="categoryId"
              defaultValue={product?.categoryId}
              required
            >
              {categories.length === 0 && <option value="">No categories yet</option>}
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectField>
            <div className="sm:col-span-2">
              <TextField
                label="Description"
                name="description"
                defaultValue={product?.description}
                required
                maxLength={500}
                helperText="Short teaser shown on menu cards and search. Keep it to one line."
              />
            </div>
            <div className="sm:col-span-2">
              <RichTextEditor
                value={descriptionHtmlDraft}
                onChange={setDescriptionHtmlDraft}
                token={token}
              />
            </div>
            <TextField
              label="Price (VND)"
              name="priceVnd"
              type="number"
              min={0}
              defaultValue={product?.priceVnd ?? 0}
              required
            />
            <TextField
              label="Image alt text"
              name="imageAlt"
              defaultValue={product?.imageAlt}
              placeholder={nameDraft || "Defaults to the product name"}
              maxLength={200}
              helperText="Optional. Leave blank to use the product name; edit later for something more descriptive."
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="w-48">
              <SubmitButton busy={busy}>
                {isNew ? "Create product" : "Save changes"}
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
