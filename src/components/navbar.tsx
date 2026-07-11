"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Menu, ShoppingBag, X } from "lucide-react";
import { EASE_LUXE } from "./reveal";
import { MobileAuthLinks, UserMenu } from "./user-menu";
import { CartDrawer } from "./cart-drawer";
import { OrderNotificationsModal } from "./admin/order-notifications-modal";
import { SectionLink } from "./section-link";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { api, type UnseenOrdersSummary } from "@/lib/api";

const ADMIN_ORDERS_SEEN_KEY = "thenoir_admin_orders_seen_at";
const EPOCH_ISO = "1970-01-01T00:00:00.000Z";
const POLL_INTERVAL_MS = 30_000;

const LINKS = [
  { href: "/menu", label: "Menu", section: null },
  { href: "/#story", label: "Our Story", section: "story" },
  { href: "/#ritual", label: "The Ritual", section: "ritual" },
  { href: "/#maisons", label: "Maisons", section: "maisons" },
] as const;

function CartButton({ onClick }: { onClick: () => void }) {
  const { itemCount } = useCart();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open cart${itemCount > 0 ? `, ${itemCount} item${itemCount === 1 ? "" : "s"}` : ""}`}
      className="relative flex h-11 w-11 cursor-pointer items-center justify-center text-cream transition-colors duration-200 hover:text-gold-300 md:h-auto md:w-auto"
    >
      <ShoppingBag size={19} aria-hidden />
      {itemCount > 0 && (
        <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-medium text-noir-950 md:right-0 md:top-0">
          {itemCount}
        </span>
      )}
    </button>
  );
}

function AdminOrdersButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Order notifications${count > 0 ? `, ${count} unseen` : ""}`}
      className="relative flex h-11 w-11 cursor-pointer items-center justify-center text-cream transition-colors duration-200 hover:text-gold-300 md:h-auto md:w-auto"
    >
      <Bell size={19} aria-hidden />
      {count > 0 && (
        <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-medium text-noir-950 md:right-0 md:top-0">
          {count}
        </span>
      )}
    </button>
  );
}

export function Navbar() {
  const { user, token } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);
  const [unseenSummary, setUnseenSummary] = useState<UnseenOrdersSummary | null>(null);
  const canManageOrders = user?.role === "Admin" || user?.role === "Staff";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!canManageOrders || !token) {
      setUnseenCount(0);
      setUnseenSummary(null);
      return;
    }
    let cancelled = false;
    function poll() {
      const since = localStorage.getItem(ADMIN_ORDERS_SEEN_KEY) ?? EPOCH_ISO;
      api<UnseenOrdersSummary>(`/api/orders/unseen-summary?since=${encodeURIComponent(since)}`, { token })
        .then((summary) => {
          if (cancelled) return;
          setUnseenSummary(summary);
          setUnseenCount(summary.newOrders + summary.autoCancelled);
        })
        .catch(() => {});
    }
    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [canManageOrders, token]);

  function openOrders() {
    localStorage.setItem(ADMIN_ORDERS_SEEN_KEY, new Date().toISOString());
    setUnseenCount(0);
    setOrdersOpen(true);
  }

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled
          ? "border-b border-gold-500/10 bg-noir-950/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8"
      >
        <SectionLink
          id="top"
          className="flex items-center gap-3 font-serif text-xl tracking-wide text-cream sm:text-2xl"
        >
          <Image
            src="/images/logo.png"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7"
          />
          <span>
            Thé <span className="italic text-gold-400">Noir</span>
          </span>
        </SectionLink>

        {/* Desktop links */}
        <ul className="hidden items-center gap-9 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              {link.section ? (
                <SectionLink
                  id={link.section}
                  className="text-[13px] uppercase tracking-[0.18em] text-cream-muted transition-colors duration-200 hover:text-gold-300"
                >
                  {link.label}
                </SectionLink>
              ) : (
                <Link
                  href={link.href}
                  className="text-[13px] uppercase tracking-[0.18em] text-cream-muted transition-colors duration-200 hover:text-gold-300"
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-6 md:flex">
          <SectionLink
            id="maisons"
            className="inline-flex items-center border border-gold-500/40 px-5 py-2.5 text-[12px] uppercase tracking-[0.2em] text-gold-300 transition-colors duration-300 hover:border-gold-400 hover:bg-gold-500/10"
          >
            Visit a Maison
          </SectionLink>
          {canManageOrders && <AdminOrdersButton count={unseenCount} onClick={openOrders} />}
          <CartButton onClick={() => setCartOpen(true)} />
          <UserMenu />
        </div>

        {/* Mobile: cart + menu toggle — both 44px touch targets */}
        <div className="flex items-center gap-1 md:hidden">
          {canManageOrders && <AdminOrdersButton count={unseenCount} onClick={openOrders} />}
          <CartButton onClick={() => setCartOpen(true)} />
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 cursor-pointer items-center justify-center text-cream"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>
    </header>

    <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

    {canManageOrders && (
      <OrderNotificationsModal
        open={ordersOpen}
        onClose={() => setOrdersOpen(false)}
        token={token}
        summary={unseenSummary}
      />
    )}

    {/* Mobile menu — sibling of the header: a backdrop-filter ancestor would
       turn into the containing block for this fixed overlay and crush it */}
    <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 top-18 z-40 bg-noir-950/97 backdrop-blur-lg md:hidden"
          >
            <ul className="flex flex-col gap-2 px-6 pt-10">
              {LINKS.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4, ease: EASE_LUXE }}
                >
                  {link.section ? (
                    <SectionLink
                      id={link.section}
                      onNavigate={() => setOpen(false)}
                      className="block border-b border-gold-500/10 py-4 font-serif text-3xl text-cream transition-colors hover:text-gold-300"
                    >
                      {link.label}
                    </SectionLink>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block border-b border-gold-500/10 py-4 font-serif text-3xl text-cream transition-colors hover:text-gold-300"
                    >
                      {link.label}
                    </Link>
                  )}
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.4, ease: EASE_LUXE }}
              >
                <MobileAuthLinks onNavigate={() => setOpen(false)} />
              </motion.li>
              <motion.li
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4, ease: EASE_LUXE }}
                className="pt-8"
              >
                <SectionLink
                  id="maisons"
                  onNavigate={() => setOpen(false)}
                  className="inline-flex border border-gold-500/40 px-6 py-3.5 text-[13px] uppercase tracking-[0.2em] text-gold-300"
                >
                  Visit a Maison
                </SectionLink>
              </motion.li>
            </ul>
          </motion.div>
        )}
    </AnimatePresence>
    </>
  );
}
