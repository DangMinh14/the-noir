"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import {
  ICE_OPTIONS,
  SIZE_OPTIONS,
  SUGAR_OPTIONS,
  TEMPERATURE_OPTIONS,
  sizeSurchargeFor,
  type ProductOptions,
} from "@/lib/drink-options";
import { api, type Product, type Topping } from "@/lib/api";
import { OptionGroup, SizeGroup, ToppingGroup } from "./product-options";

// Quantity + ice/temperature/sugar + toppings + note, shared by the
// add-to-cart modal (quick add from a menu card) and the product detail
// page (same controls, no dialog chrome). `resetKey` lets the modal force a
// fresh state each time it opens even for the same product; the detail page
// omits it and just resets when navigating to a different product.
export function ProductOrderForm({
  product,
  submitLabel = "Add to cart",
  onConfirm,
  resetKey,
}: {
  product: Product;
  submitLabel?: string;
  onConfirm: (quantity: number, options: ProductOptions) => void;
  resetKey?: unknown;
}) {
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<string>(SIZE_OPTIONS[0]);
  const [iceOption, setIceOption] = useState<string | undefined>();
  const [temperature, setTemperature] = useState<string | undefined>();
  const [sugarLevel, setSugarLevel] = useState<string | undefined>();
  const [note, setNote] = useState("");
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [selectedToppingIds, setSelectedToppingIds] = useState<number[]>([]);

  useEffect(() => {
    setQuantity(1);
    setSize(SIZE_OPTIONS[0]);
    setIceOption(undefined);
    setTemperature(undefined);
    setSugarLevel(undefined);
    setNote("");
    setSelectedToppingIds([]);
  }, [product.id, resetKey]);

  useEffect(() => {
    if (!product.categoryAllowsToppings) return;
    api<Topping[]>("/api/toppings").then(setToppings).catch(() => setToppings([]));
  }, [product.categoryAllowsToppings, product.id]);

  function toggleTopping(id: number) {
    setSelectedToppingIds((current) =>
      current.includes(id) ? current.filter((t) => t !== id) : [...current, id],
    );
  }

  const selectedToppings = toppings
    .filter((t) => selectedToppingIds.includes(t.id))
    .sort((a, b) => a.id - b.id);
  const toppingsSum = selectedToppings.reduce((sum, t) => sum + t.priceVnd, 0);

  const sizeSurcharge = product.categoryAllowsToppings ? sizeSurchargeFor(product.priceVnd, size) : 0;

  function handleConfirm() {
    onConfirm(quantity, {
      size: product.categoryAllowsToppings ? size : undefined,
      iceOption,
      temperature,
      sugarLevel,
      note: note.trim() || undefined,
      toppingIds: selectedToppings.length > 0 ? selectedToppings.map((t) => t.id) : undefined,
      toppings: selectedToppings.length > 0 ? selectedToppings : undefined,
    });
  }

  const total = (product.priceVnd + sizeSurcharge + toppingsSum) * quantity;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-cream-muted">
          Quantity
        </span>
        <div className="flex items-center gap-4">
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="flex h-9 w-9 cursor-pointer items-center justify-center border border-gold-500/25 text-cream-muted hover:border-gold-400 hover:text-cream"
          >
            <Minus size={14} />
          </motion.button>
          <span className="relative w-6 overflow-hidden text-center text-lg tabular-nums text-cream">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={quantity}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="block"
              >
                {quantity}
              </motion.span>
            </AnimatePresence>
          </span>
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={() => setQuantity((q) => Math.min(20, q + 1))}
            aria-label="Increase quantity"
            className="flex h-9 w-9 cursor-pointer items-center justify-center border border-gold-500/25 text-cream-muted hover:border-gold-400 hover:text-cream"
          >
            <Plus size={14} />
          </motion.button>
        </div>
      </div>

      {product.categoryAllowsToppings && (
        <>
          <SizeGroup basePriceVnd={product.priceVnd} value={size} onChange={setSize} />
          <OptionGroup
            label="Temperature"
            options={TEMPERATURE_OPTIONS}
            value={temperature}
            onChange={setTemperature}
          />
          <OptionGroup label="Ice" options={ICE_OPTIONS} value={iceOption} onChange={setIceOption} />
          <OptionGroup
            label="Sugar"
            options={SUGAR_OPTIONS}
            value={sugarLevel}
            onChange={setSugarLevel}
          />
          <ToppingGroup
            label="Toppings"
            toppings={toppings}
            selectedIds={selectedToppingIds}
            onToggle={toggleTopping}
          />
        </>
      )}

      <label className="block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-cream-muted">
          Note (optional)
        </span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 200))}
          maxLength={200}
          rows={2}
          placeholder="Anything else the maison should know"
          className="w-full resize-none border border-gold-500/20 bg-noir-900/60 px-3 py-2.5 text-sm text-cream placeholder:text-cream-faint focus:border-gold-400 focus:outline-none"
        />
      </label>

      <motion.button
        type="button"
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleConfirm}
        className="flex w-full cursor-pointer items-center justify-center gap-2 bg-gold-500 px-6 py-3.5 text-[13px] font-medium uppercase tracking-[0.2em] text-noir-950 transition-colors duration-300 hover:bg-gold-400"
      >
        {submitLabel} ·{" "}
        <span className="relative inline-grid overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={total}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="col-start-1 row-start-1"
            >
              {total.toLocaleString("vi-VN")}₫
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.button>
    </div>
  );
}
