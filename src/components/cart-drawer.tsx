"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { resolveImageUrl } from "@/lib/api";
import { optionsSummary } from "@/lib/drink-options";
import { EASE_LUXE } from "./reveal";

export function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { items, totalVnd, updateQuantity, removeItem } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-noir-950/70 backdrop-blur-sm"
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-label="Your cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: EASE_LUXE }}
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-sm flex-col border-l border-gold-500/15 bg-noir-950"
          >
            <div className="flex h-18 shrink-0 items-center justify-between border-b border-gold-500/10 px-6">
              <h2 className="flex items-center gap-2.5 font-serif text-lg text-cream">
                <ShoppingBag size={18} className="text-gold-400" aria-hidden />
                Your cart
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close cart"
                className="flex h-10 w-10 cursor-pointer items-center justify-center text-cream-muted hover:text-cream"
              >
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <ShoppingBag size={28} className="text-cream-faint" aria-hidden />
                <p className="text-sm text-cream-muted">Your cart is empty.</p>
                <Link
                  href="/menu"
                  onClick={onClose}
                  className="text-[12px] uppercase tracking-[0.2em] text-gold-300 hover:text-gold-400"
                >
                  Browse the menu
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 overflow-y-auto px-6 py-5">
                  {items.map((item) => {
                    const summary = optionsSummary(item.options);
                    const describedLabel = summary ? `${item.name}, ${summary}` : item.name;
                    return (
                      <li
                        key={item.lineId}
                        className="flex gap-4 border-b border-gold-500/10 py-5 first:pt-0 last:border-0"
                      >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-noir-800">
                          <Image
                            src={resolveImageUrl(item.imageUrl)}
                            alt={item.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="truncate font-serif text-base text-cream">
                              {item.name}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeItem(item.lineId)}
                              aria-label={`Remove ${describedLabel}`}
                              className="shrink-0 cursor-pointer text-cream-faint hover:text-red-300"
                            >
                              <X size={15} />
                            </button>
                          </div>
                          {summary && (
                            <p className="mt-0.5 text-xs text-cream-faint">{summary}</p>
                          )}
                          {item.options?.note && (
                            <p className="mt-0.5 text-xs italic text-cream-faint">
                              &ldquo;{item.options.note}&rdquo;
                            </p>
                          )}
                          <p className="mt-1 text-sm tabular-nums text-gold-400">
                            {item.priceVnd.toLocaleString("vi-VN")}₫
                          </p>
                          <div className="mt-2.5 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                              aria-label={`Decrease quantity, ${describedLabel}`}
                              className="flex h-7 w-7 cursor-pointer items-center justify-center border border-gold-500/25 text-cream-muted hover:border-gold-400 hover:text-cream"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-4 text-center text-sm tabular-nums text-cream">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                              aria-label={`Increase quantity, ${describedLabel}`}
                              className="flex h-7 w-7 cursor-pointer items-center justify-center border border-gold-500/25 text-cream-muted hover:border-gold-400 hover:text-cream"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="shrink-0 border-t border-gold-500/10 px-6 py-6">
                  <div className="mb-5 flex items-baseline justify-between">
                    <span className="text-sm uppercase tracking-[0.18em] text-cream-muted">
                      Total
                    </span>
                    <span className="font-serif text-2xl tabular-nums text-gold-400">
                      {totalVnd.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={onClose}
                    className="flex w-full items-center justify-center bg-gold-500 px-6 py-3.5 text-[13px] font-medium uppercase tracking-[0.2em] text-noir-950 transition-colors duration-300 hover:bg-gold-400"
                  >
                    Checkout
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
