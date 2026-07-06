"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/admin/stat-card";
import { BarChart } from "@/components/admin/bar-chart";
import { TrendChart } from "@/components/admin/trend-chart";
import { PanelHeading, errorText } from "@/components/admin/table-bits";
import { FormError } from "@/components/auth/fields";
import {
  api,
  FALLBACK_PRODUCT_IMAGE,
  resolveImageUrl,
  type Category,
  type City,
  type DashboardStats,
  type PagedResult,
  type Product,
  type User,
} from "@/lib/api";

// Large enough to capture every user for a portfolio-scale dataset in one
// page; the overview only needs a role breakdown, not per-page browsing.
const ALL_USERS_PAGE_SIZE = 1000;

export function OverviewPanel({ token }: { token: string | null }) {
  const [data, setData] = useState<{
    products: Product[];
    categories: Category[];
    cities: City[];
    users: PagedResult<User>;
    stats: DashboardStats;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api<Product[]>("/api/products"),
      api<Category[]>("/api/categories"),
      api<City[]>("/api/cities"),
      api<PagedResult<User>>(`/api/users?pageSize=${ALL_USERS_PAGE_SIZE}`, { token }),
      api<DashboardStats>("/api/dashboard/stats", { token }),
    ])
      .then(([products, categories, cities, users, stats]) =>
        setData({ products, categories, cities, users, stats }),
      )
      .catch((err) => setError(errorText(err)));
  }, [token]);

  const totalMaisons = data?.cities.reduce((sum, c) => sum + c.maisonCount, 0) ?? 0;
  const adminCount = data?.users.items.filter((u) => u.role === "Admin").length ?? 0;

  return (
    <section>
      <PanelHeading
        title="Overview"
        description="A snapshot of what's live on the site right now."
      />
      <FormError message={error} />

      {!data ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse border border-gold-500/10 bg-noir-900/40"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Total revenue"
              value={`${data.stats.totalRevenueVnd.toLocaleString("vi-VN")}₫`}
            />
            <StatCard label="Orders" value={data.stats.totalOrders} />
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
            <StatCard label="Registered users" value={data.users.totalCount} />
            <StatCard label="Admins" value={adminCount} />
            <StatCard
              label="No photo yet"
              value={
                data.products.filter((p) => resolveImageUrl(p.imageUrl) === FALLBACK_PRODUCT_IMAGE)
                  .length
              }
              hint="Still using the stock fallback"
            />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="border border-gold-500/10 bg-noir-900/40 p-5">
              <h3 className="mb-4 font-serif text-lg text-cream">
                Revenue, last 14 days
              </h3>
              <TrendChart data={data.stats.revenueByDay} />
            </div>

            <div className="border border-gold-500/10 bg-noir-900/40 p-5">
              <h3 className="mb-4 font-serif text-lg text-cream">
                Top products by quantity sold
              </h3>
              <BarChart
                data={data.stats.topProducts.map((p) => ({
                  label: p.productName,
                  value: p.quantitySold,
                }))}
                formatValue={(v) => `${v} sold`}
              />
            </div>

            <div className="border border-gold-500/10 bg-noir-900/40 p-5 lg:col-span-2">
              <h3 className="mb-4 font-serif text-lg text-cream">
                Revenue by category
              </h3>
              <BarChart
                data={data.stats.revenueByCategory.map((c) => ({
                  label: c.categoryName,
                  value: c.revenueVnd,
                }))}
                formatValue={(v) => `${v.toLocaleString("vi-VN")}₫`}
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
