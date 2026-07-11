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
import { FormError, SubmitButton, TextField } from "@/components/auth/fields";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import {
  api,
  resolveImageUrl,
  uploadImage,
  FALLBACK_CATEGORY_IMAGE,
  type Category,
  type PagedResult,
} from "@/lib/api";

const PAGE_SIZE = 10;

export function CategoriesPanel({ token }: { token: string | null }) {
  const [result, setResult] = useState<PagedResult<Category> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [imageSelection, setImageSelection] = useState<ImageSelection>({
    kind: "unchanged",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (debouncedSearch) params.set("search", debouncedSearch);
    api<PagedResult<Category>>(`/api/categories/search?${params}`)
      .then(setResult)
      .catch((err) => setError(errorText(err)));
  }, [page, debouncedSearch]);
  useEffect(load, [load]);

  useEffect(() => setPage(1), [debouncedSearch]);

  function openForm(category: Category | "new") {
    setEditing(category);
    setImageSelection({ kind: "unchanged" });
    setError(null);
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name"));
    const allowsToppings = form.get("allowsToppings") === "on";

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
        imageUrl = editing && editing !== "new" ? editing.imageUrl : "";
      }

      const body = { name, imageUrl, allowsToppings };

      if (editing === "new") {
        await api("/api/categories", { method: "POST", token, body });
      } else if (editing) {
        await api(`/api/categories/${editing.id}`, { method: "PUT", token, body });
      }
      setEditing(null);
      load();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(c: Category) {
    if (!window.confirm(`Delete "${c.name}"?`)) return;
    setError(null);
    try {
      await api(`/api/categories/${c.id}`, { method: "DELETE", token });
      load();
    } catch (err) {
      setError(errorText(err));
    }
  }

  const current = editing !== "new" ? editing : null;

  return (
    <section>
      <PanelHeading
        title="Categories"
        description="Group products on the menu. A category with products can't be deleted until they're moved."
        action={
          <PrimaryButton onClick={() => openForm("new")}>
            New category
          </PrimaryButton>
        }
      />
      <FormError message={error} />

      {editing && (
        <form
          onSubmit={save}
          className="mb-8 mt-4 flex flex-col gap-5 border border-gold-500/15 bg-noir-900/60 p-6"
        >
          <ImageUploadField
            currentImageUrl={current?.imageUrl}
            onChange={setImageSelection}
            label="Category photo"
            fallbackImage={FALLBACK_CATEGORY_IMAGE}
            helperText="No photo yet? Leave this empty and a stock photo is used until you upload one."
          />
          <div className="flex flex-wrap items-end gap-5">
            <div className="min-w-48 flex-1">
              <TextField
                label="Name"
                name="name"
                defaultValue={current?.name}
                placeholder="e.g. Milk Tea"
                required
                maxLength={50}
              />
            </div>
            <label className="flex items-center gap-2.5 pb-3 text-sm text-cream-muted">
              <input
                type="checkbox"
                name="allowsToppings"
                defaultChecked={current?.allowsToppings ?? true}
                className="h-4 w-4 accent-gold-500"
              />
              Allows toppings
            </label>
            <SubmitButton busy={busy}>
              {editing === "new" ? "Create category" : "Save changes"}
            </SubmitButton>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="cursor-pointer px-2 py-3 text-[12px] uppercase tracking-[0.2em] text-cream-faint hover:text-cream"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mb-4">
        <SearchField value={search} onChange={setSearch} placeholder="Search categories" />
      </div>

      {result === null ? (
        <EmptyState message="Loading..." />
      ) : result.items.length === 0 ? (
        <EmptyState
          message={search ? "No categories match your search." : "No categories yet. Create the first one above."}
        />
      ) : (
        <>
          <div className="overflow-x-auto border border-gold-500/10">
            <table className="w-full min-w-125">
              <thead className="border-b border-gold-500/10 bg-noir-900/60">
                <tr>
                  <th className={thClass}></th>
                  <th className={thClass}>Name</th>
                  <th className={thClass}>Products</th>
                  <th className={thClass}>Created</th>
                  <th className={thClass}></th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((c) => (
                  <tr key={c.id} className="border-b border-gold-500/5 last:border-0">
                    <td className="py-2 pl-4">
                      {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail from user uploads, not a static asset */}
                      <img
                        src={resolveImageUrl(c.imageUrl, FALLBACK_CATEGORY_IMAGE)}
                        alt=""
                        className="h-10 w-10 object-cover"
                      />
                    </td>
                    <td className={`${tdClass} text-cream`}>{c.name}</td>
                    <td className={tdClass}>{c.productCount}</td>
                    <td className={tdClass}>{formatDate(c.createdAt)}</td>
                    <td className={`${tdClass} text-right whitespace-nowrap`}>
                      <span className="inline-flex gap-4">
                        <RowButton onClick={() => openForm(c)}>Edit</RowButton>
                        <RowButton
                          danger
                          disabled={c.productCount > 0}
                          onClick={() => remove(c)}
                        >
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
