"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EmptyState,
  PanelHeading,
  errorText,
  formatDate,
  tdClass,
  thClass,
} from "@/components/admin/table-bits";
import { FormError } from "@/components/auth/fields";
import { api, type Order, type OrderStatus } from "@/lib/api";

const STATUSES: OrderStatus[] = ["Pending", "Preparing", "Ready", "Completed", "Cancelled"];

export function OrdersPanel({ token }: { token: string | null }) {
  const [items, setItems] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api<Order[]>("/api/orders", { token })
      .then(setItems)
      .catch((err) => setError(errorText(err)));
  }, [token]);
  useEffect(load, [load]);

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

      {items === null ? (
        <EmptyState message="Loading..." />
      ) : items.length === 0 ? (
        <EmptyState message="No orders yet." />
      ) : (
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
              {items.map((order) => (
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
      )}
    </section>
  );
}
