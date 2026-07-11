"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AdminShell, type AdminTab } from "@/components/admin/admin-shell";
import { OverviewPanel } from "./_panels/overview-panel";
import { ProductsPanel } from "./_panels/products-panel";
import { CategoriesPanel } from "./_panels/categories-panel";
import { ToppingsPanel } from "./_panels/toppings-panel";
import { CitiesPanel } from "./_panels/cities-panel";
import { OrdersPanel } from "./_panels/orders-panel";
import { UsersPanel } from "./_panels/users-panel";

const VALID_TABS: AdminTab[] = [
  "overview",
  "products",
  "categories",
  "toppings",
  "cities",
  "orders",
  "users",
];

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminPageContent />
    </Suspense>
  );
}

function AdminPageContent() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedTab = searchParams.get("tab");
  const tab: AdminTab = VALID_TABS.includes(requestedTab as AdminTab)
    ? (requestedTab as AdminTab)
    : "overview";

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  function setTab(next: AdminTab) {
    router.replace(`/admin?tab=${next}`, { scroll: false });
  }

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
          This room is <em className="italic text-gold-300">admins only</em>
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
    <AdminShell tab={tab} onTabChange={setTab}>
      {tab === "overview" && <OverviewPanel token={token} />}
      {tab === "products" && <ProductsPanel token={token} />}
      {tab === "categories" && <CategoriesPanel token={token} />}
      {tab === "toppings" && <ToppingsPanel token={token} />}
      {tab === "cities" && <CitiesPanel token={token} />}
      {tab === "orders" && <OrdersPanel token={token} />}
      {tab === "users" && <UsersPanel token={token} self={user} />}
    </AdminShell>
  );
}
