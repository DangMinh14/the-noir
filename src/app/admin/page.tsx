"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  api,
  ApiError,
  type City,
  type Product,
  type User,
} from "@/lib/api";
import {
  FormError,
  SubmitButton,
  TextField,
} from "@/components/auth/fields";

type Tab = "products" | "cities" | "users";

export default function AdminPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("products");

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

  if (user.role !== "Admin") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-noir-950 px-5 text-center">
        <h1 className="font-serif text-3xl text-cream">
          This room is <em className="italic text-gold-300">staff only</em>
        </h1>
        <p className="max-w-sm text-sm text-cream-muted">
          Your account does not have admin access. If it should, ask another
          admin to change your role.
        </p>
        <Link
          href="/"
          className="border border-gold-500/40 px-6 py-3 text-[12px] uppercase tracking-[0.2em] text-gold-300 hover:border-gold-400 hover:bg-gold-500/10"
        >
          Back to the maison
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-noir-950 pb-24">
      <header className="border-b border-gold-500/10 bg-noir-900/60">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 font-serif text-xl text-cream"
          >
            <Image
              src="/images/logo.png"
              alt=""
              width={24}
              height={24}
              className="h-6 w-6"
            />
            <span>
              Thé <span className="italic text-gold-400">Noir</span>
            </span>
          </Link>
          <p className="text-[11px] uppercase tracking-[0.28em] text-gold-400">
            Admin management
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <nav className="mt-10 flex gap-2" aria-label="Admin sections">
          {(
            [
              ["products", "Products"],
              ["cities", "Cities"],
              ["users", "Users"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`cursor-pointer border px-5 py-2.5 text-[12px] uppercase tracking-[0.2em] transition-colors ${
                tab === key
                  ? "border-gold-400 bg-gold-500/10 text-gold-300"
                  : "border-gold-500/15 text-cream-muted hover:border-gold-500/40 hover:text-cream"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-10">
          {tab === "products" && <ProductsPanel token={token} />}
          {tab === "cities" && <CitiesPanel token={token} />}
          {tab === "users" && <UsersPanel token={token} self={user} />}
        </div>
      </div>
    </main>
  );
}

/* ---------- shared bits ---------- */

const thClass =
  "px-4 py-3 text-left text-[11px] uppercase tracking-[0.2em] text-gold-400";
const tdClass = "px-4 py-3.5 text-sm text-cream-muted";

function PanelHeading({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h2 className="font-serif text-2xl text-cream">{title}</h2>
      {action}
    </div>
  );
}

function NewButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer bg-gold-500 px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.2em] text-noir-950 transition-colors hover:bg-gold-400"
    >
      {children}
    </button>
  );
}

function RowButton({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer text-[11px] uppercase tracking-[0.18em] transition-colors ${
        danger
          ? "text-red-400/70 hover:text-red-300"
          : "text-gold-400 hover:text-gold-300"
      }`}
    >
      {children}
    </button>
  );
}

function errorText(err: unknown) {
  return err instanceof ApiError ? err.message : "Something went wrong.";
}

/* ---------- products ---------- */

function ProductsPanel({ token }: { token: string | null }) {
  const [items, setItems] = useState<Product[] | null>(null);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api<Product[]>("/api/products")
      .then(setItems)
      .catch((err) => setError(errorText(err)));
  }, []);
  useEffect(load, [load]);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = {
      name: String(f.get("name")),
      category: String(f.get("category")),
      description: String(f.get("description")),
      priceVnd: Number(f.get("priceVnd")),
      imageUrl: String(f.get("imageUrl")),
      imageAlt: String(f.get("imageAlt")),
      sortOrder: Number(f.get("sortOrder")),
    };
    setBusy(true);
    setError(null);
    try {
      if (editing === "new") {
        await api("/api/products", { method: "POST", token, body });
      } else if (editing) {
        await api(`/api/products/${editing.id}`, {
          method: "PUT",
          token,
          body,
        });
      }
      setEditing(null);
      load();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(p: Product) {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      await api(`/api/products/${p.id}`, { method: "DELETE", token });
      load();
    } catch (err) {
      setError(errorText(err));
    }
  }

  const current = editing !== "new" ? editing : null;

  return (
    <section>
      <PanelHeading
        title="Products"
        action={<NewButton onClick={() => setEditing("new")}>New product</NewButton>}
      />
      <FormError message={error} />

      {editing && (
        <form
          onSubmit={save}
          className="mb-8 mt-4 grid grid-cols-1 gap-5 border border-gold-500/15 bg-noir-900/60 p-6 sm:grid-cols-2"
        >
          <TextField label="Name" name="name" defaultValue={current?.name} required maxLength={100} />
          <TextField label="Category" name="category" defaultValue={current?.category} required maxLength={50} />
          <div className="sm:col-span-2">
            <TextField label="Description" name="description" defaultValue={current?.description} required maxLength={500} />
          </div>
          <TextField label="Price (VND)" name="priceVnd" type="number" min={0} defaultValue={current?.priceVnd ?? 0} required />
          <TextField label="Sort order" name="sortOrder" type="number" defaultValue={current?.sortOrder ?? 0} required />
          <TextField label="Image URL" name="imageUrl" type="url" defaultValue={current?.imageUrl} required maxLength={500} />
          <TextField label="Image alt text" name="imageAlt" defaultValue={current?.imageAlt} required maxLength={200} />
          <div className="flex items-center gap-4 sm:col-span-2">
            <SubmitButton busy={busy}>
              {editing === "new" ? "Create product" : "Save changes"}
            </SubmitButton>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="cursor-pointer px-4 text-[12px] uppercase tracking-[0.2em] text-cream-faint hover:text-cream"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {items === null ? (
        <p className="text-sm text-cream-faint">Loading...</p>
      ) : (
        <div className="overflow-x-auto border border-gold-500/10">
          <table className="w-full min-w-130">
            <thead className="border-b border-gold-500/10 bg-noir-900/60">
              <tr>
                <th className={thClass}>Name</th>
                <th className={thClass}>Category</th>
                <th className={thClass}>Price</th>
                <th className={thClass}>Order</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-gold-500/5 last:border-0">
                  <td className={`${tdClass} text-cream`}>{p.name}</td>
                  <td className={tdClass}>{p.category}</td>
                  <td className={`${tdClass} tabular-nums`}>
                    {p.priceVnd.toLocaleString("vi-VN")}₫
                  </td>
                  <td className={tdClass}>{p.sortOrder}</td>
                  <td className={`${tdClass} text-right whitespace-nowrap`}>
                    <span className="inline-flex gap-4">
                      <RowButton onClick={() => setEditing(p)}>Edit</RowButton>
                      <RowButton danger onClick={() => remove(p)}>Delete</RowButton>
                    </span>
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

/* ---------- cities ---------- */

function CitiesPanel({ token }: { token: string | null }) {
  const [items, setItems] = useState<City[] | null>(null);
  const [editing, setEditing] = useState<City | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api<City[]>("/api/cities")
      .then(setItems)
      .catch((err) => setError(errorText(err)));
  }, []);
  useEffect(load, [load]);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = {
      name: String(f.get("name")),
      maisonCount: Number(f.get("maisonCount")),
      kind: String(f.get("kind")),
      address: String(f.get("address")),
      sortOrder: Number(f.get("sortOrder")),
    };
    setBusy(true);
    setError(null);
    try {
      if (editing === "new") {
        await api("/api/cities", { method: "POST", token, body });
      } else if (editing) {
        await api(`/api/cities/${editing.id}`, { method: "PUT", token, body });
      }
      setEditing(null);
      load();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(c: City) {
    if (!window.confirm(`Delete "${c.name}"?`)) return;
    try {
      await api(`/api/cities/${c.id}`, { method: "DELETE", token });
      load();
    } catch (err) {
      setError(errorText(err));
    }
  }

  const current = editing !== "new" ? editing : null;

  return (
    <section>
      <PanelHeading
        title="Cities"
        action={<NewButton onClick={() => setEditing("new")}>New city</NewButton>}
      />
      <FormError message={error} />

      {editing && (
        <form
          onSubmit={save}
          className="mb-8 mt-4 grid grid-cols-1 gap-5 border border-gold-500/15 bg-noir-900/60 p-6 sm:grid-cols-2"
        >
          <TextField label="Name" name="name" defaultValue={current?.name} required maxLength={100} />
          <TextField label="Maison count" name="maisonCount" type="number" min={0} defaultValue={current?.maisonCount ?? 1} required />
          <TextField label="Kind" name="kind" defaultValue={current?.kind} placeholder="Flagship, Salon..." required maxLength={50} />
          <TextField label="Address" name="address" defaultValue={current?.address} required maxLength={200} />
          <TextField label="Sort order" name="sortOrder" type="number" defaultValue={current?.sortOrder ?? 0} required />
          <div className="flex items-center gap-4 sm:col-span-2">
            <SubmitButton busy={busy}>
              {editing === "new" ? "Create city" : "Save changes"}
            </SubmitButton>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="cursor-pointer px-4 text-[12px] uppercase tracking-[0.2em] text-cream-faint hover:text-cream"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {items === null ? (
        <p className="text-sm text-cream-faint">Loading...</p>
      ) : (
        <div className="overflow-x-auto border border-gold-500/10">
          <table className="w-full min-w-130">
            <thead className="border-b border-gold-500/10 bg-noir-900/60">
              <tr>
                <th className={thClass}>Name</th>
                <th className={thClass}>Maisons</th>
                <th className={thClass}>Kind</th>
                <th className={thClass}>Address</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b border-gold-500/5 last:border-0">
                  <td className={`${tdClass} text-cream`}>{c.name}</td>
                  <td className={tdClass}>{c.maisonCount}</td>
                  <td className={tdClass}>{c.kind}</td>
                  <td className={tdClass}>{c.address}</td>
                  <td className={`${tdClass} text-right whitespace-nowrap`}>
                    <span className="inline-flex gap-4">
                      <RowButton onClick={() => setEditing(c)}>Edit</RowButton>
                      <RowButton danger onClick={() => remove(c)}>Delete</RowButton>
                    </span>
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

/* ---------- users ---------- */

function UsersPanel({ token, self }: { token: string | null; self: User }) {
  const [items, setItems] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api<User[]>("/api/users", { token })
      .then(setItems)
      .catch((err) => setError(errorText(err)));
  }, [token]);
  useEffect(load, [load]);

  async function changeRole(u: User, role: string) {
    setError(null);
    try {
      await api(`/api/users/${u.id}/role`, {
        method: "PUT",
        token,
        body: { role },
      });
      load();
    } catch (err) {
      setError(errorText(err));
    }
  }

  async function remove(u: User) {
    if (!window.confirm(`Delete account "${u.email}"?`)) return;
    setError(null);
    try {
      await api(`/api/users/${u.id}`, { method: "DELETE", token });
      load();
    } catch (err) {
      setError(errorText(err));
    }
  }

  return (
    <section>
      <PanelHeading title="Users" />
      <FormError message={error} />

      {items === null ? (
        <p className="text-sm text-cream-faint">Loading...</p>
      ) : (
        <div className="mt-4 overflow-x-auto border border-gold-500/10">
          <table className="w-full min-w-130">
            <thead className="border-b border-gold-500/10 bg-noir-900/60">
              <tr>
                <th className={thClass}>Email</th>
                <th className={thClass}>Name</th>
                <th className={thClass}>Joined</th>
                <th className={thClass}>Role</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => {
                const isSelf = u.id === self.id;
                return (
                  <tr key={u.id} className="border-b border-gold-500/5 last:border-0">
                    <td className={`${tdClass} text-cream`}>
                      {u.email}
                      {isSelf && (
                        <span className="ml-2 text-[10px] uppercase tracking-[0.18em] text-gold-400">
                          you
                        </span>
                      )}
                    </td>
                    <td className={tdClass}>{u.displayName}</td>
                    <td className={tdClass}>
                      {new Date(u.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className={tdClass}>
                      <select
                        value={u.role}
                        disabled={isSelf}
                        onChange={(e) => changeRole(u, e.target.value)}
                        className="cursor-pointer border border-gold-500/20 bg-noir-950 px-3 py-1.5 text-sm text-cream disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td className={`${tdClass} text-right`}>
                      {!isSelf && (
                        <RowButton danger onClick={() => remove(u)}>
                          Delete
                        </RowButton>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
