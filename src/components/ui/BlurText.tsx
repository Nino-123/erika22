"use client";

import { motion, useReducedMotion } from "motion/react";
import { DUR, EASE_OUT, STAGGER, staggerWithin } from "@/lib/motion";

type Tag = "h1" | "h2" | "h3" | "p";

/**
 * Headline that resolves word by word out of a soft blur — the Prism-style
 * reveal. Screen readers get the whole sentence at once.
 */
export function BlurText({
  text,
  as = "h2",
  className,
  delay = 0,
  /** "view": plays when scrolled into view. "mount": plays when `play` is true. */
  trigger = "view",
  play = true,
}: {
  text: string;
  as?: Tag;
  className?: string;
  delay?: number;
  trigger?: "view" | "mount";
  play?: boolean;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  const step = staggerWithin(words.length, STAGGER.dramatic);
  const Component = motion[as];

  const hidden = { opacity: 0, y: reduced ? 0 : 14, filter: reduced ? "blur(0px)" : "blur(14px)" };
  const shown = { opacity: 1, y: 0, filter: "blur(0px)" };

  return (
    <Component
      className={className}
      aria-label={text}
      initial="hidden"
      {...(trigger === "view"
        ? { whileInView: "shown", viewport: { once: true, amount: 0.5 } }
        : { animate: play ? "shown" : "hidden" })}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block whitespace-pre will-change-[filter,transform]"
          variants={{ hidden, shown }}
          transition={{
            duration: reduced ? 0.01 : DUR.reveal,
            delay: reduced ? 0 : delay + i * step,
            ease: EASE_OUT,
          }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </Component>
  );
}
