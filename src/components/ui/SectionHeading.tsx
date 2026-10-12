"use client";

import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "./Reveal";
import { BlurText } from "./BlurText";

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
        stroke="#6f8466"
        strokeWidth={1.3}
        strokeLinecap="round"
        {...draw}
        transition={{ duration: 1.8, ease: "easeInOut" }}
      />
      {leaves.map((l, i) => (
        <motion.path
          key={i}
          d={l.d}
          fill="#7f9673"
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

/** A small glass "pill" label, like the "New · Introducing…" badge in the hero. */
export function GlassBadge({ children, tag }: { children: React.ReactNode; tag?: string }) {
  return (
    <span className="glass inline-flex items-center gap-2 rounded-full py-1 pr-4 pl-1 text-sm text-white/80">
      {tag && <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-night">{tag}</span>}
      <span className={tag ? "" : "pl-3"}>{children}</span>
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <Reveal>
        <GlassBadge>{eyebrow}</GlassBadge>
      </Reveal>
      <BlurText
        text={title}
        className="mt-6 font-serif text-[clamp(2.6rem,7vw,4.8rem)] leading-[1.02] tracking-[-0.01em] text-white italic text-balance"
      />
      <Vine className="mx-auto mt-5 w-44 opacity-80 sm:w-56" />
      {intro && (
        <Reveal delay={0.2}>
          <p className="mx-auto mt-4 max-w-xl text-[1.05rem] leading-relaxed font-light text-white/65 text-pretty">
            {intro}
          </p>
        </Reveal>
      )}
    </div>
  );
}
