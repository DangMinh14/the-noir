import { Coffee, CupSoda, Leaf, Milk, Sprout } from "lucide-react";
import { hashToIndex } from "./hash";

// Desaturated, dark-luxury-compatible tones only — no saturated rainbow
// gradients, matching this project's existing design system.
const ACCENTS = [
  { glow: "rgba(196,120,74,0.16)", text: "#d99a6c" }, // caramel
  { glow: "rgba(122,150,120,0.16)", text: "#9ab89a" }, // sage
  { glow: "rgba(168,90,74,0.16)", text: "#c07d68" }, // rust
  { glow: "rgba(110,140,128,0.16)", text: "#8bb5a3" }, // jade
  { glow: "rgba(180,150,90,0.16)", text: "#d1b877" }, // brass
  { glow: "rgba(140,110,130,0.16)", text: "#b895a8" }, // plum
] as const;

export type CategoryAccent = (typeof ACCENTS)[number];

export function getAccentForCategory(id: number): CategoryAccent {
  return ACCENTS[hashToIndex(id, ACCENTS.length)];
}

// Keyword match (not the id hash) so the glyph stays semantically correct
// for the categories we actually sell, with a graceful default for anything
// an admin might add later.
export function getIconForCategory(name: string) {
  const n = name.toLowerCase();
  if (n.includes("milk")) return Milk;
  if (n.includes("matcha")) return Sprout;
  if (n.includes("coffee")) return Coffee;
  if (n.includes("tea")) return Leaf;
  return CupSoda;
}
