"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { EASE_LUXE } from "./reveal";
import { MobileAuthLinks, UserMenu } from "./user-menu";

const LINKS = [
  { href: "#collection", label: "Collection" },
  { href: "#story", label: "Our Story" },
  { href: "#ritual", label: "The Ritual" },
  { href: "#maisons", label: "Maisons" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        <a
          href="#top"
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
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-9 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-[13px] uppercase tracking-[0.18em] text-cream-muted transition-colors duration-200 hover:text-gold-300"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-7 md:flex">
          <a
            href="#maisons"
            className="inline-flex items-center border border-gold-500/40 px-5 py-2.5 text-[12px] uppercase tracking-[0.2em] text-gold-300 transition-colors duration-300 hover:border-gold-400 hover:bg-gold-500/10"
          >
            Visit a Maison
          </a>
          <UserMenu />
        </div>

        {/* Mobile toggle — 44px touch target */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 cursor-pointer items-center justify-center text-cream md:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>
    </header>

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
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-gold-500/10 py-4 font-serif text-3xl text-cream transition-colors hover:text-gold-300"
                  >
                    {link.label}
                  </a>
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
                <a
                  href="#maisons"
                  onClick={() => setOpen(false)}
                  className="inline-flex border border-gold-500/40 px-6 py-3.5 text-[13px] uppercase tracking-[0.2em] text-gold-300"
                >
                  Visit a Maison
                </a>
              </motion.li>
            </ul>
          </motion.div>
        )}
    </AnimatePresence>
    </>
  );
}
