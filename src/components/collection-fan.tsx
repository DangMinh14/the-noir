"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { EASE_LUXE } from "./reveal";
import { resolveImageUrl, FALLBACK_CATEGORY_IMAGE, type Category } from "@/lib/api";

// A hand-of-cards fan. Slot offsets are relative to the centred card; the
// same rotation/scale/spread the reference component used, rebuilt on
// framer-motion so it stays on the house easing and needs no extra dep.
// Percentages on x/y are relative to each card's own box (CSS translate
// semantics), so the fan scales with the responsive card width for free.
const MAX_OFFSET = 3;

const SLOT = [
  { rot: 0, x: 0, y: 0, scale: 1 },
  { rot: 7, x: 62, y: 1.3, scale: 0.9346 },
  { rot: 14, x: 120, y: 4.0, scale: 0.8498 },
  { rot: 21, x: 172, y: 7.3, scale: 0.7756 },
];

// Shortest signed distance from the centre on the ring, so the fan wraps
// instead of running out of cards at either end.
function circularOffset(index: number, center: number, total: number) {
  let off = index - center;
  if (off > total / 2) off -= total;
  if (off < -total / 2) off += total;
  return off;
}

function FanCard({
  category,
  offset,
  isCenter,
  onSelect,
  reduceMotion,
}: {
  category: Category;
  offset: number;
  isCenter: boolean;
  onSelect: () => void;
  reduceMotion: boolean | null;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const hidden = Math.abs(offset) > MAX_OFFSET;
  const cfg = SLOT[Math.min(Math.abs(offset), MAX_OFFSET)];
  const sign = Math.sign(offset);
  const src = imageFailed
    ? FALLBACK_CATEGORY_IMAGE
    : resolveImageUrl(category.imageUrl, FALLBACK_CATEGORY_IMAGE);

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{ zIndex: hidden ? 0 : 10 - Math.abs(offset) }}
      initial={false}
      animate={{
        x: `calc(-50% + ${cfg.x * sign}%)`,
        y: `calc(-50% + ${cfg.y}%)`,
        rotate: cfg.rot * sign,
        scale: cfg.scale,
        opacity: hidden ? 0 : 1,
      }}
      transition={{ duration: reduceMotion ? 0 : 0.6, ease: EASE_LUXE }}
    >
      <div
        className={`group relative aspect-[3/4] w-40 overflow-hidden bg-noir-800 shadow-2xl shadow-black/50 ring-1 ring-gold-500/15 sm:w-48 lg:w-56 ${
          hidden ? "pointer-events-none" : ""
        }`}
      >
        <Image
          src={src}
          alt={category.imageAlt || category.name}
          fill
          sizes="(max-width: 640px) 40vw, (max-width: 1024px) 220px, 260px"
          className={`object-cover transition-transform duration-700 ease-out ${
            isCenter ? "group-hover:scale-105" : ""
          }`}
          onError={() => setImageFailed(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-noir-950/85 via-noir-950/20 to-transparent" />

        {/* Dim the off-centre cards so the focused one reads as the subject. */}
        <div
          aria-hidden
          className={`absolute inset-0 bg-noir-950 transition-opacity duration-500 ${
            isCenter ? "opacity-0" : "opacity-40"
          }`}
        />

        <h3 className="absolute left-4 top-4 font-serif text-xl text-cream sm:text-2xl">
          {category.name}
        </h3>

        {isCenter ? (
          <Link
            href={`/menu?category=${category.id}`}
            aria-label={`See ${category.name}`}
            className="absolute inset-0 flex items-end p-4"
          >
            <span className="flex translate-y-2 items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-gold-300 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
              See more
              <ArrowUpRight size={14} />
            </span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={onSelect}
            tabIndex={hidden ? -1 : 0}
            aria-label={`Bring ${category.name} to the front`}
            className="absolute inset-0 cursor-pointer"
          />
        )}
      </div>
    </motion.div>
  );
}

export function CollectionFan({ categories }: { categories: Category[] }) {
  const reduceMotion = useReducedMotion();
  const total = categories.length;
  const [center, setCenter] = useState(Math.floor((total - 1) / 2));

  const step = (dir: -1 | 1) =>
    setCenter((c) => (c + dir + total) % total);

  return (
    <div className="mt-16">
      <div className="relative mx-auto h-[300px] w-full max-w-2xl sm:h-[360px] lg:h-[420px]">
        {categories.map((category, i) => {
          const offset = circularOffset(i, center, total);
          return (
            <FanCard
              key={category.id}
              category={category}
              offset={offset}
              isCenter={offset === 0}
              onSelect={() => setCenter(i)}
              reduceMotion={reduceMotion}
            />
          );
        })}
      </div>

      {total > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-gold-500/25 text-cream-muted transition-colors hover:border-gold-500/50 hover:text-gold-300"
          >
            <ChevronLeft size={18} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-gold-500/25 text-cream-muted transition-colors hover:border-gold-500/50 hover:text-gold-300"
          >
            <ChevronRight size={18} aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
