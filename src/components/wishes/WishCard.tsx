"use client";

import { motion, useReducedMotion } from "motion/react";
import { Bloom, type BloomPalette } from "@/components/flowers/Bloom";
import type { PublicWish } from "@/lib/wishes";

const TINTS = [
  { bg: "bg-[#fff8f5]", ring: "ring-[#f7cdd7]", palette: "blush" },
  { bg: "bg-[#fdf0f2]", ring: "ring-[#f4c2cf]", palette: "rose" },
  { bg: "bg-[#fff6ef]", ring: "ring-[#f6d3c0]", palette: "peach" },
  { bg: "bg-[#fffbf6]", ring: "ring-[#efdcd0]", palette: "cream" },
] as const satisfies readonly { bg: string; ring: string; palette: BloomPalette }[];

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
      className={`relative mb-6 break-inside-avoid rounded-[22px] ${tint.bg} p-6 pt-7 ring-1 ${tint.ring} shadow-[0_18px_40px_-28px_rgba(122,64,84,0.55)] sm:mb-7`}
      initial={{ opacity: 0, y: reduced ? 0 : 24, scale: reduced ? 1 : 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotate: tilt }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: reduced ? 0.01 : 0.9, delay: reduced ? 0 : (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute -top-5 left-6 w-11 drop-shadow-sm">
        <Bloom id={`wish-${wish.id}`} open palette={tint.palette} size="100%" duration={0.01} />
      </div>

      <p className="text-[1.06rem] leading-relaxed whitespace-pre-line text-ink break-words">{wish.message}</p>

      {wish.memory && (
        <p className="mt-4 border-l-2 border-petal/60 pl-3 font-hand text-xl leading-snug text-rose-deep/90 break-words">
          {wish.memory}
        </p>
      )}

      <footer className="mt-5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-serif text-[1.4rem] leading-tight text-rose-deep italic break-words">— {wish.name}</p>
          {wish.relationship && <p className="eyebrow mt-1 text-ink-soft/80 break-words">{wish.relationship}</p>}
        </div>
        <time className="shrink-0 text-xs text-ink-soft/60" dateTime={wish.created_at}>
          {dateFormat.format(new Date(wish.created_at))}
        </time>
      </footer>
    </motion.article>
  );
}
