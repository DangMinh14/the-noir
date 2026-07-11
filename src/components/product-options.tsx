"use client";

import { SIZE_OPTIONS, sizeSurchargeFor } from "@/lib/drink-options";
import type { Topping } from "@/lib/api";

// Shared by ProductOrderForm (used in both the add-to-cart modal and the
// product detail page's inline order section).
export function OptionGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <div role="group" aria-label={label}>
      <span className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-cream-muted">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(selected ? undefined : option)}
              aria-pressed={selected}
              className={`cursor-pointer border px-3 py-1.5 text-[12px] transition-colors ${
                selected
                  ? "border-gold-400 bg-gold-500/10 text-gold-300"
                  : "border-gold-500/15 text-cream-muted hover:border-gold-500/40 hover:text-cream"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Mandatory single-select, always has a value (defaults to M). Shows the
// per-option surcharge like ToppingGroup does, since unlike Ice/Temperature/
// Sugar this one isn't free.
export function SizeGroup({
  basePriceVnd,
  value,
  onChange,
}: {
  basePriceVnd: number;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div role="group" aria-label="Size">
      <span className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-cream-muted">
        Size
      </span>
      <div className="flex flex-wrap gap-2">
        {SIZE_OPTIONS.map((option) => {
          const selected = value === option;
          const surcharge = sizeSurchargeFor(basePriceVnd, option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              aria-pressed={selected}
              className={`cursor-pointer border px-3 py-1.5 text-[12px] transition-colors ${
                selected
                  ? "border-gold-400 bg-gold-500/10 text-gold-300"
                  : "border-gold-500/15 text-cream-muted hover:border-gold-500/40 hover:text-cream"
              }`}
            >
              {option}
              {surcharge > 0 && (
                <span className="text-cream-faint"> +{surcharge.toLocaleString("vi-VN")}₫</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ToppingGroup({
  label,
  toppings,
  selectedIds,
  onToggle,
}: {
  label: string;
  toppings: Topping[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}) {
  if (toppings.length === 0) return null;
  return (
    <div role="group" aria-label={label}>
      <span className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-cream-muted">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {toppings.map((topping) => {
          const selected = selectedIds.includes(topping.id);
          return (
            <button
              key={topping.id}
              type="button"
              onClick={() => onToggle(topping.id)}
              aria-pressed={selected}
              className={`cursor-pointer border px-3 py-1.5 text-[12px] transition-colors ${
                selected
                  ? "border-gold-400 bg-gold-500/10 text-gold-300"
                  : "border-gold-500/15 text-cream-muted hover:border-gold-500/40 hover:text-cream"
              }`}
            >
              {topping.name}{" "}
              <span className="text-cream-faint">
                +{topping.priceVnd.toLocaleString("vi-VN")}₫
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
