"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { EASE_LUXE } from "./reveal";

// Desktop account area: "Sign in" when logged out, a dropdown when logged in.
export function UserMenu() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (loading) return <div className="hidden w-20 md:block" aria-hidden />;

  if (!user) {
    return (
      <Link
        href="/login"
        className="hidden text-[13px] uppercase tracking-[0.18em] text-cream-muted transition-colors duration-200 hover:text-gold-300 md:block"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex cursor-pointer items-center gap-2.5 text-[13px] uppercase tracking-[0.18em] text-cream transition-colors duration-200 hover:text-gold-300"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold-500/40 font-serif text-sm normal-case text-gold-300">
          {user.displayName.trim().charAt(0).toUpperCase()}
        </span>
        <span className="max-w-28 truncate">{user.displayName}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: EASE_LUXE }}
            className="absolute right-0 top-full mt-4 w-56 border border-gold-500/20 bg-noir-900 py-2 shadow-xl shadow-noir-950/60"
          >
            <p className="border-b border-gold-500/10 px-5 pb-3 pt-2 text-xs text-cream-faint">
              {user.email}
            </p>
            <MenuLink href="/profile" onSelect={() => setOpen(false)}>
              Profile
            </MenuLink>
            <MenuLink href="/orders" onSelect={() => setOpen(false)}>
              Order activity
            </MenuLink>
            {user.role === "Admin" && (
              <MenuLink href="/admin" onSelect={() => setOpen(false)}>
                Admin management
              </MenuLink>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="block w-full cursor-pointer px-5 py-2.5 text-left text-sm text-cream-muted transition-colors hover:bg-gold-500/5 hover:text-gold-300"
            >
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuLink({
  href,
  onSelect,
  children,
}: {
  href: string;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onSelect}
      className="block px-5 py-2.5 text-sm text-cream-muted transition-colors hover:bg-gold-500/5 hover:text-gold-300"
    >
      {children}
    </Link>
  );
}

// Extra rows appended to the mobile overlay menu.
export function MobileAuthLinks({ onNavigate }: { onNavigate: () => void }) {
  const { user, loading, logout } = useAuth();
  if (loading) return null;

  const rowClass =
    "block border-b border-gold-500/10 py-4 font-serif text-2xl text-cream transition-colors hover:text-gold-300";

  if (!user) {
    return (
      <Link href="/login" onClick={onNavigate} className={rowClass}>
        Sign in
      </Link>
    );
  }

  return (
    <>
      <Link href="/profile" onClick={onNavigate} className={rowClass}>
        Profile
      </Link>
      <Link href="/orders" onClick={onNavigate} className={rowClass}>
        Order activity
      </Link>
      {user.role === "Admin" && (
        <Link href="/admin" onClick={onNavigate} className={rowClass}>
          Admin management
        </Link>
      )}
      <button
        type="button"
        onClick={() => {
          onNavigate();
          logout();
        }}
        className={`${rowClass} w-full cursor-pointer text-left`}
      >
        Sign out
      </button>
    </>
  );
}
