"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EmptyState,
  PanelHeading,
  PrimaryButton,
  RowButton,
  errorText,
  formatDate,
  tdClass,
  thClass,
} from "@/components/admin/table-bits";
import {
  ImageUploadField,
  type ImageSelection,
} from "@/components/admin/image-upload-field";
import {
  FormError,
  SelectField,
  SubmitButton,
  TextField,
} from "@/components/auth/fields";
import {
  api,
  resolveImageUrl,
  uploadProductImage,
  type Category,
  type Product,
} from "@/lib/api";

export function ProductsPanel({ token }: { token: string | null }) {
  const [items, setItems] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [imageSelection, setImageSelection] = useState<ImageSelection>({
    kind: "unchanged",
  });
  const [nameDraft, setNameDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    Promise.all([api<Product[]>("/api/products"), api<Category[]>("/api/categories")])
      .then(([products, cats]) => {
        setItems(products);
        setCategories(cats);
      })
      .catch((err) => setError(errorText(err)));
  }, []);
  useEffect(load, [load]);

  function openForm(product: Product | "new") {
    setEditing(product);
    setImageSelection({ kind: "unchanged" });
    setNameDraft(product === "new" ? "" : product.name);
    setError(null);
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name"));
    const imageAlt = String(f.get("imageAlt")).trim();

    setBusy(true);
    setError(null);
    try {
      let imageUrl: string;
      if (imageSelection.kind === "file") {
        imageUrl = await uploadProductImage(imageSelection.file, token);
      } else if (imageSelection.kind === "url") {
        imageUrl = imageSelection.url;
      } else if (imageSelection.kind === "none") {
        imageUrl = ""; // blank -> backend applies the stock-photo fallback
      } else {
        // "unchanged": editing an existing product without touching the
        // picker keeps its current photo; creating new falls back to stock.
        imageUrl = editing && editing !== "new" ? editing.imageUrl : "";
      }

      const body = {
        name,
        description: String(f.get("description")),
        priceVnd: Number(f.get("priceVnd")),
        categoryId: Number(f.get("categoryId")),
        imageUrl,
        imageAlt,
      };

      if (editing === "new") {
        await api("/api/products", { method: "POST", token, body });
      } else if (editing) {
        await api(`/api/products/${editing.id}`, { method: "PUT", token, body });
      }
      setEditing(null);
      load();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(p: Product) {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await api(`/api/products/${p.id}`, { method: "DELETE", token });
      load();
    } catch (err) {
      setError(errorText(err));
    }
  }

  const current = editing !== "new" ? editing : null;

  return (
    <section>
      <PanelHeading
        title="Products"
        description="What's on the menu. Reads are public; changes need an admin session."
        action={
          <PrimaryButton onClick={() => openForm("new")}>
            New product
          </PrimaryButton>
        }
      />
      <FormError message={error} />

      {editing && categories && (
        <form
          onSubmit={save}
          className="mb-8 mt-4 flex flex-col gap-5 border border-gold-500/15 bg-noir-900/60 p-6"
        >
          <ImageUploadField
            currentImageUrl={current?.imageUrl}
            onChange={setImageSelection}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <TextField
              label="Name"
              name="name"
              defaultValue={current?.name}
              onChange={(e) => setNameDraft(e.target.value)}
              required
              maxLength={100}
            />
            <SelectField
              label="Category"
              name="categoryId"
              defaultValue={current?.categoryId}
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
                defaultValue={current?.description}
                required
                maxLength={500}
              />
            </div>
            <TextField
              label="Price (VND)"
              name="priceVnd"
              type="number"
              min={0}
              defaultValue={current?.priceVnd ?? 0}
              required
            />
            <TextField
              label="Image alt text"
              name="imageAlt"
              defaultValue={current?.imageAlt}
              placeholder={nameDraft || "Defaults to the product name"}
              maxLength={200}
              helperText="Optional. Leave blank to use the product name; edit later for something more descriptive."
            />
          </div>

          <div className="flex items-center gap-4">
            <SubmitButton busy={busy}>
              {editing === "new" ? "Create product" : "Save changes"}
            </SubmitButton>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="cursor-pointer px-4 text-[12px] uppercase tracking-[0.2em] text-cream-faint hover:text-cream"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {items === null ? (
        <EmptyState message="Loading..." />
      ) : items.length === 0 ? (
        <EmptyState message="No products yet. Create the first one above." />
      ) : (
        <div className="overflow-x-auto border border-gold-500/10">
          <table className="w-full min-w-150">
            <thead className="border-b border-gold-500/10 bg-noir-900/60">
              <tr>
                <th className={thClass}></th>
                <th className={thClass}>Name</th>
                <th className={thClass}>Category</th>
                <th className={thClass}>Price</th>
                <th className={thClass}>Updated</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-gold-500/5 last:border-0">
                  <td className="py-2 pl-4">
                    {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail from user uploads or Unsplash, not a static asset */}
                    <img
                      src={resolveImageUrl(p.imageUrl)}
                      alt=""
                      className="h-10 w-10 object-cover"
                    />
                  </td>
                  <td className={`${tdClass} text-cream`}>{p.name}</td>
                  <td className={tdClass}>{p.categoryName}</td>
                  <td className={`${tdClass} tabular-nums`}>
                    {p.priceVnd.toLocaleString("vi-VN")}₫
                  </td>
                  <td className={tdClass}>{formatDate(p.updatedAt)}</td>
                  <td className={`${tdClass} text-right whitespace-nowrap`}>
                    <span className="inline-flex gap-4">
                      <RowButton onClick={() => openForm(p)}>Edit</RowButton>
                      <RowButton danger onClick={() => remove(p)}>
                        Delete
                      </RowButton>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
