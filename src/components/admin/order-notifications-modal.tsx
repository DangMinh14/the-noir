"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowLeftCircle,
  Bell,
  CheckCircle2,
  ChefHat,
  MessageCircle,
  PackageCheck,
  PackageSearch,
  Send,
  X,
  XCircle,
} from "lucide-react";
import { EASE_LUXE } from "../reveal";
import { FormError } from "../auth/fields";
import { EmptyState, SearchField, errorText, formatDateTime } from "./table-bits";
import { Pagination } from "./pagination";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { optionsSummary } from "@/lib/drink-options";
import { latestOrderMilestone } from "@/lib/order-timeline";
import {
  api,
  type City,
  type Order,
  type OrderMessage,
  type OrderStatus,
  type PagedResult,
  type UnseenOrdersSummary,
} from "@/lib/api";

// Common questions staff ask mid-prep, one tap away instead of typing every
// time. The input still takes free text for anything else.
const QUICK_MESSAGES = [
  "Paper cup or plastic cup?",
  "How much ice would you like?",
  "We're out of this size, is a swap okay?",
  "Running about 10 minutes behind, that okay?",
];

// Poll while the chat panel is open so a customer's reply shows up without
// the staff member having to close and reopen the order.
const MESSAGES_POLL_MS = 8000;

const PAGE_SIZE = 8;
const STATUS_FILTERS: (OrderStatus | "")[] = ["", "Pending", "Preparing", "Ready", "Completed", "Cancelled"];

const STATUS_STEPS: { key: OrderStatus; label: string; Icon: typeof PackageSearch }[] = [
  { key: "Pending", label: "Pending", Icon: PackageSearch },
  { key: "Preparing", label: "Preparing", Icon: ChefHat },
  { key: "Ready", label: "Ready", Icon: PackageCheck },
  { key: "Completed", label: "Completed", Icon: CheckCircle2 },
];

// What the icon itself does while its step is the current one. Completed is
// a one-shot pop (it's terminal, an infinite loop would look unfinished);
// the rest loop for as long as the order sits in that step.
const STEP_ANIMATION: Record<OrderStatus, Record<string, number[]>> = {
  Pending: { scale: [1, 1.1, 1] },
  Preparing: { rotate: [0, -10, 10, -6, 6, 0] },
  Ready: { y: [0, -3, 0] },
  // Spring transitions only support two keyframes; the spring's own
  // overshoot already gives the "pop" without a middle keyframe.
  Completed: { scale: [0.6, 1] },
  Cancelled: {},
};

function nextStatusFor(status: OrderStatus): OrderStatus | null {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  if (idx === -1 || idx === STATUS_STEPS.length - 1) return null;
  return STATUS_STEPS[idx + 1].key;
}

function previousStatusFor(status: OrderStatus): OrderStatus | null {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  if (idx <= 0) return null;
  return STATUS_STEPS[idx - 1].key;
}

function statusTone(status: OrderStatus): string {
  if (status === "Completed") return "border-green-400/40 text-green-300";
  if (status === "Cancelled") return "border-red-400/40 text-red-300";
  return "border-gold-500/30 text-gold-300";
}

function formatRemaining(expiresAtIso: string): string {
  const diffMs = new Date(expiresAtIso).getTime() - Date.now();
  if (diffMs <= 0) return "Expired";
  const hours = Math.floor(diffMs / 3_600_000);
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
  return `Expires in ${hours}h ${minutes}m`;
}

export function OrderNotificationsModal({
  open,
  onClose,
  token,
  summary,
}: {
  open: boolean;
  onClose: () => void;
  token: string | null;
  summary: UnseenOrdersSummary | null;
}) {
  const [result, setResult] = useState<PagedResult<Order> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [autoCancelledOnly, setAutoCancelledOnly] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const hasFilters =
    !!search || !!statusFilter || !!cityFilter || autoCancelledOnly || !!from || !!to;

  function clearFilters() {
    setSearch("");
    setStatusFilter("");
    setCityFilter("");
    setAutoCancelledOnly(false);
    setFrom("");
    setTo("");
  }

  useEffect(() => {
    if (open) api<City[]>("/api/cities").then(setCities).catch(() => setCities([]));
  }, [open]);

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (statusFilter) params.set("status", statusFilter);
    if (cityFilter) params.set("cityId", cityFilter);
    if (autoCancelledOnly) params.set("autoCancelled", "true");
    if (from) params.set("from", new Date(from).toISOString());
    if (to) params.set("to", new Date(to).toISOString());
    api<PagedResult<Order>>(`/api/orders?${params}`, { token })
      .then(setResult)
      .catch((err) => setError(errorText(err)));
  }, [page, debouncedSearch, statusFilter, cityFilter, autoCancelledOnly, from, to, token]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  useEffect(
    () => setPage(1),
    [debouncedSearch, statusFilter, cityFilter, autoCancelledOnly, from, to],
  );

  useEffect(() => {
    if (!open) setSelectedId(null);
  }, [open]);

  const selectedOrder = result?.items.find((o) => o.id === selectedId) ?? null;

  function handleUpdated(updated: Order) {
    setResult((prev) =>
      prev ? { ...prev, items: prev.items.map((o) => (o.id === updated.id ? updated : o)) } : prev,
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-noir-950/70 backdrop-blur-sm"
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-label="Order notifications"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: EASE_LUXE }}
            className="fixed inset-x-0 top-[6vh] z-[70] mx-auto flex max-h-[88vh] w-[calc(100%-2rem)] max-w-2xl flex-col border border-gold-500/15 bg-noir-950"
          >
            <div className="flex h-18 shrink-0 items-center justify-between border-b border-gold-500/10 px-6">
              {selectedOrder ? (
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="flex cursor-pointer items-center gap-2 font-serif text-lg text-cream hover:text-gold-300"
                >
                  <ArrowLeft size={17} aria-hidden />
                  Order #{selectedOrder.id}
                </button>
              ) : (
                <h2 className="flex items-center gap-2.5 font-serif text-lg text-cream">
                  <Bell size={18} className="text-gold-400" aria-hidden />
                  Orders
                </h2>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close orders"
                className="flex h-10 w-10 cursor-pointer items-center justify-center text-cream-muted hover:text-cream"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {selectedOrder ? (
                <OrderDetail order={selectedOrder} token={token} onUpdated={handleUpdated} />
              ) : (
                <>
                  {summary && (summary.newOrders > 0 || summary.autoCancelled > 0) && (
                    <div className="mb-4 border border-gold-500/20 bg-gold-500/5 px-4 py-3 text-xs text-gold-300">
                      {summary.newOrders > 0 &&
                        `${summary.newOrders} new order${summary.newOrders === 1 ? "" : "s"}`}
                      {summary.newOrders > 0 && summary.autoCancelled > 0 && " · "}
                      {summary.autoCancelled > 0 &&
                        `${summary.autoCancelled} auto-cancelled since your last visit`}
                    </div>
                  )}

                  <div className="mb-4 flex flex-col gap-3">
                    <SearchField
                      value={search}
                      onChange={setSearch}
                      placeholder="Search by order #, maison or status"
                    />
                    <div className="flex flex-wrap gap-2">
                      {STATUS_FILTERS.map((s) => (
                        <button
                          key={s || "all"}
                          type="button"
                          onClick={() => setStatusFilter(s)}
                          className={`cursor-pointer border px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] transition-colors ${
                            statusFilter === s
                              ? "border-gold-400 bg-gold-500/10 text-gold-300"
                              : "border-gold-500/15 text-cream-muted hover:border-gold-500/40"
                          }`}
                        >
                          {s || "All"}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setAutoCancelledOnly((v) => !v)}
                        className={`cursor-pointer border px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] transition-colors ${
                          autoCancelledOnly
                            ? "border-red-400/60 bg-red-500/10 text-red-300"
                            : "border-gold-500/15 text-cream-muted hover:border-gold-500/40"
                        }`}
                      >
                        Auto-cancelled only
                      </button>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                      <label className="flex flex-col gap-1 text-xs text-cream-muted">
                        Maison
                        <select
                          value={cityFilter}
                          onChange={(e) => setCityFilter(e.target.value)}
                          className="cursor-pointer border border-gold-500/20 bg-noir-950 px-3 py-2 text-sm text-cream focus:border-gold-400 focus:outline-none"
                        >
                          <option value="">All maisons</option>
                          {cities.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="flex flex-col gap-1 text-xs text-cream-muted">
                        From
                        <input
                          type="datetime-local"
                          value={from}
                          onChange={(e) => setFrom(e.target.value)}
                          className="border border-gold-500/20 bg-noir-950 px-3 py-2 text-sm text-cream focus:border-gold-400 focus:outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs text-cream-muted">
                        To
                        <input
                          type="datetime-local"
                          value={to}
                          onChange={(e) => setTo(e.target.value)}
                          className="border border-gold-500/20 bg-noir-950 px-3 py-2 text-sm text-cream focus:border-gold-400 focus:outline-none"
                        />
                      </label>
                      {hasFilters && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="cursor-pointer border border-gold-500/15 px-3 py-2 text-[11px] uppercase tracking-[0.15em] text-cream-muted hover:border-gold-500/40 hover:text-cream"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </div>

                  <FormError message={error} />

                  {result === null ? (
                    <EmptyState message="Loading..." />
                  ) : result.items.length === 0 ? (
                    <EmptyState message="No orders match these filters." />
                  ) : (
                    <>
                      <ul className="flex flex-col gap-2">
                        {result.items.map((order) => (
                          <li key={order.id}>
                            <button
                              type="button"
                              onClick={() => setSelectedId(order.id)}
                              className="flex w-full cursor-pointer items-center justify-between gap-4 border border-gold-500/10 px-4 py-3 text-left transition-colors hover:border-gold-500/30 hover:bg-noir-900/40"
                            >
                              <div className="min-w-0">
                                <p className="flex flex-wrap items-center gap-2 text-sm text-cream">
                                  #{order.id}
                                  <span
                                    className={`border px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] ${statusTone(order.status)}`}
                                  >
                                    {order.status}
                                  </span>
                                  {order.autoCancelled && (
                                    <span className="border border-red-400/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-red-300">
                                      Auto-cancelled
                                    </span>
                                  )}
                                </p>
                                <p className="mt-1 truncate text-xs text-cream-faint">
                                  {order.customerName ?? "Guest"} · {order.cityName} ·{" "}
                                  {formatDateTime(order.createdAt)}
                                </p>
                                {(() => {
                                  const milestone = latestOrderMilestone(order);
                                  return (
                                    milestone && (
                                      <p
                                        className={`mt-0.5 truncate text-xs ${
                                          milestone.label === "Cancelled"
                                            ? "text-red-300/70"
                                            : "text-cream-faint"
                                        }`}
                                      >
                                        {milestone.label} {formatDateTime(milestone.iso)}
                                      </p>
                                    )
                                  );
                                })()}
                              </div>
                              <span className="shrink-0 text-sm tabular-nums text-gold-400">
                                {order.totalVnd.toLocaleString("vi-VN")}₫
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                      <Pagination
                        page={result.page}
                        pageSize={result.pageSize}
                        totalCount={result.totalCount}
                        onPageChange={setPage}
                      />
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function OrderDetail({
  order,
  token,
  onUpdated,
}: {
  order: Order;
  token: string | null;
  onUpdated: (order: Order) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isTerminal = order.status === "Completed" || order.status === "Cancelled";
  const next = nextStatusFor(order.status);
  const previous = previousStatusFor(order.status);
  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

  async function updateStatus(status: OrderStatus) {
    setActionError(null);
    setBusy(true);
    try {
      const updated = await api<Order>(`/api/orders/${order.id}/status`, {
        method: "PUT",
        token,
        body: { status },
      });
      onUpdated(updated);
      setConfirmingCancel(false);
    } catch (err) {
      setActionError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-cream-muted">
        <p>
          {order.customerName ?? "Guest"} · {order.cityName}
        </p>
        <ul className="mt-1 flex flex-col gap-0.5 text-xs text-cream-faint">
          <li>Placed {formatDateTime(order.createdAt)}</li>
          {order.preparingAt && <li>Started {formatDateTime(order.preparingAt)}</li>}
          {order.readyAt && <li>Ready {formatDateTime(order.readyAt)}</li>}
          {order.completedAt && <li>Completed {formatDateTime(order.completedAt)}</li>}
          {order.cancelledAt && (
            <li className="text-red-300/80">Cancelled {formatDateTime(order.cancelledAt)}</li>
          )}
        </ul>
        {!isTerminal && (
          <p className="mt-1 text-xs text-cream-faint">{formatRemaining(order.expiresAt)}</p>
        )}
      </div>

      {order.status === "Cancelled" ? (
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: [0, -6, 6, -4, 4, 0] }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-3 border border-red-400/20 bg-red-500/5 px-6 py-8 text-center"
        >
          <XCircle size={32} className="text-red-300" aria-hidden />
          <p className="text-sm text-red-300">This order was cancelled.</p>
          {order.autoCancelled && (
            <p className="text-xs text-cream-faint">
              Automatically cancelled after 24h with no update.
            </p>
          )}
        </motion.div>
      ) : (
        <div className="flex items-start">
          {STATUS_STEPS.map((step, i) => {
            const isCurrent = i === currentIndex;
            const isDone = i < currentIndex;
            const Icon = step.Icon;
            return (
              <Fragment key={step.key}>
                <div className="flex flex-col items-center gap-2">
                  <motion.span
                    key={`${step.key}-${isCurrent}`}
                    animate={isCurrent ? STEP_ANIMATION[step.key] : {}}
                    transition={
                      isCurrent
                        ? step.key === "Completed"
                          ? { type: "spring", stiffness: 260, damping: 14 }
                          : { repeat: Infinity, duration: 1.6, ease: "easeInOut" }
                        : { duration: 0.3 }
                    }
                    className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${
                      isDone || isCurrent
                        ? "border-gold-400 bg-gold-500/10 text-gold-300"
                        : "border-gold-500/15 text-cream-faint"
                    }`}
                  >
                    <Icon size={18} aria-hidden />
                    {isCurrent && step.key === "Preparing" && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -top-3 h-4 w-1.5 animate-steam rounded-full bg-cream/30 blur-[2px]"
                      />
                    )}
                  </motion.span>
                  <span
                    className={`text-center text-[10px] uppercase tracking-[0.1em] ${
                      isCurrent ? "text-gold-300" : "text-cream-faint"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className="mx-1 mt-[22px] h-0.5 flex-1 overflow-hidden bg-gold-500/15">
                    <motion.div
                      initial={false}
                      animate={{ width: i < currentIndex ? "100%" : "0%" }}
                      transition={{ duration: 0.5, ease: EASE_LUXE }}
                      className="h-full bg-gold-400"
                    />
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      )}

      <div className="border-t border-gold-500/10 pt-5">
        <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-gold-400">Items</p>
        <ul className="flex flex-col gap-3">
          {order.items.map((item, i) => {
            const summary = optionsSummary({
              size: item.size ?? undefined,
              iceOption: item.iceOption ?? undefined,
              temperature: item.temperature ?? undefined,
              sugarLevel: item.sugarLevel ?? undefined,
              toppings: item.toppings,
            });
            return (
              <li key={i} className="text-sm">
                <p className="text-cream">
                  {item.productName} <span className="text-cream-faint">x{item.quantity}</span>
                </p>
                {summary && <p className="text-xs text-cream-faint">{summary}</p>}
                {item.note && (
                  <p className="text-xs italic text-cream-faint">&ldquo;{item.note}&rdquo;</p>
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-4 flex items-baseline justify-between border-t border-gold-500/10 pt-4">
          <span className="text-xs uppercase tracking-[0.18em] text-cream-muted">Total</span>
          <span className="font-serif text-xl tabular-nums text-gold-400">
            {order.totalVnd.toLocaleString("vi-VN")}₫
          </span>
        </p>
      </div>

      <FormError message={actionError} />

      {!isTerminal &&
        (confirmingCancel ? (
          <div className="flex flex-col gap-3 border border-red-400/20 bg-red-500/5 px-4 py-4">
            <p className="text-sm text-cream">Cancel this order? This can&apos;t be undone.</p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => updateStatus("Cancelled")}
                className="flex-1 cursor-pointer bg-red-500/80 px-4 py-2.5 text-[12px] uppercase tracking-[0.15em] text-noir-950 transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirm cancel
              </button>
              <button
                type="button"
                onClick={() => setConfirmingCancel(false)}
                className="flex-1 cursor-pointer border border-gold-500/20 px-4 py-2.5 text-[12px] uppercase tracking-[0.15em] text-cream-muted hover:text-cream"
              >
                Back
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            {previous && (
              <button
                type="button"
                disabled={busy}
                onClick={() => updateStatus(previous)}
                aria-label={`Move back to ${previous}`}
                title={`Move back to ${previous}`}
                className="flex cursor-pointer items-center justify-center border border-gold-500/20 px-4 py-3 text-cream-muted transition-colors hover:border-gold-500/40 hover:text-cream disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeftCircle size={18} aria-hidden />
              </button>
            )}
            {next && (
              <button
                type="button"
                disabled={busy}
                onClick={() => updateStatus(next)}
                className="flex-1 cursor-pointer bg-gold-500 px-4 py-3 text-[12px] font-medium uppercase tracking-[0.2em] text-noir-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Advance to {next}
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmingCancel(true)}
              className="cursor-pointer border border-red-400/30 px-4 py-3 text-[12px] uppercase tracking-[0.15em] text-red-300 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel order
            </button>
          </div>
        ))}

      {order.hasAccount && <OrderChatPanel order={order} token={token} />}
    </div>
  );
}

function OrderChatPanel({ order, token }: { order: Order; token: string | null }) {
  const [messages, setMessages] = useState<OrderMessage[] | null>(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const load = useCallback(() => {
    api<OrderMessage[]>(`/api/orders/${order.id}/messages`, { token })
      .then(setMessages)
      .catch((err) => setError(errorText(err)));
  }, [order.id, token]);

  useEffect(() => {
    load();
    const interval = setInterval(load, MESSAGES_POLL_MS);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    try {
      const message = await api<OrderMessage>(`/api/orders/${order.id}/messages`, {
        method: "POST",
        token,
        body: { body: trimmed },
      });
      setMessages((prev) => (prev ? [...prev, message] : [message]));
      setBody("");
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-t border-gold-500/10 pt-5">
      <p className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-gold-400">
        <MessageCircle size={13} aria-hidden />
        Quick chat
      </p>

      <ul ref={listRef} className="mb-3 flex max-h-48 flex-col gap-2 overflow-y-auto">
        {messages === null ? (
          <li className="text-xs text-cream-faint">Loading...</li>
        ) : messages.length === 0 ? (
          <li className="text-xs text-cream-faint">
            No messages yet. Ask the customer something below.
          </li>
        ) : (
          messages.map((m) => (
            <li
              key={m.id}
              className={`max-w-[85%] px-3 py-2 text-sm ${
                m.senderRole === "Staff"
                  ? "self-end bg-gold-500/10 text-cream"
                  : "self-start bg-noir-900/60 text-cream-muted"
              }`}
            >
              <p>{m.body}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-cream-faint">
                {m.senderRole === "Staff" ? "Staff" : (order.customerName ?? "Customer")} ·{" "}
                {formatDateTime(m.createdAt)}
              </p>
            </li>
          ))
        )}
      </ul>

      <FormError message={error} />

      <div className="mb-2 flex flex-wrap gap-1.5">
        {QUICK_MESSAGES.map((q) => (
          <button
            key={q}
            type="button"
            disabled={busy}
            onClick={() => send(q)}
            className="cursor-pointer border border-gold-500/15 px-2.5 py-1 text-[11px] text-cream-muted transition-colors hover:border-gold-500/40 hover:text-cream disabled:cursor-not-allowed disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(body);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Ask the customer something"
          maxLength={300}
          className="flex-1 border border-gold-500/20 bg-noir-950 px-3 py-2 text-sm text-cream placeholder:text-cream-faint focus:border-gold-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !body.trim()}
          aria-label="Send message"
          className="flex cursor-pointer items-center justify-center bg-gold-500 px-3 text-noir-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={16} aria-hidden />
        </button>
      </form>
    </div>
  );
}
