"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BackLink, EmptyState, errorText } from "@/components/admin/table-bits";
import { FormError, SubmitButton, TextField } from "@/components/auth/fields";
import { useAuth } from "@/lib/auth-context";
import { api, type City } from "@/lib/api";

const LIST_HREF = "/admin?tab=cities";

export default function CityEditPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const isNew = id === "new";

  const [city, setCity] = useState<City | null>(null);
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
      const c = await api<City>(`/api/cities/${id}`);
      setCity(c);
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
      maisonCount: Number(f.get("maisonCount")),
      kind: String(f.get("kind")),
      address: String(f.get("address")),
      sortOrder: Number(f.get("sortOrder")),
    };
    setBusy(true);
    setError(null);
    try {
      if (isNew) {
        await api("/api/cities", { method: "POST", token, body });
      } else {
        await api(`/api/cities/${id}`, { method: "PUT", token, body });
      }
      router.push(LIST_HREF);
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  }

  return (
    <section className="max-w-2xl">
      <BackLink href={LIST_HREF}>Back to cities</BackLink>

      <h2 className="mb-6 font-serif text-2xl text-cream">
        {isNew ? "New city" : "Edit city"}
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
          <TextField label="Name" name="name" defaultValue={city?.name} required maxLength={100} />
          <TextField
            label="Maison count"
            name="maisonCount"
            type="number"
            min={0}
            defaultValue={city?.maisonCount ?? 1}
            required
          />
          <TextField
            label="Kind"
            name="kind"
            defaultValue={city?.kind}
            placeholder="Flagship, Salon..."
            required
            maxLength={50}
          />
          <TextField label="Address" name="address" defaultValue={city?.address} required maxLength={200} />
          <TextField
            label="Display order"
            name="sortOrder"
            type="number"
            defaultValue={city?.sortOrder ?? 1}
            required
            helperText="Controls where this city appears in the Find Us list. Lower numbers show first."
          />
          <div className="flex items-center gap-4 sm:col-span-2">
            <div className="w-48">
              <SubmitButton busy={busy}>
                {isNew ? "Create city" : "Save changes"}
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
