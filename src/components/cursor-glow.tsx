"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

// A soft gold glow that trails the cursor across every section — the one
// thing that makes the whole page feel alive rather than a static screenshot.
// Desktop mouse only: skipped on touch devices and under reduced motion.
export function CursorGlow() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const springX = useSpring(x, { damping: 34, stiffness: 180, mass: 0.6 });
  const springY = useSpring(y, { damping: 34, stiffness: 180, mass: 0.6 });

  useEffect(() => {
    if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;

    function onMove(e: MouseEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
      setActive(true);
    }
    function onLeave() {
      setActive(false);
    }

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [reduceMotion, x, y]);

  if (reduceMotion) return null;

  return (
    <motion.div
      aria-hidden
      style={{ left: springX, top: springY, opacity: active ? 1 : 0 }}
      // soft-light blends this as warm ambient light rather than a flat tint,
      // so it reads correctly over both bare background and product photos
      className="pointer-events-none fixed z-0 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-400/40 mix-blend-soft-light blur-[110px] transition-opacity duration-700"
    />
  );
}
