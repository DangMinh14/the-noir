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
import { FormError, SubmitButton, TextField } from "@/components/auth/fields";
import { api, type Category } from "@/lib/api";

export function CategoriesPanel({ token }: { token: string | null }) {
  const [items, setItems] = useState<Category[] | null>(null);
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api<Category[]>("/api/categories")
      .then(setItems)
      .catch((err) => setError(errorText(err)));
  }, []);
  useEffect(load, [load]);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = { name: String(new FormData(e.currentTarget).get("name")) };
    setBusy(true);
    setError(null);
    try {
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
          <PrimaryButton onClick={() => setEditing("new")}>
            New category
          </PrimaryButton>
        }
      />
      <FormError message={error} />

      {editing && (
        <form
          onSubmit={save}
          className="mb-8 mt-4 flex flex-wrap items-end gap-5 border border-gold-500/15 bg-noir-900/60 p-6"
        >
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
        </form>
      )}

      {items === null ? (
        <EmptyState message="Loading..." />
      ) : items.length === 0 ? (
        <EmptyState message="No categories yet. Create the first one above." />
      ) : (
        <div className="overflow-x-auto border border-gold-500/10">
          <table className="w-full min-w-125">
            <thead className="border-b border-gold-500/10 bg-noir-900/60">
              <tr>
                <th className={thClass}>Name</th>
                <th className={thClass}>Products</th>
                <th className={thClass}>Created</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b border-gold-500/5 last:border-0">
                  <td className={`${tdClass} text-cream`}>{c.name}</td>
                  <td className={tdClass}>{c.productCount}</td>
                  <td className={tdClass}>{formatDate(c.createdAt)}</td>
                  <td className={`${tdClass} text-right whitespace-nowrap`}>
                    <span className="inline-flex gap-4">
                      <RowButton onClick={() => setEditing(c)}>Edit</RowButton>
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
      )}
    </section>
  );
}
