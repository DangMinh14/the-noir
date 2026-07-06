"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { EASE_LUXE } from "./reveal";
import { useCart } from "@/lib/cart-context";
import { resolveImageUrl, type Product } from "@/lib/api";

const FALLBACK_IMAGES = [
  "/images/product-fallback-1.jpg",
  "/images/product-fallback-2.jpg",
];

// Deterministic pick so the same product always shows the same fallback.
function fallbackFor(name: string) {
  const sum = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return FALLBACK_IMAGES[sum % FALLBACK_IMAGES.length];
}

export function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const reduceMotion = useReducedMotion();
  const { addItem } = useCart();
  const [imageFailed, setImageFailed] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const src = imageFailed ? fallbackFor(product.name) : resolveImageUrl(product.imageUrl);

  function handleAdd() {
    addItem({
      productId: product.id,
      name: product.name,
      priceVnd: product.priceVnd,
      imageUrl: product.imageUrl,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: reduceMotion ? 0 : 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay: 0.08 * index, ease: EASE_LUXE }}
      className="group"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-noir-800">
        <Image
          src={src}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          onError={() => setImageFailed(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-noir-950/60 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-30" />
        <span className="absolute left-4 top-4 border border-gold-500/30 bg-noir-950/60 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-gold-300 backdrop-blur-sm">
          {product.categoryName}
        </span>
      </div>

      <div className="mt-5 flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-2xl text-cream">{product.name}</h3>
        <span className="font-serif text-lg tabular-nums text-gold-400">
          {product.priceVnd.toLocaleString("vi-VN")}₫
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-cream-muted">
        {product.description}
      </p>

      <button
        type="button"
        onClick={handleAdd}
        className="mt-4 inline-flex cursor-pointer items-center gap-2 border border-gold-500/30 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-gold-300 transition-colors duration-300 hover:border-gold-400 hover:bg-gold-500/10"
      >
        {justAdded ? (
          <>
            <Check size={13} aria-hidden />
            Added
          </>
        ) : (
          <>
            <Plus size={13} aria-hidden />
            Add to cart
          </>
        )}
      </button>
    </motion.article>
  );
}
