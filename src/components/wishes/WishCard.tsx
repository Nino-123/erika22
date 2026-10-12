"use client";

import { motion, useReducedMotion } from "motion/react";
import { Bloom, type BloomPalette } from "@/components/flowers/Bloom";
import type { PublicWish } from "@/lib/wishes";

const TINTS = [
  { glow: "rgba(244,182,198,0.16)", palette: "blush" },
  { glow: "rgba(224,120,152,0.16)", palette: "rose" },
  { glow: "rgba(246,199,176,0.14)", palette: "peach" },
  { glow: "rgba(253,247,242,0.10)", palette: "cream" },
] as const satisfies readonly { glow: string; palette: BloomPalette }[];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const dateFormat = new Intl.DateTimeFormat("en", { month: "long", day: "numeric" });

export function WishCard({ wish, index }: { wish: PublicWish; index: number }) {
  const reduced = useReducedMotion();
  const h = hash(wish.id);
  const tint = TINTS[h % TINTS.length];
  const tilt = ((h % 5) - 2) * 0.5;

  return (
    <motion.article
      className="glass relative mb-7 break-inside-avoid rounded-[22px] p-6 pt-8"
      style={{ backgroundImage: `radial-gradient(120% 80% at 0% 0%, ${tint.glow}, transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.025))` }}
      initial={{ opacity: 0, y: reduced ? 0 : 24, scale: reduced ? 1 : 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotate: tilt }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: reduced ? 0.01 : 0.9, delay: reduced ? 0 : (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute -top-5 left-6 w-11 drop-shadow-sm">
        <Bloom id={`wish-${wish.id}`} open palette={tint.palette} size="100%" duration={0.01} className="glow-bloom" />
      </div>

      <p className="text-[1.06rem] leading-relaxed font-light whitespace-pre-line text-white/85 break-words">{wish.message}</p>

      {wish.memory && (
        <p className="mt-4 border-l-2 border-petal/50 pl-3 font-hand text-xl leading-snug text-petal/90 break-words">
          {wish.memory}
        </p>
      )}

      <footer className="mt-5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-serif text-[1.5rem] leading-tight text-white italic break-words">— {wish.name}</p>
          {wish.relationship && <p className="eyebrow mt-1 text-white/45 break-words">{wish.relationship}</p>}
        </div>
        <time className="shrink-0 text-xs text-white/40" dateTime={wish.created_at}>
          {dateFormat.format(new Date(wish.created_at))}
        </time>
      </footer>
    </motion.article>
  );
}
