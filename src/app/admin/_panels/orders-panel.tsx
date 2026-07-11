"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  EmptyState,
  PanelHeading,
  SearchField,
  errorText,
  formatDateTime,
  tdClass,
  thClass,
} from "@/components/admin/table-bits";
import { Pagination } from "@/components/admin/pagination";
import { FormError } from "@/components/auth/fields";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { optionsSummary } from "@/lib/drink-options";
import { latestOrderMilestone } from "@/lib/order-timeline";
import { api, type Order, type OrderStatus, type PagedResult } from "@/lib/api";

const STATUSES: OrderStatus[] = ["Pending", "Preparing", "Ready", "Completed", "Cancelled"];
const PAGE_SIZE = 10;

export function OrdersPanel({ token }: { token: string | null }) {
  const [result, setResult] = useState<PagedResult<Order> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function toggleExpanded(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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
                  <th className={thClass}></th>
                  <th className={thClass}>Order</th>
                  <th className={thClass}>Customer</th>
                  <th className={thClass}>Maison</th>
                  <th className={thClass}>Items</th>
                  <th className={thClass}>Total</th>
                  <th className={thClass}>Placed</th>
                  <th className={thClass}>Status</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((order) => {
                  const isOpen = expanded.has(order.id);
                  return (
                    <Fragment key={order.id}>
                      <tr className="border-b border-gold-500/5 last:border-0">
                        <td className="py-2 pl-4">
                          <button
                            type="button"
                            onClick={() => toggleExpanded(order.id)}
                            aria-label={isOpen ? `Collapse order #${order.id}` : `Expand order #${order.id}`}
                            aria-expanded={isOpen}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center text-cream-muted hover:text-cream"
                          >
                            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                        </td>
                        <td className={`${tdClass} text-cream`}>#{order.id}</td>
                        <td className={tdClass}>
                          {order.customerName ?? (
                            <span className="text-cream-faint">Guest</span>
                          )}
                        </td>
                        <td className={tdClass}>{order.cityName}</td>
                        <td className={tdClass}>
                          {order.items.reduce((sum, i) => sum + i.quantity, 0)} pcs
                        </td>
                        <td className={`${tdClass} tabular-nums`}>
                          {order.totalVnd.toLocaleString("vi-VN")}₫
                        </td>
                        <td className={tdClass}>
                          <p>{formatDateTime(order.createdAt)}</p>
                          {(() => {
                            const milestone = latestOrderMilestone(order);
                            return (
                              milestone && (
                                <p
                                  className={`text-xs ${
                                    milestone.label === "Cancelled" ? "text-red-300/80" : "text-cream-faint"
                                  }`}
                                >
                                  {milestone.label} {formatDateTime(milestone.iso)}
                                </p>
                              )
                            );
                          })()}
                        </td>
                        <td className={tdClass}>
                          <div className="flex items-center gap-2">
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
                            {order.autoCancelled && (
                              <span className="border border-red-400/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-red-300">
                                Auto
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="border-b border-gold-500/5 bg-noir-900/30 last:border-0">
                          <td colSpan={8} className="px-4 py-4">
                            <ul className="mb-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-cream-faint">
                              <li>Placed {formatDateTime(order.createdAt)}</li>
                              {order.preparingAt && (
                                <li>Started {formatDateTime(order.preparingAt)}</li>
                              )}
                              {order.readyAt && <li>Ready {formatDateTime(order.readyAt)}</li>}
                              {order.completedAt && (
                                <li>Completed {formatDateTime(order.completedAt)}</li>
                              )}
                              {order.cancelledAt && (
                                <li className="text-red-300/80">
                                  Cancelled {formatDateTime(order.cancelledAt)}
                                </li>
                              )}
                            </ul>
                            <ul className="flex flex-col gap-2.5">
                              {order.items.map((item, i) => {
                                const summary = optionsSummary({
                                  size: item.size ?? undefined,
                                  iceOption: item.iceOption ?? undefined,
                                  temperature: item.temperature ?? undefined,
                                  sugarLevel: item.sugarLevel ?? undefined,
                                  toppings: item.toppings,
                                });
                                return (
                                  <li key={i} className="flex flex-col gap-0.5 text-sm">
                                    <span className="text-cream">
                                      {item.productName}{" "}
                                      <span className="text-cream-faint">x{item.quantity}</span>
                                    </span>
                                    {summary && (
                                      <span className="text-xs text-cream-faint">{summary}</span>
                                    )}
                                    {item.note && (
                                      <span className="text-xs italic text-cream-faint">
                                        &ldquo;{item.note}&rdquo;
                                      </span>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
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
