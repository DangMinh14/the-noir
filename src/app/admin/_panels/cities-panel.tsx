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
import { api, type City, type PagedResult } from "@/lib/api";

const PAGE_SIZE = 10;

export function CitiesPanel({ token }: { token: string | null }) {
  const router = useRouter();
  const [result, setResult] = useState<PagedResult<City> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (debouncedSearch) params.set("search", debouncedSearch);
    api<PagedResult<City>>(`/api/cities/search?${params}`)
      .then(setResult)
      .catch((err) => setError(errorText(err)));
  }, [page, debouncedSearch]);
  useEffect(load, [load]);

  useEffect(() => setPage(1), [debouncedSearch]);

  async function remove(c: City) {
    if (!window.confirm(`Delete "${c.name}"?`)) return;
    try {
      await api(`/api/cities/${c.id}`, { method: "DELETE", token });
      load();
    } catch (err) {
      setError(errorText(err));
    }
  }

  return (
    <section>
      <PanelHeading
        title="Cities"
        description="Locations shown in the homepage's Find Us list."
        action={
          <PrimaryButton onClick={() => router.push("/admin/cities/new")}>
            New city
          </PrimaryButton>
        }
      />
      <FormError message={error} />

      <div className="mb-4">
        <SearchField value={search} onChange={setSearch} placeholder="Search cities" />
      </div>

      {result === null ? (
        <EmptyState message="Loading..." />
      ) : result.items.length === 0 ? (
        <EmptyState
          message={search ? "No cities match your search." : "No cities yet. Add the first one above."}
        />
      ) : (
        <>
          <div className="overflow-x-auto border border-gold-500/10">
            <table className="w-full min-w-150">
              <thead className="border-b border-gold-500/10 bg-noir-900/60">
                <tr>
                  <th className={thClass}>Order</th>
                  <th className={thClass}>Name</th>
                  <th className={thClass}>Maisons</th>
                  <th className={thClass}>Kind</th>
                  <th className={thClass}>Address</th>
                  <th className={thClass}></th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((c) => (
                  <tr key={c.id} className="border-b border-gold-500/5 last:border-0">
                    <td className={`${tdClass} tabular-nums`}>{c.sortOrder}</td>
                    <td className={`${tdClass} text-cream`}>{c.name}</td>
                    <td className={tdClass}>{c.maisonCount}</td>
                    <td className={tdClass}>{c.kind}</td>
                    <td className={tdClass}>{c.address}</td>
                    <td className={`${tdClass} text-right whitespace-nowrap`}>
                      <span className="inline-flex gap-4">
                        <RowButton onClick={() => router.push(`/admin/cities/${c.id}`)}>
                          Edit
                        </RowButton>
                        <RowButton danger onClick={() => remove(c)}>
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
