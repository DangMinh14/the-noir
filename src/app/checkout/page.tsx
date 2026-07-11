"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormError, SelectField, SubmitButton, TextField } from "@/components/auth/fields";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { optionsSummary } from "@/lib/drink-options";
import { api, ApiError, type City, type CreateOrderRequest, type Order } from "@/lib/api";

export default function CheckoutPage() {
  const { user, token, loading } = useAuth();
  const { items, totalVnd, clear } = useCart();
  const [cities, setCities] = useState<City[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState<Order | null>(null);

  useEffect(() => {
    api<City[]>("/api/cities").then(setCities).catch(() => setCities([]));
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-noir-950">
        <p className="text-sm uppercase tracking-[0.3em] text-cream-faint">Loading</p>
      </main>
    );
  }

  if (confirmed) {
    return (
      <AuthShell
        overline="Order placed"
        title={
          <>
            See you at the <em className="italic text-gold-300">maison</em>
          </>
        }
      >
        <div className="flex flex-col gap-5 text-sm text-cream-muted">
          <p>
            Order <span className="text-cream">#{confirmed.id}</span> is in.
            Pickup at{" "}
            <span className="text-cream">{confirmed.cityName}</span>, total{" "}
            <span className="tabular-nums text-gold-400">
              {confirmed.totalVnd.toLocaleString("vi-VN")}₫
            </span>
            .
          </p>
          <p className="text-xs text-cream-faint">
            {user
              ? "A confirmation has been sent to your email."
              : `Show your name, ${confirmed.customerName}, at the counter when you arrive.`}
          </p>
          <div className="flex gap-4">
            {user ? (
              <Link
                href="/orders"
                className="border border-gold-500/40 px-5 py-2.5 text-[12px] uppercase tracking-[0.2em] text-gold-300 hover:border-gold-400 hover:bg-gold-500/10"
              >
                View order activity
              </Link>
            ) : (
              <Link
                href="/login?redirect=/orders"
                className="border border-gold-500/40 px-5 py-2.5 text-[12px] uppercase tracking-[0.2em] text-gold-300 hover:border-gold-400 hover:bg-gold-500/10"
              >
                Log in to track orders
              </Link>
            )}
            <Link
              href="/menu"
              className="px-2 py-2.5 text-[12px] uppercase tracking-[0.2em] text-cream-faint hover:text-cream"
            >
              Back to menu
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  if (items.length === 0) {
    return (
      <AuthShell
        overline="Checkout"
        title={
          <>
            Your cart is <em className="italic text-gold-300">empty</em>
          </>
        }
      >
        <Link
          href="/menu"
          className="inline-flex border border-gold-500/40 px-6 py-3 text-[12px] uppercase tracking-[0.2em] text-gold-300 hover:border-gold-400 hover:bg-gold-500/10"
        >
          Browse the menu
        </Link>
      </AuthShell>
    );
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body: CreateOrderRequest = {
      cityId: Number(form.get("cityId")),
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, ...i.options })),
      ...(!user && { customerName: String(form.get("customerName") ?? "").trim() }),
    };
    setBusy(true);
    setError(null);
    try {
      const order = await api<Order>("/api/orders", { method: "POST", token, body });
      clear();
      setConfirmed(order);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      overline="Checkout"
      title={
        <>
          Choose your <em className="italic text-gold-300">maison</em>
        </>
      }
    >
      <ul className="mb-6 flex flex-col gap-3 border-b border-gold-500/10 pb-6">
        {items.map((item) => {
          const summary = optionsSummary(item.options);
          return (
            <li key={item.lineId} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-cream-muted">
                {item.name} <span className="text-cream-faint">x{item.quantity}</span>
                {summary && (
                  <span className="block text-xs text-cream-faint">{summary}</span>
                )}
              </span>
              <span className="shrink-0 tabular-nums text-cream">
                {(item.priceVnd * item.quantity).toLocaleString("vi-VN")}₫
              </span>
            </li>
          );
        })}
        <li className="flex items-baseline justify-between pt-2 text-sm uppercase tracking-[0.18em]">
          <span className="text-cream-muted">Total</span>
          <span className="font-serif text-xl tabular-nums text-gold-400">
            {totalVnd.toLocaleString("vi-VN")}₫
          </span>
        </li>
      </ul>

      {!user && (
        <p className="mb-6 border border-gold-500/25 bg-gold-500/10 px-4 py-3 text-sm text-cream-muted">
          Ordering as a guest. <Link href="/login?redirect=/checkout" className="text-gold-300 underline underline-offset-2 hover:text-gold-200">Log in</Link> to unlock member perks once they launch, or just enter your name below.
        </p>
      )}

      <form onSubmit={submit} className="flex flex-col gap-5">
        {!user && (
          <TextField
            label="Your name"
            name="customerName"
            required
            maxLength={100}
            placeholder="Nguyễn Văn A"
            helperText="We'll call this out when your order is ready for pickup."
          />
        )}
        {cities === null ? (
          <p className="text-sm text-cream-faint">Loading maisons...</p>
        ) : (
          <SelectField
            label="Pickup maison"
            name="cityId"
            required
            helperText="You'll pick up your order at this location."
          >
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.address}
              </option>
            ))}
          </SelectField>
        )}
        <FormError message={error} />
        <SubmitButton busy={busy}>Place order</SubmitButton>
      </form>
    </AuthShell>
  );
}
