"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { resolveImageUrl, FALLBACK_CATEGORY_IMAGE, type Category } from "@/lib/api";

// The active image is wiped in from the top edge; the others collapse to a
// zero-height sliver so only one shows at a time.
const clipVariants = {
  visible: { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" },
  hidden: { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" },
};

// Each glyph is two stacked copies: a dimmed one that slides up out of view
// and a gold one that slides in from below, staggered left to right.
function StaggerText({
  text,
  isActive,
  reduce,
}: {
  text: string;
  isActive: boolean;
  reduce: boolean;
}) {
  const characters = Array.from(text);
  return (
    <span className="relative inline-block align-bottom">
      {characters.map((char, i) => {
        const glyph = char === " " ? " " : char;
        return (
          <span key={i} className="relative inline-block overflow-hidden">
            <MotionConfig
              transition={{
                delay: reduce ? 0 : i * 0.025,
                duration: reduce ? 0 : 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <motion.span
                className="inline-block text-cream-faint/40"
                initial={false}
                animate={{ y: isActive ? "-110%" : "0%" }}
              >
                {glyph}
              </motion.span>
              <motion.span
                aria-hidden
                className="absolute left-0 top-0 inline-block text-gold-300"
                initial={false}
                animate={{ y: isActive ? "0%" : "110%" }}
              >
                {glyph}
              </motion.span>
            </MotionConfig>
          </span>
        );
      })}
    </span>
  );
}

function SlideImage({
  category,
  isActive,
  reduce,
}: {
  category: Category;
  isActive: boolean;
  reduce: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const src = imageFailed
    ? FALLBACK_CATEGORY_IMAGE
    : resolveImageUrl(category.imageUrl, FALLBACK_CATEGORY_IMAGE);

  return (
    <motion.div
      className="absolute inset-0"
      style={{ zIndex: isActive ? 2 : 1 }}
      variants={clipVariants}
      initial={false}
      animate={isActive ? "visible" : "hidden"}
      transition={{ ease: [0.33, 1, 0.68, 1], duration: reduce ? 0 : 0.8 }}
    >
      <Image
        src={src}
        alt={category.imageAlt || category.name}
        fill
        sizes="(max-width: 768px) 100vw, 45vw"
        className="object-cover"
        onError={() => setImageFailed(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-noir-950/60 via-transparent to-transparent" />
    </motion.div>
  );
}

function ScrollChevron({
  direction,
  onClick,
}: {
  direction: "up" | "down";
  onClick: () => void;
}) {
  const Icon = direction === "up" ? ChevronUp : ChevronDown;
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      aria-label={direction === "up" ? "Scroll up for more" : "Scroll down for more"}
      className={`absolute left-1/2 z-20 flex h-8 w-8 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-gold-500/25 bg-noir-950/80 text-gold-300 backdrop-blur-sm transition-colors hover:border-gold-500/50 ${
        direction === "up" ? "top-0" : "bottom-0"
      }`}
    >
      <Icon size={15} aria-hidden />
    </motion.button>
  );
}

export function CollectionSlideshow({ categories }: { categories: Category[] }) {
  const reduce = useReducedMotion() ?? false;
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const [canUp, setCanUp] = useState(false);
  const [canDown, setCanDown] = useState(false);

  const updateScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    setCanUp(el.scrollTop > 4);
    setCanDown(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  }, []);

  useEffect(() => {
    updateScroll();
    const el = listRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScroll);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScroll, categories]);

  const scrollList = (dir: -1 | 1) =>
    listRef.current?.scrollBy({ top: dir * 200, behavior: reduce ? "auto" : "smooth" });

  return (
    <div className="mt-16 grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
      {/* Names + blurbs. Edge fades and chevrons signal there's more of the
         list above/below when it overflows the capped height. */}
      <div className="relative">
        <AnimatePresence>
          {canUp && (
            <>
              <motion.div
                key="fade-up"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-noir-950 to-transparent"
              />
              <ScrollChevron direction="up" onClick={() => scrollList(-1)} />
            </>
          )}
        </AnimatePresence>

        <ul
          ref={listRef}
          onScroll={updateScroll}
          className="no-scrollbar flex max-h-[22rem] flex-col gap-6 overflow-y-auto py-1 sm:max-h-[26rem]"
        >
          {categories.map((category, i) => {
            const isActive = active === i;
            return (
              <li key={category.id}>
                <Link
                  href={`/menu?category=${category.id}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  aria-label={`See ${category.name}`}
                  className="group flex gap-4 outline-none sm:gap-5"
                >
                  {/* Accent rail lights up on the active row. */}
                  <span
                    aria-hidden
                    className={`mt-1.5 w-px shrink-0 transition-colors duration-300 ${
                      isActive ? "bg-gold-400" : "bg-gold-500/15"
                    }`}
                  />
                  <div className="min-w-0">
                    <span
                      className={`block font-serif text-[11px] tracking-[0.3em] transition-colors duration-300 ${
                        isActive ? "text-gold-400" : "text-gold-500/40"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="mt-1 block font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
                      <StaggerText text={category.name} isActive={isActive} reduce={reduce} />
                    </span>
                    {category.description && (
                      <p
                        className={`mt-2 max-w-sm text-sm leading-relaxed transition-colors duration-300 ${
                          isActive ? "text-cream-muted" : "text-cream-faint"
                        }`}
                      >
                        {category.description}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <AnimatePresence>
          {canDown && (
            <>
              <motion.div
                key="fade-down"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-noir-950 to-transparent"
              />
              <ScrollChevron direction="down" onClick={() => scrollList(1)} />
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="relative aspect-[4/5] w-full overflow-hidden bg-noir-800 ring-1 ring-gold-500/15 sm:aspect-[3/4] md:order-first">
        {categories.map((category, i) => (
          <SlideImage
            key={category.id}
            category={category}
            isActive={active === i}
            reduce={reduce}
          />
        ))}
      </div>
    </div>
  );
}
