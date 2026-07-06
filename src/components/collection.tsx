"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal, EASE_LUXE } from "./reveal";

const PRODUCTS = [
  {
    name: "Noir Signature",
    category: "Milk Tea",
    description:
      "Our house black tea folded into silky fresh milk, finished with burnt-caramel pearls.",
    price: "65.000₫",
    image:
      "https://images.unsplash.com/photo-1558857563-b371033873b8?q=80&w=1200&auto=format&fit=crop",
    alt: "A glass of milk tea with tapioca pearls on a dark table",
  },
  {
    name: "Highland Oolong",
    category: "Pure Tea",
    description:
      "Hand-rolled oolong from estates at 1,200 m: orchid nose, honeyed finish, and steep after steep.",
    price: "58.000₫",
    image:
      "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=1200&auto=format&fit=crop",
    alt: "Hot tea being poured from a teapot into a small cup",
  },
  {
    name: "Phin Noir",
    category: "Coffee",
    description:
      "Đà Lạt arabica dripped through a traditional phin, layered over condensed milk.",
    price: "55.000₫",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200&auto=format&fit=crop",
    alt: "A dark cup of Vietnamese coffee in moody light",
  },
  {
    name: "Jade Cloud",
    category: "Matcha",
    description:
      "Stone-ground ceremonial matcha whisked over cold jasmine milk, grassy and bright.",
    price: "72.000₫",
    image:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=1200&auto=format&fit=crop",
    alt: "An iced green matcha drink in a tall glass",
  },
];

export function Collection() {
  const reduceMotion = useReducedMotion();

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

      <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
        {PRODUCTS.map((product, i) => (
          <motion.article
            key={product.name}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, delay: 0.08 * i, ease: EASE_LUXE }}
            className="group"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-noir-800">
              <Image
                src={product.image}
                alt={product.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-noir-950/60 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-30" />
              <span className="absolute left-4 top-4 border border-gold-500/30 bg-noir-950/60 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-gold-300 backdrop-blur-sm">
                {product.category}
              </span>
            </div>

            <div className="mt-5 flex items-baseline justify-between gap-3">
              <h3 className="font-serif text-2xl text-cream">{product.name}</h3>
              <span className="font-serif text-lg tabular-nums text-gold-400">
                {product.price}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-cream-muted">
              {product.description}
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
