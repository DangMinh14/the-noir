"use client";

import { Reveal } from "./reveal";
import { getAccentForCategory, getIconForCategory } from "@/lib/category-accent";
import type { Category } from "@/lib/api";

export function CategoryBanner({ category }: { category: Category }) {
  const accent = getAccentForCategory(category.id);
  const Icon = getIconForCategory(category.name);

  return (
    <Reveal className="mt-10">
      <div className="relative overflow-hidden border border-gold-500/10 bg-noir-900/50 px-6 py-9 sm:px-10 sm:py-12">
        <Icon
          aria-hidden
          size={200}
          strokeWidth={0.75}
          className="pointer-events-none absolute -right-6 -top-10 sm:-right-4 sm:-top-8"
          style={{ color: accent.text, opacity: 0.06 }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full blur-3xl"
          style={{ backgroundColor: accent.glow }}
        />

        <div className="relative flex items-center gap-5 sm:gap-6">
          <span
            aria-hidden
            className="flex h-14 w-14 shrink-0 items-center justify-center border sm:h-16 sm:w-16"
            style={{ borderColor: `${accent.text}4d`, color: accent.text }}
          >
            <Icon size={26} strokeWidth={1.5} />
          </span>
          <div>
            <h2 className="font-serif text-3xl leading-tight text-cream sm:text-4xl">
              {category.name}
            </h2>
            <p className="mt-1 text-sm text-cream-muted">
              {category.productCount} {category.productCount === 1 ? "pour" : "pours"} in this line
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
