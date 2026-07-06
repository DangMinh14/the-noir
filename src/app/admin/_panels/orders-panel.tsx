"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EmptyState,
  PanelHeading,
  SearchField,
  errorText,
  formatDate,
  tdClass,
  thClass,
} from "@/components/admin/table-bits";
import { Pagination } from "@/components/admin/pagination";
import { FormError } from "@/components/auth/fields";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { api, type Order, type OrderStatus, type PagedResult } from "@/lib/api";

const STATUSES: OrderStatus[] = ["Pending", "Preparing", "Ready", "Completed", "Cancelled"];
const PAGE_SIZE = 10;

export function OrdersPanel({ token }: { token: string | null }) {
  const [result, setResult] = useState<PagedResult<Order> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (debouncedSearch) params.set("search", debouncedSearch);
    api<PagedResult<Order>>(`/api/orders?${params}`, { token })
      .then(setResult)
      .catch((err) => setError(errorText(err)));
  }, [page, debouncedSearch, token]);
  useEffect(load, [load]);

  useEffect(() => setPage(1), [debouncedSearch]);

  async function changeStatus(order: Order, status: string) {
    setError(null);
    try {
      await api(`/api/orders/${order.id}/status`, { method: "PUT", token, body: { status } });
      load();
    } catch (err) {
      setError(errorText(err));
    }
  }

  return (
    <section>
      <PanelHeading
        title="Orders"
        description="Every order placed, newest first. Advance status as it moves through the kitchen."
      />
      <FormError message={error} />

      <div className="mb-4">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search by order #, maison or status"
        />
      </div>

      {result === null ? (
        <EmptyState message="Loading..." />
      ) : result.items.length === 0 ? (
        <EmptyState message={search ? "No orders match your search." : "No orders yet."} />
      ) : (
        <>
          <div className="overflow-x-auto border border-gold-500/10">
            <table className="w-full min-w-150">
              <thead className="border-b border-gold-500/10 bg-noir-900/60">
                <tr>
                  <th className={thClass}>Order</th>
                  <th className={thClass}>Maison</th>
                  <th className={thClass}>Items</th>
                  <th className={thClass}>Total</th>
                  <th className={thClass}>Placed</th>
                  <th className={thClass}>Status</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((order) => (
                  <tr key={order.id} className="border-b border-gold-500/5 last:border-0">
                    <td className={`${tdClass} text-cream`}>#{order.id}</td>
                    <td className={tdClass}>{order.cityName}</td>
                    <td className={tdClass}>
                      {order.items.reduce((sum, i) => sum + i.quantity, 0)} pcs
                    </td>
                    <td className={`${tdClass} tabular-nums`}>
                      {order.totalVnd.toLocaleString("vi-VN")}₫
                    </td>
                    <td className={tdClass}>{formatDate(order.createdAt)}</td>
                    <td className={tdClass}>
                      <select
                        value={order.status}
                        onChange={(e) => changeStatus(order, e.target.value)}
                        className="cursor-pointer border border-gold-500/20 bg-noir-950 px-3 py-1.5 text-sm text-cream"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
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
