"use client";

import { useRef, type CSSProperties } from "react";
import { useInView } from "motion/react";
import { Bloom, type BloomPalette, type BloomSpecies } from "./Bloom";

export type BedFlower = {
  /** Horizontal position of the stem, in % of the bed width. */
  left: number;
  /** Flower width (any CSS length, clamp() welcome). */
  size: string;
  stem: number;
  palette: BloomPalette;
  species?: BloomSpecies;
  delay?: number;
  tilt?: number;
  /** Foreshortening of the open head (1 = from above, ~0.6 = from the side). */
  squash?: number;
  /** < 1 leaves it as a bud that has only begun to open. */
  maxOpen?: number;
  /** 0 = far away (small, dim, soft focus) · 1 = mid · 2 = close to the viewer. */
  depth?: 0 | 1 | 2;
  /** Hide on small screens to keep phones light and uncluttered. */
  desktopOnly?: boolean;
};

const DEPTH_STYLE: Record<0 | 1 | 2, CSSProperties> = {
  0: { filter: "blur(1.4px) brightness(0.62) saturate(0.85)", opacity: 0.8 },
  1: { filter: "brightness(0.86)" },
  2: {},
};

/**
 * A garden bed rooted along the bottom of a section. Flowers bloom one after
 * another the first time the bed scrolls into view, then sway in the breeze.
 * Far flowers are drawn first, so nearer ones overlap them.
 */
export function FlowerBed({
  flowers,
  idPrefix,
  className = "",
}: {
  flowers: BedFlower[];
  idPrefix: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const ordered = flowers.map((f, i) => ({ f, i })).sort((a, b) => (a.f.depth ?? 1) - (b.f.depth ?? 1));

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 bottom-0 ${className}`}
    >
      {ordered.map(({ f, i }) => {
        const depth = f.depth ?? 1;
        return (
          <div
            key={i}
            className={`absolute bottom-0 -translate-x-1/2 ${f.desktopOnly ? "hidden md:block" : ""}`}
            style={{ left: `${f.left}%` }}
          >
            <div
              className="sway"
              style={
                {
                  ...DEPTH_STYLE[depth],
                  "--sway-duration": `${6 + (i % 5) * 0.9}s`,
                  "--sway-delay": `${-(i * 1.3)}s`,
                  "--sway": `${1.2 + (i % 3) * 0.6 + (depth === 2 ? 0.4 : 0)}deg`,
                } as CSSProperties
              }
            >
              <Bloom
                id={`${idPrefix}-${i}`}
                open={inView}
                palette={f.palette}
                species={f.species}
                size={f.size}
                stem={f.stem}
                delay={f.delay ?? 0.2 + ((i * 0.37) % 1.4)}
                tilt={f.tilt}
                squash={f.squash}
                maxOpen={f.maxOpen}
                detail={depth === 0 ? "low" : "high"}
                duration={3}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
