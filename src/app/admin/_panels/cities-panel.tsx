"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EmptyState,
  PanelHeading,
  PrimaryButton,
  RowButton,
  errorText,
  tdClass,
  thClass,
} from "@/components/admin/table-bits";
import { FormError, SubmitButton, TextField } from "@/components/auth/fields";
import { api, type City } from "@/lib/api";

export function CitiesPanel({ token }: { token: string | null }) {
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
  const nextSortOrder = items ? items.length + 1 : 1;

  return (
    <section>
      <PanelHeading
        title="Cities"
        description="Locations shown in the homepage's Find Us list."
        action={
          <PrimaryButton onClick={() => setEditing("new")}>
            New city
          </PrimaryButton>
        }
      />
      <FormError message={error} />

      {editing && (
        <form
          onSubmit={save}
          className="mb-8 mt-4 grid grid-cols-1 gap-5 border border-gold-500/15 bg-noir-900/60 p-6 sm:grid-cols-2"
        >
          <TextField label="Name" name="name" defaultValue={current?.name} required maxLength={100} />
          <TextField
            label="Maison count"
            name="maisonCount"
            type="number"
            min={0}
            defaultValue={current?.maisonCount ?? 1}
            required
          />
          <TextField
            label="Kind"
            name="kind"
            defaultValue={current?.kind}
            placeholder="Flagship, Salon..."
            required
            maxLength={50}
          />
          <TextField label="Address" name="address" defaultValue={current?.address} required maxLength={200} />
          <TextField
            label="Display order"
            name="sortOrder"
            type="number"
            defaultValue={current?.sortOrder ?? nextSortOrder}
            required
            helperText="Controls where this city appears in the Find Us list. Lower numbers show first."
          />
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
        <EmptyState message="Loading..." />
      ) : items.length === 0 ? (
        <EmptyState message="No cities yet. Add the first one above." />
      ) : (
        <div className="overflow-x-auto border border-gold-500/10">
          <table className="w-full min-w-150">
            <thead className="border-b border-gold-500/10 bg-noir-900/60">
              <tr>
                <th className={thClass}>Order</th>
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
                  <td className={`${tdClass} tabular-nums`}>{c.sortOrder}</td>
                  <td className={`${tdClass} text-cream`}>{c.name}</td>
                  <td className={tdClass}>{c.maisonCount}</td>
                  <td className={tdClass}>{c.kind}</td>
                  <td className={tdClass}>{c.address}</td>
                  <td className={`${tdClass} text-right whitespace-nowrap`}>
                    <span className="inline-flex gap-4">
                      <RowButton onClick={() => setEditing(c)}>Edit</RowButton>
                      <RowButton danger onClick={() => remove(c)}>
                        Delete
                      </RowButton>
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
