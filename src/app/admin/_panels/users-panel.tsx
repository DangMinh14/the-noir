"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EmptyState,
  PanelHeading,
  RowButton,
  SearchField,
  errorText,
  formatDate,
  tdClass,
  thClass,
} from "@/components/admin/table-bits";
import { Pagination } from "@/components/admin/pagination";
import { FormError } from "@/components/auth/fields";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { api, type PagedResult, type User } from "@/lib/api";

const PAGE_SIZE = 10;

export function UsersPanel({ token, self }: { token: string | null; self: User }) {
  const [result, setResult] = useState<PagedResult<User> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (debouncedSearch) params.set("search", debouncedSearch);
    api<PagedResult<User>>(`/api/users?${params}`, { token })
      .then(setResult)
      .catch((err) => setError(errorText(err)));
  }, [page, debouncedSearch, token]);
  useEffect(load, [load]);

  useEffect(() => setPage(1), [debouncedSearch]);

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

      <div className="mb-4">
        <SearchField value={search} onChange={setSearch} placeholder="Search users" />
      </div>

      {result === null ? (
        <EmptyState message="Loading..." />
      ) : result.items.length === 0 ? (
        <EmptyState message={search ? "No users match your search." : "No users yet."} />
      ) : (
        <>
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
                {result.items.map((u) => {
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
                          <option value="Staff">Staff</option>
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
          <Pagination
            page={result.page}
            pageSize={result.pageSize}
            totalCount={result.totalCount}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}
