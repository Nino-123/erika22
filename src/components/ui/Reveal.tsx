"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/** Fades and lifts its children into place the first time they scroll into view. */
export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
  amount = 0.2,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  amount?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : y, filter: reduced ? "none" : "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount }}
      transition={{ duration: reduced ? 0.01 : 1.1, ease: [0.16, 1, 0.3, 1], delay: reduced ? 0 : delay }}
    >
      {children}
    </motion.div>
  );
}
