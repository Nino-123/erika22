"use client";

import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "./Reveal";

/** A delicate vine that draws itself in, with a few leaves and one bud. */
export function Vine({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  const draw = {
    initial: { pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0 },
    whileInView: { pathLength: 1, opacity: 1 },
    viewport: { once: true, amount: 0.6 },
  };
  const leaves = [
    { d: "M58 20 C 62 10, 72 8, 78 10 C 74 18, 66 22, 58 20 Z", delay: 0.6 },
    { d: "M100 22 C 104 32, 114 34, 120 32 C 116 24, 108 20, 100 22 Z", delay: 0.8 },
    { d: "M150 20 C 154 10, 164 8, 170 10 C 166 18, 158 22, 150 20 Z", delay: 1 },
    { d: "M200 22 C 204 32, 214 34, 220 32 C 216 24, 208 20, 200 22 Z", delay: 1.2 },
  ];
  return (
    <svg viewBox="0 0 280 44" className={className} aria-hidden fill="none">
      <motion.path
        d="M8 22 C 50 6, 90 38, 140 22 S 230 6, 272 22"
        stroke="#9cae8c"
        strokeWidth={1.3}
        strokeLinecap="round"
        {...draw}
        transition={{ duration: 1.8, ease: "easeInOut" }}
      />
      {leaves.map((l, i) => (
        <motion.path
          key={i}
          d={l.d}
          fill="#b5c4a6"
          initial={{ opacity: reduced ? 0.9 : 0, scale: reduced ? 1 : 0.4 }}
          whileInView={{ opacity: 0.9, scale: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, delay: reduced ? 0 : l.delay }}
        />
      ))}
      <motion.circle
        cx={140}
        cy={22}
        r={4}
        fill="#f2a7bb"
        initial={{ opacity: reduced ? 1 : 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: reduced ? 0 : 1.4 }}
      />
    </svg>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  tone = "rose",
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  tone?: "rose" | "sage";
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Reveal>
        <p className={`eyebrow ${tone === "rose" ? "text-rose-deep" : "text-sage-deep"}`}>{eyebrow}</p>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="mt-4 font-serif text-[2.6rem] leading-[1.05] font-light text-ink text-balance sm:text-6xl">
          {title}
        </h2>
      </Reveal>
      <Vine className="mx-auto mt-5 w-48 sm:w-60" />
      {intro && (
        <Reveal delay={0.2}>
          <p className="mx-auto mt-5 max-w-xl text-[1.05rem] leading-relaxed text-ink-soft text-pretty">
            {intro}
          </p>
        </Reveal>
      )}
    </div>
  );
}
