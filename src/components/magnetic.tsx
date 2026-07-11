"use client";

import { useRef, useState, type ComponentPropsWithoutRef, type MouseEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Primary CTAs nudge a few px toward the cursor on hover, like a magnet —
// a hand-placed detail rather than a stock hover:scale utility.
type MagneticProps = Omit<
  ComponentPropsWithoutRef<"a">,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
> & { strength?: number };

export function Magnetic({
  strength = 0.3,
  className,
  children,
  ...props
}: MagneticProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduceMotion = useReducedMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  function handleMove(e: MouseEvent<HTMLAnchorElement>) {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setOffset({
      x: (e.clientX - rect.left - rect.width / 2) * strength,
      y: (e.clientY - rect.top - rect.height / 2) * strength,
    });
  }

  function handleLeave() {
    setOffset({ x: 0, y: 0 });
  }

  return (
    <motion.a
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 200, damping: 15, mass: 0.4 }}
      className={className}
      {...props}
    >
      {children}
    </motion.a>
  );
}
