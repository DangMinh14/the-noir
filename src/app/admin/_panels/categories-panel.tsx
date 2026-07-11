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
  formatDate,
  tdClass,
  thClass,
} from "@/components/admin/table-bits";
import { Pagination } from "@/components/admin/pagination";
import { FormError } from "@/components/auth/fields";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import {
  api,
  resolveImageUrl,
  FALLBACK_CATEGORY_IMAGE,
  type Category,
  type PagedResult,
} from "@/lib/api";

const PAGE_SIZE = 10;

export function CategoriesPanel({ token }: { token: string | null }) {
  const router = useRouter();
  const [result, setResult] = useState<PagedResult<Category> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (debouncedSearch) params.set("search", debouncedSearch);
    api<PagedResult<Category>>(`/api/categories/search?${params}`)
      .then(setResult)
      .catch((err) => setError(errorText(err)));
  }, [page, debouncedSearch]);
  useEffect(load, [load]);

  useEffect(() => setPage(1), [debouncedSearch]);

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

  return (
    <section>
      <PanelHeading
        title="Categories"
        description="Group products on the menu. A category with products can't be deleted until they're moved."
        action={
          <PrimaryButton onClick={() => router.push("/admin/categories/new")}>
            New category
          </PrimaryButton>
        }
      />
      <FormError message={error} />

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
                        <RowButton onClick={() => router.push(`/admin/categories/${c.id}`)}>
                          Edit
                        </RowButton>
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
