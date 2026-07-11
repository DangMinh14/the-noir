"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackToHome } from "@/components/back-to-home";
import { Reveal } from "@/components/reveal";
import { ProductCard } from "@/components/product-card";
import { CategoryBanner } from "@/components/category-banner";
import { getAccentForCategory, getIconForCategory } from "@/lib/category-accent";
import { api, type Category, type Product } from "@/lib/api";

function MenuPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api<Product[]>("/api/products").then(setProducts).catch(() => setProducts([]));
    api<Category[]>("/api/categories").then(setCategories).catch(() => setCategories([]));
  }, []);

  // The URL is the source of truth for the active filter, so a link from the
  // landing page's category showcase lands pre-filtered and the state
  // survives back/forward navigation.
  const activeCategory = useMemo<number | "all">(() => {
    const raw = searchParams.get("category");
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? parsed : "all";
  }, [searchParams]);

  const activeCategoryData =
    activeCategory === "all"
      ? null
      : (categories?.find((c) => c.id === activeCategory) ?? null);

  function selectCategory(next: number | "all") {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("category");
    else params.set("category", String(next));
    router.replace(`/menu${params.toString() ? `?${params}` : ""}`, { scroll: false });
  }

  const filtered = useMemo(() => {
    if (!products) return null;
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory = activeCategory === "all" || p.categoryId === activeCategory;
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [products, activeCategory, query]);

  return (
    <main className="bg-noir-950">
      <Navbar />

      <section className="mx-auto max-w-7xl px-5 pb-20 pt-32 sm:px-8 sm:pt-40">
        <BackToHome className="mb-8" />

        <Reveal>
          <p className="mb-4 flex items-center gap-4 text-[12px] uppercase tracking-[0.32em] text-gold-400">
            <span aria-hidden className="h-px w-12 bg-gold-500/60" />
            The Full Menu
          </p>
          <h1 className="max-w-xl font-serif text-4xl leading-tight text-cream sm:text-6xl">
            Every leaf, <em className="italic text-gold-300">every cup</em>
          </h1>
        </Reveal>

        {/* Not wrapped in <Reveal>: framer-motion's transform on an ancestor
           breaks position: sticky, and staying reachable while the mobile
           list scrolls matters more here than the entrance fade. */}
        <div className="sticky top-18 z-30 -mx-5 mt-10 border-b border-gold-500/10 bg-noir-950/95 px-5 py-4 backdrop-blur-md sm:static sm:mx-0 sm:border-none sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Horizontal scroll strip on mobile (no wrap, snaps per chip);
               wraps inline once desktop has the width to fit everything. */}
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
              <button
                type="button"
                onClick={() => selectCategory("all")}
                className={`shrink-0 cursor-pointer snap-start border px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors ${
                  activeCategory === "all"
                    ? "border-gold-400 bg-gold-500/10 text-gold-300"
                    : "border-gold-500/15 text-cream-muted hover:border-gold-500/40 hover:text-cream"
                }`}
              >
                All
              </button>
              {categories?.map((c) => {
                const active = activeCategory === c.id;
                const accent = getAccentForCategory(c.id);
                const Icon = getIconForCategory(c.name);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectCategory(c.id)}
                    style={
                      active
                        ? { borderColor: `${accent.text}80`, backgroundColor: accent.glow, color: accent.text }
                        : undefined
                    }
                    className={`flex shrink-0 cursor-pointer items-center gap-2 snap-start border px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors ${
                      active
                        ? ""
                        : "border-gold-500/15 text-cream-muted hover:border-gold-500/40 hover:text-cream"
                    }`}
                  >
                    <Icon size={13} aria-hidden />
                    {c.name}
                  </button>
                );
              })}
            </div>

            <label className="relative w-full sm:w-64">
              <Search
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cream-faint"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the menu"
                aria-label="Search the menu"
                className="w-full border border-gold-500/20 bg-noir-900/60 py-2.5 pl-10 pr-4 text-sm text-cream placeholder:text-cream-faint focus:border-gold-400 focus:outline-none"
              />
            </label>
          </div>
        </div>

        {activeCategoryData && <CategoryBanner category={activeCategoryData} />}

        {filtered === null ? (
          <p className="mt-20 text-center text-sm text-cream-faint">Loading the menu...</p>
        ) : filtered.length === 0 ? (
          <p className="mt-20 text-center text-sm text-cream-faint">
            Nothing matches. Try a different search or category.
          </p>
        ) : (
          <div className="mt-14 grid grid-cols-1 items-stretch gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i % 3} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={null}>
      <MenuPageContent />
    </Suspense>
  );
}
