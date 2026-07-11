import type { Order } from "./api";

export type OrderMilestone = { label: string; iso: string };

// The single most relevant timestamp for a compact row, e.g. in an order
// list where there's no room for the full Placed/Started/Ready/... timeline.
export function latestOrderMilestone(
  order: Pick<Order, "status" | "preparingAt" | "readyAt" | "completedAt" | "cancelledAt">,
): OrderMilestone | null {
  if (order.status === "Cancelled" && order.cancelledAt) {
    return { label: "Cancelled", iso: order.cancelledAt };
  }
  if (order.completedAt) return { label: "Completed", iso: order.completedAt };
  if (order.readyAt) return { label: "Ready", iso: order.readyAt };
  if (order.preparingAt) return { label: "Started", iso: order.preparingAt };
  return null;
}
