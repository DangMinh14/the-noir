"use client";

import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Coffee,
  Tags,
  MapPin,
  ClipboardList,
  Users as UsersIcon,
  Candy,
} from "lucide-react";
import { BackToHome } from "@/components/back-to-home";
import { useAuth } from "@/lib/auth-context";

export type AdminTab =
  | "overview"
  | "products"
  | "categories"
  | "toppings"
  | "cities"
  | "orders"
  | "users";

const NAV: { key: AdminTab; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "products", label: "Products", icon: Coffee },
  { key: "categories", label: "Categories", icon: Tags },
  { key: "toppings", label: "Toppings", icon: Candy },
  { key: "cities", label: "Cities", icon: MapPin },
  { key: "orders", label: "Orders", icon: ClipboardList },
  { key: "users", label: "Users", icon: UsersIcon },
];

export function AdminShell({
  tab,
  onTabChange,
  children,
}: {
  tab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const activeLabel = NAV.find((n) => n.key === tab)?.label ?? "Overview";

  return (
    <div className="flex min-h-dvh bg-noir-950">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gold-500/10 bg-noir-900/40 lg:flex">
        <Link
          href="/"
          className="flex h-16 items-center gap-3 border-b border-gold-500/10 px-6 font-serif text-lg text-cream"
        >
          <Image
            src="/images/logo.png"
            alt=""
            width={22}
            height={22}
            className="h-[22px] w-[22px]"
          />
          <span>
            Thé <span className="italic text-gold-400">Noir</span>
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-6" aria-label="Admin sections">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => onTabChange(key)}
              aria-current={tab === key ? "page" : undefined}
              className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-[13px] transition-colors ${
                tab === key
                  ? "border-l-2 border-gold-400 bg-gold-500/10 text-gold-300"
                  : "border-l-2 border-transparent text-cream-muted hover:bg-gold-500/5 hover:text-cream"
              }`}
            >
              <Icon size={17} aria-hidden />
              {label}
            </button>
          ))}
        </nav>

        <div className="border-t border-gold-500/10 p-4">
          <p className="mb-3 truncate text-xs text-cream-faint">
            {user?.email}
          </p>
          <BackToHome />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar + horizontal nav */}
        <div className="border-b border-gold-500/10 bg-noir-900/60 lg:hidden">
          <div className="flex h-16 items-center justify-between px-5">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-serif text-lg text-cream"
            >
              <Image
                src="/images/logo.png"
                alt=""
                width={20}
                height={20}
                className="h-5 w-5"
              />
              Thé <span className="italic text-gold-400">Noir</span>
            </Link>
            <BackToHome />
          </div>
          <nav
            className="flex gap-1 overflow-x-auto px-3 pb-3"
            aria-label="Admin sections"
          >
            {NAV.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => onTabChange(key)}
                aria-current={tab === key ? "page" : undefined}
                className={`flex shrink-0 cursor-pointer items-center gap-2 border px-3.5 py-2 text-[12px] uppercase tracking-[0.15em] transition-colors ${
                  tab === key
                    ? "border-gold-400 bg-gold-500/10 text-gold-300"
                    : "border-gold-500/15 text-cream-muted"
                }`}
              >
                <Icon size={14} aria-hidden />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Desktop header */}
        <header className="hidden h-16 shrink-0 items-center border-b border-gold-500/10 px-8 lg:flex">
          <h1 className="font-serif text-xl text-cream">{activeLabel}</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
