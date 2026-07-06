"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/admin/stat-card";
import { PanelHeading, errorText } from "@/components/admin/table-bits";
import { FormError } from "@/components/auth/fields";
import {
  api,
  FALLBACK_PRODUCT_IMAGE,
  type Category,
  type City,
  type Product,
  type User,
} from "@/lib/api";

export function OverviewPanel({ token }: { token: string | null }) {
  const [data, setData] = useState<{
    products: Product[];
    categories: Category[];
    cities: City[];
    users: User[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api<Product[]>("/api/products"),
      api<Category[]>("/api/categories"),
      api<City[]>("/api/cities"),
      api<User[]>("/api/users", { token }),
    ])
      .then(([products, categories, cities, users]) =>
        setData({ products, categories, cities, users }),
      )
      .catch((err) => setError(errorText(err)));
  }, [token]);

  const totalMaisons = data?.cities.reduce((sum, c) => sum + c.maisonCount, 0) ?? 0;
  const adminCount = data?.users.filter((u) => u.role === "Admin").length ?? 0;

  return (
    <section>
      <PanelHeading
        title="Overview"
        description="A snapshot of what's live on the site right now."
      />
      <FormError message={error} />

      {!data ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse border border-gold-500/10 bg-noir-900/40"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard label="Products" value={data.products.length} />
          <StatCard
            label="Categories"
            value={data.categories.length}
            hint={data.categories.map((c) => c.name).join(", ") || undefined}
          />
          <StatCard
            label="Cities"
            value={data.cities.length}
            hint={`${totalMaisons} maisons total`}
          />
          <StatCard label="Registered users" value={data.users.length} />
          <StatCard label="Admins" value={adminCount} />
          <StatCard
            label="No photo yet"
            value={
              data.products.filter((p) => p.imageUrl === FALLBACK_PRODUCT_IMAGE)
                .length
            }
            hint="Still using the stock fallback"
          />
        </div>
      )}
    </section>
  );
}
