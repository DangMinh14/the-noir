"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  FormError,
  FormNotice,
  SubmitButton,
  TextField,
} from "@/components/auth/fields";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError, type Order, type User } from "@/lib/api";

const STATUS_STYLES: Record<Order["status"], string> = {
  Pending: "border-gold-500/30 text-gold-300",
  Preparing: "border-gold-500/30 text-gold-300",
  Ready: "border-emerald-400/30 text-emerald-300",
  Completed: "border-cream-faint/30 text-cream-faint",
  Cancelled: "border-red-400/30 text-red-300",
};

function OrderHistory({ token }: { token: string | null }) {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api<Order[]>("/api/orders/mine", { token })
      .then(setOrders)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Something went wrong."));
  }, [token]);
  useEffect(load, [load]);

  return (
    <>
      <h2 className="mb-5 mt-10 border-t border-gold-500/10 pt-8 font-serif text-xl text-cream">
        Order history
      </h2>
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
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
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
                  <ul className="border-t border-gold-500/10 px-5 py-4">
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
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default function ProfilePage() {
  const { user, token, loading, setUser } = useAuth();
  const router = useRouter();

  const [nameError, setNameError] = useState<string | null>(null);
  const [nameNotice, setNameNotice] = useState<string | null>(null);
  const [nameBusy, setNameBusy] = useState(false);

  const [pwError, setPwError] = useState<string | null>(null);
  const [pwNotice, setPwNotice] = useState<string | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

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

  async function saveName(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setNameBusy(true);
    setNameError(null);
    setNameNotice(null);
    try {
      const updated = await api<User>("/api/auth/profile", {
        method: "PUT",
        token,
        body: { displayName: String(form.get("displayName")) },
      });
      setUser(updated);
      setNameNotice("Saved.");
    } catch (err) {
      setNameError(
        err instanceof ApiError ? err.message : "Something went wrong.",
      );
    } finally {
      setNameBusy(false);
    }
  }

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const newPassword = String(form.get("newPassword"));
    if (newPassword !== String(form.get("confirm"))) {
      setPwError("Passwords do not match.");
      return;
    }
    setPwBusy(true);
    setPwError(null);
    setPwNotice(null);
    try {
      await api<User>("/api/auth/change-password", {
        method: "POST",
        token,
        body: {
          currentPassword: String(form.get("currentPassword")),
          newPassword,
        },
      });
      formEl.reset();
      setPwNotice("Password updated.");
    } catch (err) {
      setPwError(
        err instanceof ApiError ? err.message : "Something went wrong.",
      );
    } finally {
      setPwBusy(false);
    }
  }

  return (
    <AuthShell
      overline="Your account"
      title={
        <>
          Hello, <em className="italic text-gold-300">{user.displayName}</em>
        </>
      }
    >
      <div className="mb-8 flex flex-col gap-1 border-b border-gold-500/10 pb-6 text-sm text-cream-muted">
        <p>
          Signed in as <span className="text-cream">{user.email}</span>
        </p>
        <p>
          Role:{" "}
          <span className="uppercase tracking-[0.18em] text-gold-300">
            {user.role}
          </span>
        </p>
      </div>

      <form onSubmit={saveName} className="flex flex-col gap-5">
        <TextField
          label="Display name"
          name="displayName"
          defaultValue={user.displayName}
          maxLength={100}
          required
        />
        <FormError message={nameError} />
        <FormNotice message={nameNotice} />
        <SubmitButton busy={nameBusy}>Save name</SubmitButton>
      </form>

      <h2 className="mb-5 mt-10 border-t border-gold-500/10 pt-8 font-serif text-xl text-cream">
        Change password
      </h2>
      <form onSubmit={changePassword} className="flex flex-col gap-5">
        <TextField
          label="Current password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
        <TextField
          label="New password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <TextField
          label="Confirm new password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <FormError message={pwError} />
        <FormNotice message={pwNotice} />
        <SubmitButton busy={pwBusy}>Update password</SubmitButton>
      </form>

      <OrderHistory token={token} />
    </AuthShell>
  );
}
