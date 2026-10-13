"use client";

import { motion, useReducedMotion } from "motion/react";
import { Pin } from "lucide-react";
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

const dateFormats = new Map<string, Intl.DateTimeFormat>();
const formatDate = (iso: string, locale: string) => {
  if (!dateFormats.has(locale)) dateFormats.set(locale, new Intl.DateTimeFormat(locale, { month: "long", day: "numeric" }));
  return dateFormats.get(locale)!.format(new Date(iso));
};

export function WishCard({
  wish,
  index,
  locale = "en",
  pinned,
}: {
  wish: PublicWish;
  index: number;
  locale?: string;
  /** When set, the card is pinned: a warm gold edge and this badge text. */
  pinned?: string;
}) {
  const reduced = useReducedMotion();
  const h = hash(wish.id);
  const tint = TINTS[h % TINTS.length];
  const tilt = pinned ? 0 : ((h % 5) - 2) * 0.5;

  return (
    // the outer padding holds the overhanging flower inside the column, so a
    // card at the top of a column never has its flower pushed down onto the text
    <div className="break-inside-avoid pt-7">
      <motion.article
        className={`glass relative h-full rounded-[22px] p-6 pt-12 ${pinned ? "border-gold/45! shadow-[0_0_44px_-12px_rgba(231,196,134,0.45)]" : ""}`}
        style={{
          backgroundImage: pinned
            ? "radial-gradient(120% 80% at 0% 0%, rgba(231,196,134,0.16), transparent 60%), radial-gradient(90% 70% at 100% 100%, rgba(244,182,198,0.12), transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03))"
            : `radial-gradient(120% 80% at 0% 0%, ${tint.glow}, transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.025))`,
        }}
        initial={{ opacity: 0, y: reduced ? 0 : 24, scale: reduced ? 1 : 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1, rotate: tilt }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: reduced ? 0.01 : 0.9, delay: reduced ? 0 : (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        {pinned && (
          <span className="absolute top-3.5 right-4 inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-[0.7rem] font-medium tracking-wider text-gold uppercase">
            <Pin className="h-3 w-3 fill-current" aria-hidden />
            {pinned}
          </span>
        )}
        {/* sits on the card's top edge, clear of the message */}
        <div className="pointer-events-none absolute -top-7 left-4 w-12">
          <Bloom
            id={`wish-${wish.id}`}
            open
            palette={tint.palette}
            species={(["peony", "rose", "anemone"] as const)[h % 3]}
            squash={0.85}
            detail="low"
            size="100%"
            duration={0.01}
            glow={false}
          />
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
            {formatDate(wish.created_at, locale)}
          </time>
        </footer>
      </motion.article>
    </div>
  );
}
