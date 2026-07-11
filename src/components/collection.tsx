"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Reveal } from "./reveal";
import { CategoryCard } from "./category-card";
import { api, type Category } from "@/lib/api";

export function Collection() {
  const [categories, setCategories] = useState<Category[] | null>(null);

  useEffect(() => {
    api<Category[]>("/api/categories")
      .then(setCategories)
      .catch(() => setCategories([]));
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
            Every line on the menu, built on leaves, beans and fruit we
            source ourselves.
          </p>
        </div>
      </Reveal>

      {categories && categories.length > 0 && (
        // Mobile: horizontal snap carousel with the next card peeking in —
        // a real swipe affordance, not four full-width cards stacked tall.
        // Desktop has the width to just show the grid at once.
        <div className="no-scrollbar -mx-5 mt-16 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-14 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
          {categories.map((category, i) => (
            <div
              key={category.id}
              className="w-[76%] shrink-0 snap-start sm:w-auto sm:shrink"
            >
              <CategoryCard category={category} index={i} />
            </div>
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
