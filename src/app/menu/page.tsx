"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal";
import { ProductCard } from "@/components/product-card";
import { api, type Category, type Product } from "@/lib/api";

export default function MenuPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    api<Product[]>("/api/products").then(setProducts).catch(() => setProducts([]));
    api<Category[]>("/api/categories").then(setCategories).catch(() => setCategories([]));
  }, []);

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
        <Reveal>
          <p className="mb-4 flex items-center gap-4 text-[12px] uppercase tracking-[0.32em] text-gold-400">
            <span aria-hidden className="h-px w-12 bg-gold-500/60" />
            The Full Menu
          </p>
          <h1 className="max-w-xl font-serif text-4xl leading-tight text-cream sm:text-6xl">
            Every leaf, <em className="italic text-gold-300">every cup</em>
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`cursor-pointer border px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors ${
                  activeCategory === "all"
                    ? "border-gold-400 bg-gold-500/10 text-gold-300"
                    : "border-gold-500/15 text-cream-muted hover:border-gold-500/40 hover:text-cream"
                }`}
              >
                All
              </button>
              {categories?.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCategory(c.id)}
                  className={`cursor-pointer border px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors ${
                    activeCategory === c.id
                      ? "border-gold-400 bg-gold-500/10 text-gold-300"
                      : "border-gold-500/15 text-cream-muted hover:border-gold-500/40 hover:text-cream"
                  }`}
                >
                  {c.name}
                </button>
              ))}
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
        </Reveal>

        {filtered === null ? (
          <p className="mt-20 text-center text-sm text-cream-faint">Loading the menu...</p>
        ) : filtered.length === 0 ? (
          <p className="mt-20 text-center text-sm text-cream-faint">
            Nothing matches. Try a different search or category.
          </p>
        ) : (
          <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
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
