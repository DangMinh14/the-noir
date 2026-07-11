"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackToHome } from "@/components/back-to-home";
import { Reveal } from "@/components/reveal";
import { FormError } from "@/components/auth/fields";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError, type Order, type OrderMessage } from "@/lib/api";
import { latestOrderMilestone } from "@/lib/order-timeline";

const STATUS_STYLES: Record<Order["status"], string> = {
  Pending: "border-gold-500/30 text-gold-300",
  Preparing: "border-gold-500/30 text-gold-300",
  Ready: "border-emerald-400/30 text-emerald-300",
  Completed: "border-cream-faint/30 text-cream-faint",
  Cancelled: "border-red-400/30 text-red-300",
};

function errorText(err: unknown) {
  return err instanceof ApiError ? err.message : "Something went wrong.";
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Staff move an order along by hand from the admin side, with nothing to
// push a change to an open tab, so the customer view polls both the order
// list (status, timestamps) and each open thread (messages) on a timer
// instead of waiting for a manual refresh.
const ORDERS_POLL_MS = 6000;
const MESSAGES_POLL_MS = 6000;

function OrderChat({ orderId, token }: { orderId: number; token: string | null }) {
  const [messages, setMessages] = useState<OrderMessage[] | null>(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const load = useCallback(() => {
    api<OrderMessage[]>(`/api/orders/${orderId}/messages`, { token })
      .then(setMessages)
      .catch((err) => setError(errorText(err)));
  }, [orderId, token]);

  useEffect(() => {
    load();
    const interval = setInterval(load, MESSAGES_POLL_MS);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function send() {
    const trimmed = body.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    try {
      const message = await api<OrderMessage>(`/api/orders/${orderId}/messages`, {
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
    <div className="border-t border-gold-500/10 px-5 py-4">
      <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-gold-400">
        Messages from the maison
      </p>

      <ul ref={listRef} className="mb-3 flex max-h-48 flex-col gap-2 overflow-y-auto">
        {messages === null ? (
          <li className="text-xs text-cream-faint">Loading...</li>
        ) : messages.length === 0 ? (
          <li className="text-xs text-cream-faint">
            No messages yet. Staff will reach out here if they need anything for your order.
          </li>
        ) : (
          messages.map((m) => (
            <li
              key={m.id}
              className={`max-w-[85%] px-3 py-2 text-sm ${
                m.senderRole === "Staff"
                  ? "self-start bg-noir-900/60 text-cream-muted"
                  : "self-end bg-gold-500/10 text-cream"
              }`}
            >
              <p>{m.body}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-cream-faint">
                {m.senderRole === "Staff" ? "Staff" : "You"} · {formatDateTime(m.createdAt)}
              </p>
            </li>
          ))
        )}
      </ul>

      <FormError message={error} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Reply to staff"
          maxLength={300}
          className="flex-1 border border-gold-500/20 bg-noir-950 px-3 py-2 text-sm text-cream placeholder:text-cream-faint focus:border-gold-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !body.trim()}
          aria-label="Send reply"
          className="flex cursor-pointer items-center justify-center bg-gold-500 px-3 text-noir-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={16} aria-hidden />
        </button>
      </form>
    </div>
  );
}

function OrderList({ token }: { token: string | null }) {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api<Order[]>("/api/orders/mine", { token })
      .then(setOrders)
      .catch((err) => setError(errorText(err)));
  }, [token]);

  useEffect(() => {
    load();
    const interval = setInterval(load, ORDERS_POLL_MS);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <>
      <FormError message={error} />

      {orders === null ? (
        <p className="text-sm text-cream-faint">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-cream-faint">
          No orders yet. Your next visit to the menu starts one.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => {
            const isOpen = expanded === order.id;
            return (
              <li key={order.id} className="border border-gold-500/10">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  className="flex w-full cursor-pointer flex-wrap items-center justify-between gap-3 px-5 py-4 text-left"
                >
                  <div>
                    <p className="text-sm text-cream">
                      Order #{order.id} · {order.cityName}
                    </p>
                    <p className="mt-0.5 text-xs text-cream-faint">
                      Placed {formatDateTime(order.createdAt)}
                    </p>
                    {(() => {
                      const milestone = latestOrderMilestone(order);
                      return (
                        milestone && (
                          <p
                            className={`mt-0.5 text-xs ${
                              milestone.label === "Cancelled" ? "text-red-300/70" : "text-cream-faint"
                            }`}
                          >
                            {milestone.label} {formatDateTime(milestone.iso)}
                          </p>
                        )
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`border px-3 py-1 text-[10px] uppercase tracking-[0.18em] ${STATUS_STYLES[order.status]}`}
                    >
                      {order.status}
                    </span>
                    <span className="tabular-nums text-gold-400">
                      {order.totalVnd.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </button>
                {isOpen && (
                  <>
                    <ul className="border-t border-gold-500/10 px-5 pt-4">
                      {order.items.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-baseline justify-between gap-3 py-1.5 text-sm text-cream-muted"
                        >
                          <span>
                            {item.productName}{" "}
                            <span className="text-cream-faint">x{item.quantity}</span>
                          </span>
                          <span className="tabular-nums">
                            {item.lineTotalVnd.toLocaleString("vi-VN")}₫
                          </span>
                        </li>
                      ))}
                    </ul>
                    <ul className="flex flex-col gap-0.5 px-5 pb-4 pt-3 text-xs text-cream-faint">
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
                    <OrderChat orderId={order.id} token={token} />
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default function OrdersPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-noir-950">
        <p className="text-sm uppercase tracking-[0.3em] text-cream-faint">
          Loading
        </p>
      </main>
    );
  }

  return (
    <main className="bg-noir-950">
      <Navbar />

      <section className="mx-auto max-w-4xl px-5 pb-20 pt-32 sm:px-8 sm:pt-40">
        <BackToHome className="mb-8" />

        <Reveal>
          <p className="mb-4 flex items-center gap-4 text-[12px] uppercase tracking-[0.32em] text-gold-400">
            <span aria-hidden className="h-px w-12 bg-gold-500/60" />
            Order activity
          </p>
          <h1 className="max-w-xl font-serif text-4xl leading-tight text-cream sm:text-5xl">
            Every order, <em className="italic text-gold-300">start to finish</em>
          </h1>
        </Reveal>

        <div className="mt-10">
          <OrderList token={token} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
