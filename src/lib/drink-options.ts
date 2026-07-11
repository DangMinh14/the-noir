// Mirrors TheNoir.Api.Models.IceOptions / Temperatures / SugarLevels / Sizes
// exactly. C# and TS can't share one source of truth, so keep these in sync by hand.
export const ICE_OPTIONS = ["Ice on the side", "Ice mixed in", "Less ice", "No ice"] as const;
export const TEMPERATURE_OPTIONS = ["Hot", "Cold"] as const;
export const SUGAR_OPTIONS = ["100% sugar", "70% sugar", "50% sugar", "30% sugar", "No sugar"] as const;
export const SIZE_OPTIONS = ["M · 500ml", "L · 700ml"] as const;

// Mirrors TheNoir.Api.Models.Sizes.LargeSurchargeFor: a UX preview only, the
// backend always recomputes this from the product's real price at order time.
const SIZE_LARGE_SURCHARGE_RATE = 0.15;

export function sizeSurchargeFor(basePriceVnd: number, size: string | undefined): number {
  if (size !== SIZE_OPTIONS[1]) return 0;
  return Math.round((basePriceVnd * SIZE_LARGE_SURCHARGE_RATE) / 1000) * 1000;
}

export type SelectedTopping = { id: number; name: string; priceVnd: number };

export type ProductOptions = {
  size?: string;
  iceOption?: string;
  temperature?: string;
  sugarLevel?: string;
  note?: string;
  // Submitted to the backend as the order item's ToppingIds.
  toppingIds?: number[];
  // Display-only (name/price for cart & checkout captions); harmlessly
  // ignored by the backend's model binding since it only reads toppingIds.
  toppings?: SelectedTopping[];
};

type SummaryInput = {
  size?: string | null;
  iceOption?: string | null;
  temperature?: string | null;
  sugarLevel?: string | null;
  toppings?: { name: string }[];
};

// Compact caption for cart lines, checkout, and admin order detail, e.g.
// "M · 500ml · Cold · Less ice · 50% sugar · Trân châu đường đen".
export function optionsSummary(options: SummaryInput | undefined): string {
  if (!options) return "";
  return [
    options.size,
    options.temperature,
    options.iceOption,
    options.sugarLevel,
    ...(options.toppings?.map((t) => t.name) ?? []),
  ]
    .filter(Boolean)
    .join(" · ");
}
