"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BackLink, EmptyState, errorText } from "@/components/admin/table-bits";
import { FormError, SubmitButton, TextField } from "@/components/auth/fields";
import { useAuth } from "@/lib/auth-context";
import { api, type Topping } from "@/lib/api";

const LIST_HREF = "/admin?tab=toppings";

export default function ToppingEditPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const isNew = id === "new";

  const [topping, setTopping] = useState<Topping | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    setReady(false);
    setLoadError(null);
    try {
      if (isNew) {
        setReady(true);
        return;
      }
      const t = await api<Topping>(`/api/toppings/${id}`);
      setTopping(t);
      setReady(true);
    } catch (err) {
      setLoadError(errorText(err));
    }
  }, [id, isNew]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = {
      name: String(f.get("name")),
      priceVnd: Number(f.get("priceVnd")),
    };
    setBusy(true);
    setError(null);
    try {
      if (isNew) {
        await api("/api/toppings", { method: "POST", token, body });
      } else {
        await api(`/api/toppings/${id}`, { method: "PUT", token, body });
      }
      router.push(LIST_HREF);
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  }

  return (
    <section className="max-w-2xl">
      <BackLink href={LIST_HREF}>Back to toppings</BackLink>

      <h2 className="mb-6 font-serif text-2xl text-cream">
        {isNew ? "New topping" : "Edit topping"}
      </h2>

      {loadError ? (
        <EmptyState message={loadError} />
      ) : !ready ? (
        <EmptyState message="Loading..." />
      ) : (
        <form
          onSubmit={save}
          className="grid grid-cols-1 gap-5 border border-gold-500/15 bg-noir-900/60 p-6 sm:grid-cols-2"
        >
          <TextField label="Name" name="name" defaultValue={topping?.name} required maxLength={100} />
          <TextField
            label="Price (₫)"
            name="priceVnd"
            type="number"
            min={0}
            defaultValue={topping?.priceVnd ?? 10000}
            required
          />
          <div className="flex items-center gap-4 sm:col-span-2">
            <div className="w-48">
              <SubmitButton busy={busy}>
                {isNew ? "Create topping" : "Save changes"}
              </SubmitButton>
            </div>
            <button
              type="button"
              onClick={() => router.push(LIST_HREF)}
              className="cursor-pointer px-4 text-[12px] uppercase tracking-[0.2em] text-cream-faint hover:text-cream"
            >
              Cancel
            </button>
          </div>

          <div className="sm:col-span-2">
            <FormError message={error} />
          </div>
        </form>
      )}
    </section>
  );
}
