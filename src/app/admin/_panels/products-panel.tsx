"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EmptyState,
  PanelHeading,
  PrimaryButton,
  RowButton,
  SearchField,
  errorText,
  formatDate,
  tdClass,
  thClass,
} from "@/components/admin/table-bits";
import { Pagination } from "@/components/admin/pagination";
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
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { sanitizeDescriptionHtml } from "@/lib/sanitize-html";
import {
  api,
  resolveImageUrl,
  uploadImage,
  FALLBACK_PRODUCT_IMAGE,
  type Category,
  type PagedResult,
  type Product,
} from "@/lib/api";

const PAGE_SIZE = 10;

export function ProductsPanel({ token }: { token: string | null }) {
  const [result, setResult] = useState<PagedResult<Product> | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [imageSelection, setImageSelection] = useState<ImageSelection>({
    kind: "unchanged",
  });
  const [nameDraft, setNameDraft] = useState("");
  const [descriptionHtmlDraft, setDescriptionHtmlDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (debouncedSearch) params.set("search", debouncedSearch);
    Promise.all([
      api<PagedResult<Product>>(`/api/products/search?${params}`),
      api<Category[]>("/api/categories"),
    ])
      .then(([products, cats]) => {
        setResult(products);
        setCategories(cats);
      })
      .catch((err) => setError(errorText(err)));
  }, [page, debouncedSearch]);
  useEffect(load, [load]);

  // A new search should always land back on page 1.
  useEffect(() => setPage(1), [debouncedSearch]);

  function openForm(product: Product | "new") {
    setEditing(product);
    setImageSelection({ kind: "unchanged" });
    setNameDraft(product === "new" ? "" : product.name);
    setDescriptionHtmlDraft(product === "new" ? "" : product.descriptionHtml);
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
        imageUrl = await uploadImage(imageSelection.file, token);
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
        descriptionHtml: sanitizeDescriptionHtml(descriptionHtmlDraft),
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
            label="Product photo"
            fallbackImage={FALLBACK_PRODUCT_IMAGE}
            helperText="No photo yet? Leave this empty and a stock tea photo is used until you upload one."
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

      <div className="mb-4">
        <SearchField value={search} onChange={setSearch} placeholder="Search products" />
      </div>

      {result === null ? (
        <EmptyState message="Loading..." />
      ) : result.items.length === 0 ? (
        <EmptyState
          message={search ? "No products match your search." : "No products yet. Create the first one above."}
        />
      ) : (
        <>
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
                {result.items.map((p) => (
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
          <Pagination
            page={result.page}
            pageSize={result.pageSize}
            totalCount={result.totalCount}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}
