"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ProductOptions } from "./drink-options";

const CART_KEY = "thenoir_cart";

export type CartItem = {
  lineId: string;
  productId: number;
  name: string;
  priceVnd: number;
  imageUrl: string;
  quantity: number;
  options?: ProductOptions;
};

// Two lines are the same line only if the product AND every chosen option
// (including the free-text note) match exactly — a different note is a
// different line, not a quantity bump on an existing one.
function computeLineId(productId: number, options?: ProductOptions): string {
  return `${productId}::${JSON.stringify(options ?? {})}`;
}

type NewCartItem = {
  productId: number;
  name: string;
  priceVnd: number;
  imageUrl: string;
  options?: ProductOptions;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  totalVnd: number;
  addItem: (item: NewCartItem, quantity?: number) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        // Backfill lineId for carts saved before this field existed.
        setItems(
          parsed.map((i) => ({
            ...i,
            lineId: i.lineId ?? computeLineId(i.productId, i.options),
          })),
        );
      }
    } catch {
      // corrupt/old shape — start fresh rather than crash the app
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((item: NewCartItem, quantity = 1) => {
    const lineId = computeLineId(item.productId, item.options);
    setItems((current) => {
      const existing = current.find((i) => i.lineId === lineId);
      if (existing) {
        return current.map((i) =>
          i.lineId === lineId ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...current, { ...item, lineId, quantity }];
    });
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((i) => i.lineId !== lineId)
        : current.map((i) => (i.lineId === lineId ? { ...i, quantity } : i)),
    );
  }, []);

  const removeItem = useCallback((lineId: string) => {
    setItems((current) => current.filter((i) => i.lineId !== lineId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );
  const totalVnd = useMemo(
    () => items.reduce((sum, i) => sum + i.priceVnd * i.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({ items, itemCount, totalVnd, addItem, updateQuantity, removeItem, clear }),
    [items, itemCount, totalVnd, addItem, updateQuantity, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
