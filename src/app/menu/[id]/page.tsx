"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductOrderForm } from "@/components/product-order-form";
import { ProductCard } from "@/components/product-card";
import { Reveal, EASE_LUXE } from "@/components/reveal";
import { getAccentForCategory, getIconForCategory } from "@/lib/category-accent";
import { sanitizeDescriptionHtml } from "@/lib/sanitize-html";
import { useCart } from "@/lib/cart-context";
import { hashToIndex } from "@/lib/hash";
import { sizeSurchargeFor, type ProductOptions } from "@/lib/drink-options";
import { api, resolveImageUrl, type Category, type Product } from "@/lib/api";

const FALLBACK_IMAGES = ["/images/product-fallback-1.jpg", "/images/product-fallback-2.jpg"];

function fallbackFor(id: number) {
  return FALLBACK_IMAGES[hashToIndex(id, FALLBACK_IMAGES.length)];
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);
  const reduceMotion = useReducedMotion();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [relatedCategoryId, setRelatedCategoryId] = useState<number | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(productId)) {
      setProduct(null);
      return;
    }
    setProduct(undefined);
    setImageFailed(false);
    api<Product>(`/api/products/${productId}`)
      .then((p) => {
        setProduct(p);
        setRelatedCategoryId(p.categoryId);
      })
      .catch(() => setProduct(null));
  }, [productId]);

  useEffect(() => {
    api<Product[]>("/api/products").then(setAllProducts).catch(() => setAllProducts([]));
    api<Category[]>("/api/categories").then(setCategories).catch(() => setCategories([]));
  }, []);

  const relatedProducts = useMemo(() => {
    if (relatedCategoryId === null) return [];
    return allProducts.filter((p) => p.categoryId === relatedCategoryId && p.id !== productId).slice(0, 4);
  }, [allProducts, relatedCategoryId, productId]);

  const relatedCategoryName = categories.find((c) => c.id === relatedCategoryId)?.name ?? "";

  function handleConfirm(quantity: number, options: ProductOptions) {
    if (!product) return;
    const hasOptions = Object.values(options).some(
      (v) => v !== undefined && !(Array.isArray(v) && v.length === 0),
    );
    const toppingsSum = options.toppings?.reduce((sum, t) => sum + t.priceVnd, 0) ?? 0;
    const sizeSurcharge = sizeSurchargeFor(product.priceVnd, options.size);
    addItem(
      {
        productId: product.id,
        name: product.name,
        priceVnd: product.priceVnd + sizeSurcharge + toppingsSum,
        imageUrl: product.imageUrl,
        options: hasOptions ? options : undefined,
      },
      quantity,
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  if (product === null) {
    return (
      <main className="bg-noir-950">
        <Navbar />
        <section className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-5 pb-24 pt-40 text-center">
          <h1 className="font-serif text-3xl text-cream">
            This pour isn&apos;t on the menu <em className="italic text-gold-300">anymore</em>
          </h1>
          <p className="text-sm text-cream-muted">
            The product may have been removed or renamed.
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 border border-gold-500/40 px-6 py-3 text-[12px] uppercase tracking-[0.2em] text-gold-300 hover:border-gold-400 hover:bg-gold-500/10"
          >
            <ArrowLeft size={15} aria-hidden />
            Back to the menu
          </Link>
        </section>
        <Footer />
      </main>
    );
  }

  const accent = product ? getAccentForCategory(product.categoryId) : null;
  const Icon = product ? getIconForCategory(product.categoryName) : null;
  const src = product
    ? imageFailed
      ? fallbackFor(product.id)
      : resolveImageUrl(product.imageUrl)
    : "";

  return (
    <main className="bg-noir-950">
      <Navbar />

      <section className="mx-auto max-w-6xl px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
        <Link
          href="/menu"
          className="group mb-8 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] text-cream-muted transition-colors duration-200 hover:text-gold-300"
        >
          <ArrowLeft
            size={15}
            aria-hidden
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          Back to the menu
        </Link>

        {product === undefined ? (
          <p className="mt-20 text-center text-sm text-cream-faint">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: reduceMotion ? 0 : 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE_LUXE }}
              className="group relative aspect-[4/5] overflow-hidden bg-noir-800"
            >
              <Image
                src={src}
                alt={product.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                onError={() => setImageFailed(true)}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noir-950/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              {product.categoryAllowsToppings && !reduceMotion && (
                <div aria-hidden className="pointer-events-none absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-3 opacity-70">
                  <span className="h-16 w-6 animate-steam rounded-full bg-cream/25 blur-md [animation-delay:-2s]" />
                  <span className="h-20 w-6 animate-steam rounded-full bg-cream/25 blur-md" />
                  <span className="h-16 w-6 animate-steam rounded-full bg-cream/25 blur-md [animation-delay:-4s]" />
                </div>
              )}
              {accent && Icon && (
                <span
                  className="absolute left-4 top-4 flex items-center gap-2 border bg-noir-950/70 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] backdrop-blur-sm"
                  style={{ borderColor: `${accent.text}4d`, color: accent.text }}
                >
                  <Icon size={13} aria-hidden />
                  {product.categoryName}
                </span>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: reduceMotion ? 0 : 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.12, ease: EASE_LUXE }}
            >
              <h1 className="font-serif text-4xl leading-tight text-cream sm:text-5xl">
                {product.name}
              </h1>
              <p className="mt-3 font-serif text-2xl tabular-nums text-gold-400">
                {product.priceVnd.toLocaleString("vi-VN")}₫
              </p>
              <p className="mt-5 text-sm leading-relaxed text-cream-muted">
                {product.description}
              </p>

              {product.descriptionHtml && (
                <div
                  className="rich-text mt-6 max-w-none border-t border-gold-500/10 pt-6"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeDescriptionHtml(product.descriptionHtml),
                  }}
                />
              )}

              <div className="mt-8 border-t border-gold-500/10 pt-8">
                <ProductOrderForm
                  product={product}
                  submitLabel={justAdded ? "Added" : "Add to cart"}
                  onConfirm={handleConfirm}
                />
                {justAdded && (
                  <motion.p
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-3 flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-gold-300"
                  >
                    <Check size={13} aria-hidden />
                    Added to your cart
                  </motion.p>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {categories.length > 0 && (
          <div className="mt-24 border-t border-gold-500/10 pt-16">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="mb-4 flex items-center gap-4 text-[12px] uppercase tracking-[0.32em] text-gold-400">
                    <span aria-hidden className="h-px w-12 bg-gold-500/60" />
                    Keep exploring
                  </p>
                  <h2 className="font-serif text-3xl leading-tight text-cream sm:text-4xl">
                    More from <em className="italic text-gold-300">{relatedCategoryName}</em>
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => {
                    const active = c.id === relatedCategoryId;
                    const accentC = getAccentForCategory(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setRelatedCategoryId(c.id)}
                        style={
                          active
                            ? { borderColor: `${accentC.text}80`, backgroundColor: accentC.glow, color: accentC.text }
                            : undefined
                        }
                        className={`cursor-pointer border px-3.5 py-1.5 text-[11px] uppercase tracking-[0.15em] transition-colors ${
                          active ? "" : "border-gold-500/15 text-cream-muted hover:border-gold-500/40 hover:text-cream"
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            {relatedProducts.length === 0 ? (
              <p className="mt-12 text-sm text-cream-faint">Nothing else in this line yet.</p>
            ) : (
              <div className="mt-12 grid grid-cols-1 items-stretch gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i % 4} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
