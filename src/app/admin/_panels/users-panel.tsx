"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EmptyState,
  PanelHeading,
  RowButton,
  errorText,
  formatDate,
  tdClass,
  thClass,
} from "@/components/admin/table-bits";
import { FormError } from "@/components/auth/fields";
import { api, type User } from "@/lib/api";

export function UsersPanel({ token, self }: { token: string | null; self: User }) {
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
      await api(`/api/users/${u.id}/role`, { method: "PUT", token, body: { role } });
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
      <PanelHeading
        title="Users"
        description="Everyone with an account. Admins can promote, demote or remove other accounts."
      />
      <FormError message={error} />

      {items === null ? (
        <EmptyState message="Loading..." />
      ) : (
        <div className="overflow-x-auto border border-gold-500/10">
          <table className="w-full min-w-150">
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
                    <td className={tdClass}>{formatDate(u.createdAt)}</td>
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
