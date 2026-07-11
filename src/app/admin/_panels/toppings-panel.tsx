"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { FormError } from "@/components/auth/fields";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { api, type PagedResult, type Topping } from "@/lib/api";

const PAGE_SIZE = 10;

export function ToppingsPanel({ token }: { token: string | null }) {
  const router = useRouter();
  const [result, setResult] = useState<PagedResult<Topping> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (debouncedSearch) params.set("search", debouncedSearch);
    api<PagedResult<Topping>>(`/api/toppings/search?${params}`)
      .then(setResult)
      .catch((err) => setError(errorText(err)));
  }, [page, debouncedSearch]);
  useEffect(load, [load]);

  useEffect(() => setPage(1), [debouncedSearch]);

  async function remove(t: Topping) {
    if (!window.confirm(`Delete "${t.name}"?`)) return;
    try {
      await api(`/api/toppings/${t.id}`, { method: "DELETE", token });
      load();
    } catch (err) {
      setError(errorText(err));
    }
  }

  return (
    <section>
      <PanelHeading
        title="Toppings"
        description="Extra add-ons customers can pick for drinks, priced on top of the base cup."
        action={
          <PrimaryButton onClick={() => router.push("/admin/toppings/new")}>
            New topping
          </PrimaryButton>
        }
      />
      <FormError message={error} />

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
                        <RowButton onClick={() => router.push(`/admin/toppings/${t.id}`)}>
                          Edit
                        </RowButton>
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
