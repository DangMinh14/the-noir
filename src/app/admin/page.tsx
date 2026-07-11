"use client";

import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import type { AdminTab } from "@/components/admin/admin-shell";
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

// The layout handles auth, the admin role gate and the shell chrome, so this
// page only picks which list panel the ?tab= param is asking for. useAuth is
// safe here because the layout already blocked non-admins before we render.
export default function AdminPage() {
  const { user, token } = useAuth();
  const searchParams = useSearchParams();

  const requestedTab = searchParams.get("tab");
  const tab: AdminTab = VALID_TABS.includes(requestedTab as AdminTab)
    ? (requestedTab as AdminTab)
    : "overview";

  if (!user) return null;

  return (
    <>
      {tab === "overview" && <OverviewPanel token={token} />}
      {tab === "products" && <ProductsPanel token={token} />}
      {tab === "categories" && <CategoriesPanel token={token} />}
      {tab === "toppings" && <ToppingsPanel token={token} />}
      {tab === "cities" && <CitiesPanel token={token} />}
      {tab === "orders" && <OrdersPanel token={token} />}
      {tab === "users" && <UsersPanel token={token} self={user} />}
    </>
  );
}
