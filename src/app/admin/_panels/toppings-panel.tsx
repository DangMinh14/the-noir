"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EmptyState,
  PanelHeading,
  PrimaryButton,
  RowButton,
  SearchField,
  errorText,
  tdClass,
  thClass,
} from "@/components/admin/table-bits";
import { Pagination } from "@/components/admin/pagination";
import { FormError, SubmitButton, TextField } from "@/components/auth/fields";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { api, type PagedResult, type Topping } from "@/lib/api";

const PAGE_SIZE = 10;

export function ToppingsPanel({ token }: { token: string | null }) {
  const [result, setResult] = useState<PagedResult<Topping> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [editing, setEditing] = useState<Topping | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (debouncedSearch) params.set("search", debouncedSearch);
    api<PagedResult<Topping>>(`/api/toppings/search?${params}`)
      .then(setResult)
      .catch((err) => setError(errorText(err)));
  }, [page, debouncedSearch]);
  useEffect(load, [load]);

  useEffect(() => setPage(1), [debouncedSearch]);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = {
      name: String(f.get("name")),
      priceVnd: Number(f.get("priceVnd")),
    };
    setBusy(true);
    setError(null);
    try {
      if (editing === "new") {
        await api("/api/toppings", { method: "POST", token, body });
      } else if (editing) {
        await api(`/api/toppings/${editing.id}`, { method: "PUT", token, body });
      }
      setEditing(null);
      load();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(t: Topping) {
    if (!window.confirm(`Delete "${t.name}"?`)) return;
    try {
      await api(`/api/toppings/${t.id}`, { method: "DELETE", token });
      load();
    } catch (err) {
      setError(errorText(err));
    }
  }

  const current = editing !== "new" ? editing : null;

  return (
    <section>
      <PanelHeading
        title="Toppings"
        description="Extra add-ons customers can pick for drinks, priced on top of the base cup."
        action={
          <PrimaryButton onClick={() => setEditing("new")}>
            New topping
          </PrimaryButton>
        }
      />
      <FormError message={error} />

      {editing && (
        <form
          onSubmit={save}
          className="mb-8 mt-4 grid grid-cols-1 gap-5 border border-gold-500/15 bg-noir-900/60 p-6 sm:grid-cols-2"
        >
          <TextField label="Name" name="name" defaultValue={current?.name} required maxLength={100} />
          <TextField
            label="Price (₫)"
            name="priceVnd"
            type="number"
            min={0}
            defaultValue={current?.priceVnd ?? 10000}
            required
          />
          <div className="flex items-center gap-4 sm:col-span-2">
            <SubmitButton busy={busy}>
              {editing === "new" ? "Create topping" : "Save changes"}
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
        <SearchField value={search} onChange={setSearch} placeholder="Search toppings" />
      </div>

      {result === null ? (
        <EmptyState message="Loading..." />
      ) : result.items.length === 0 ? (
        <EmptyState
          message={search ? "No toppings match your search." : "No toppings yet. Add the first one above."}
        />
      ) : (
        <>
          <div className="overflow-x-auto border border-gold-500/10">
            <table className="w-full min-w-100">
              <thead className="border-b border-gold-500/10 bg-noir-900/60">
                <tr>
                  <th className={thClass}>Name</th>
                  <th className={thClass}>Price</th>
                  <th className={thClass}></th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((t) => (
                  <tr key={t.id} className="border-b border-gold-500/5 last:border-0">
                    <td className={`${tdClass} text-cream`}>{t.name}</td>
                    <td className={`${tdClass} tabular-nums`}>{t.priceVnd.toLocaleString("vi-VN")}₫</td>
                    <td className={`${tdClass} text-right whitespace-nowrap`}>
                      <span className="inline-flex gap-4">
                        <RowButton onClick={() => setEditing(t)}>Edit</RowButton>
                        <RowButton danger onClick={() => remove(t)}>
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
