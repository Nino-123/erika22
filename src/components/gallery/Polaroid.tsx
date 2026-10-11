"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import type { Photo } from "@/content/site";

const ASPECT: Record<Photo["aspect"], string> = {
  portrait: "aspect-[4/5]",
  landscape: "aspect-[4/3]",
  square: "aspect-square",
};

const TILTS = [-2.4, 1.8, -1.2, 2.6, -2, 1.2];

/** A small flower "sticker" pinned to some polaroids. */
function FlowerPin({ className }: { className: string }) {
  return (
    <svg viewBox="-20 -20 40 40" className={className} aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <ellipse key={i} cx={0} cy={-9} rx={6} ry={9} fill="#f6bccb" transform={`rotate(${i * 72})`} />
      ))}
      <circle r={5} fill="#f1cd86" />
    </svg>
  );
}

export function Polaroid({
  photo,
  index,
  onOpen,
}: {
  photo: Photo;
  index: number;
  onOpen: () => void;
}) {
  const reduced = useReducedMotion();
  const tilt = TILTS[index % TILTS.length];
  const decoration = index % 3;

  return (
    <motion.div
      className="mb-8 break-inside-avoid sm:mb-10"
      initial={{ opacity: 0, y: reduced ? 0 : 30, rotate: reduced ? tilt : tilt * 2 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: reduced ? 0.01 : 1, delay: reduced ? 0 : (index % 3) * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open photo${photo.caption ? `: ${photo.caption}` : ""}`}
        className="group relative block w-full cursor-zoom-in text-left transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1.5 hover:rotate-[0.001deg] focus-visible:-translate-y-1.5"
      >
        <figure className="relative rounded-[3px] bg-[#fffdf9] p-2.5 pb-3 shadow-[0_18px_40px_-20px_rgba(122,64,84,0.45),0_2px_6px_rgba(122,64,84,0.08)] transition-shadow duration-500 group-hover:shadow-[0_28px_50px_-20px_rgba(122,64,84,0.5)] sm:p-3.5 sm:pb-4">
          <div className={`relative overflow-hidden rounded-[2px] bg-blush ${ASPECT[photo.aspect]}`}>
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 30vw"
              className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.05]"
              unoptimized={photo.src.endsWith(".svg")}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#f7cdd7]/25 via-transparent to-[#fff6ea]/20 mix-blend-soft-light" />
          </div>
          {photo.caption && (
            <figcaption className="mt-3 px-1 text-center font-hand text-[1.35rem] leading-snug text-ink/85">
              {photo.caption}
            </figcaption>
          )}
        </figure>

        {/* decorations: washi tape, or a little flower pin */}
        {decoration === 0 && (
          <span
            aria-hidden
            className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-[-4deg] bg-[#f7cdd7]/75 shadow-sm backdrop-blur-[1px]"
          />
        )}
        {decoration === 1 && <FlowerPin className="absolute -top-3 -right-3 h-9 w-9 drop-shadow" />}
        {decoration === 2 && (
          <span
            aria-hidden
            className="absolute -top-2.5 -left-4 h-5 w-16 rotate-[-28deg] bg-[#e2ead9]/80 shadow-sm"
          />
        )}
      </button>
    </motion.div>
  );
}
