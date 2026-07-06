"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_LUXE } from "./reveal";

/**
 * Brief curtain intro: wordmark fades in, then the whole
 * panel lifts away. Skipped instantly under reduced motion.
 */
export function Preloader() {
  const [done, setDone] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(() => setDone(true), reduceMotion ? 0 : 1500);
    return () => clearTimeout(t);
  }, [reduceMotion]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          aria-hidden
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: EASE_LUXE }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-noir-950"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_LUXE }}
            className="font-serif text-4xl tracking-wide text-cream sm:text-5xl"
          >
            Thé <span className="italic text-gold-400">Noir</span>
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
