"use client";

import { useRef } from "react";
import { useInView } from "motion/react";
import { Bloom, type BloomPalette } from "./Bloom";

export type BedFlower = {
  /** Horizontal position of the stem, in % of the bed width. */
  left: number;
  /** Flower width (any CSS length, clamp() welcome). */
  size: string;
  stem: number;
  palette: BloomPalette;
  delay?: number;
  tilt?: number;
  /** Hide on small screens to keep phones light and uncluttered. */
  desktopOnly?: boolean;
};

/**
 * A row of flowers rooted along the bottom of a section. They bloom one after
 * another the first time the bed scrolls into view, then sway in the breeze.
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

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 bottom-0 ${className}`}
    >
      {flowers.map((f, i) => (
        <div
          key={i}
          className={`absolute bottom-0 -translate-x-1/2 ${f.desktopOnly ? "hidden md:block" : ""}`}
          style={{ left: `${f.left}%` }}
        >
          <div
            className="sway"
            style={
              {
                "--sway-duration": `${5.5 + (i % 4) * 1.1}s`,
                "--sway-delay": `${-(i * 0.9)}s`,
                "--sway": `${1.6 + (i % 3) * 0.7}deg`,
              } as React.CSSProperties
            }
          >
            <Bloom
              id={`${idPrefix}-${i}`}
              open={inView}
              palette={f.palette}
              size={f.size}
              stem={f.stem}
              delay={f.delay ?? i * 0.22}
              tilt={f.tilt}
              duration={2.4}
              className="glow-bloom"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
