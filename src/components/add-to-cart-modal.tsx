"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { EASE_LUXE } from "./reveal";
import { ProductOrderForm } from "./product-order-form";
import type { ProductOptions } from "@/lib/drink-options";
import type { Product } from "@/lib/api";

export function AddToCartModal({
  product,
  open,
  onClose,
  onConfirm,
  triggerRef,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
  onConfirm: (quantity: number, options: ProductOptions) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";

    const getFocusable = () => {
      const dialog = dialogRef.current;
      if (!dialog) return [];
      return Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled"));
    };

    getFocusable()[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const els = getFocusable();
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
  }, [open, onClose, triggerRef]);

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
            className="fixed inset-0 z-[80] bg-noir-950/70 backdrop-blur-sm"
            aria-hidden
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-to-cart-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: EASE_LUXE }}
            className="fixed inset-x-0 bottom-0 z-[90] flex max-h-[85vh] flex-col overflow-y-auto border-t border-gold-500/15 bg-noir-950 p-6 sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:border sm:p-8"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <h2 id="add-to-cart-title" className="font-serif text-2xl text-cream">
                {product.name}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 cursor-pointer text-cream-faint hover:text-cream"
              >
                <X size={20} />
              </button>
            </div>

            <ProductOrderForm product={product} onConfirm={onConfirm} resetKey={open} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
