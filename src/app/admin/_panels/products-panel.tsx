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
  type PagedResult,
  type Product,
} from "@/lib/api";

const PAGE_SIZE = 10;

export function ProductsPanel({ token }: { token: string | null }) {
  const router = useRouter();
  const [result, setResult] = useState<PagedResult<Product> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (debouncedSearch) params.set("search", debouncedSearch);
    api<PagedResult<Product>>(`/api/products/search?${params}`)
      .then(setResult)
      .catch((err) => setError(errorText(err)));
  }, [page, debouncedSearch]);
  useEffect(load, [load]);

  // A new search should always land back on page 1.
  useEffect(() => setPage(1), [debouncedSearch]);

  async function remove(p: Product) {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await api(`/api/products/${p.id}`, { method: "DELETE", token });
      load();
    } catch (err) {
      setError(errorText(err));
    }
  }

  return (
    <section>
      <PanelHeading
        title="Products"
        description="What's on the menu. Reads are public; changes need an admin session."
        action={
          <PrimaryButton onClick={() => router.push("/admin/products/new")}>
            New product
          </PrimaryButton>
        }
      />
      <FormError message={error} />

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
                        <RowButton onClick={() => router.push(`/admin/products/${p.id}`)}>
                          Edit
                        </RowButton>
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
