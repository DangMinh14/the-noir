"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { EASE_LUXE } from "./reveal";
import { resolveImageUrl, FALLBACK_CATEGORY_IMAGE, type Category } from "@/lib/api";

export function CategoryCard({
  category,
  index,
}: {
  category: Category;
  index: number;
}) {
  const reduceMotion = useReducedMotion();
  const [imageFailed, setImageFailed] = useState(false);
  const src = imageFailed
    ? FALLBACK_CATEGORY_IMAGE
    : resolveImageUrl(category.imageUrl, FALLBACK_CATEGORY_IMAGE);

  return (
    <motion.article
      initial={{ opacity: 0, y: reduceMotion ? 0 : 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay: 0.08 * index, ease: EASE_LUXE }}
      className="group"
    >
      <Link
        href={`/menu?category=${category.id}`}
        className="relative block aspect-[3/4] overflow-hidden bg-noir-800"
      >
        <Image
          src={src}
          alt={category.imageAlt || category.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          onError={() => setImageFailed(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-noir-950/85 via-noir-950/20 to-transparent" />

        <h3 className="absolute left-5 top-5 font-serif text-2xl text-cream sm:text-3xl">
          {category.name}
        </h3>

        <span
          aria-hidden
          className="absolute bottom-5 left-5 flex translate-y-2 items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-gold-300 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
        >
          See more
          <ArrowUpRight size={14} />
        </span>
      </Link>
    </motion.article>
  );
}
