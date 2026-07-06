"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { EASE_LUXE } from "../reveal";

// Centered card layout shared by the login, register and reset pages.
export function AuthShell({
  overline,
  title,
  children,
}: {
  overline: string;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-noir-950 px-5 py-16">
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/6 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_LUXE }}
        className="relative w-full max-w-md"
      >
        <Link
          href="/"
          className="mb-10 flex items-center justify-center gap-3 font-serif text-2xl text-cream"
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
        </Link>

        <div className="border border-gold-500/15 bg-noir-900/80 p-8 sm:p-10">
          <p className="mb-3 flex items-center gap-4 text-[11px] uppercase tracking-[0.32em] text-gold-400">
            <span aria-hidden className="h-px w-8 bg-gold-500/60" />
            {overline}
          </p>
          <h1 className="mb-8 font-serif text-3xl leading-tight text-cream">
            {title}
          </h1>
          {children}
        </div>
      </motion.div>
    </main>
  );
}
