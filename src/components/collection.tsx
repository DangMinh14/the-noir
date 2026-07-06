"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Reveal } from "./reveal";
import { ProductCard } from "./product-card";
import { api, type Product } from "@/lib/api";

export function Collection() {
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    api<Product[]>("/api/products")
      .then((all) => setProducts(all.slice(0, 4)))
      .catch(() => setProducts([]));
  }, []);

  return (
    <section id="collection" className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-36">
      <Reveal>
        <p className="mb-4 flex items-center gap-4 text-[12px] uppercase tracking-[0.32em] text-gold-400">
          <span aria-hidden className="h-px w-12 bg-gold-500/60" />
          The Collection
        </p>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-xl font-serif text-4xl leading-tight text-cream sm:text-6xl">
            Signatures of <em className="italic text-gold-300">the maison</em>
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-cream-muted">
            Four pillars of the menu: tea, milk tea, coffee and matcha, each
            built on leaves and beans we source ourselves.
          </p>
        </div>
      </Reveal>

      {products && products.length > 0 && (
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}

      <Reveal delay={0.1}>
        <div className="mt-16 text-center">
          <Link
            href="/menu"
            className="inline-flex items-center border border-gold-500/40 px-7 py-3.5 text-[12px] uppercase tracking-[0.2em] text-gold-300 transition-colors duration-300 hover:border-gold-400 hover:bg-gold-500/10"
          >
            See the full menu
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
