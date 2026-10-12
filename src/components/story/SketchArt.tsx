"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { INK, type Art, type Stroke, type Wash } from "./art";

const norm = (s: string | Stroke): Stroke => (typeof s === "string" ? { d: s } : s);

/** One pencil line that draws itself as `p` moves through [from, to]. */
function Line({ s, p, from, to, light = false }: { s: Stroke; p: MotionValue<number>; from: number; to: number; light?: boolean }) {
  const length = useTransform(p, [from, to], [0, 1]);
  // hide the round line-cap "dot" until the line actually starts
  const visible = useTransform(length, (v) => (v > 0.002 ? 1 : 0));
  const w = (s.w ?? 1.5) * (light ? 0.85 : 1);
  return (
    <motion.g style={{ opacity: visible }}>
      <g opacity={(s.o ?? 0.92) * (light ? 0.8 : 1)}>
        <motion.path d={s.d} style={{ pathLength: length }} strokeWidth={w} />
        {/* a second, lighter pass — the way a pencil sketch is gone over twice */}
        <motion.path
          d={s.d}
          style={{ pathLength: length }}
          strokeWidth={w * 0.55}
          opacity={0.38}
          transform="translate(0.8 0.55) rotate(0.3 200 260)"
        />
      </g>
    </motion.g>
  );
}

function WashLayer({ w, p, from, to }: { w: Wash; p: MotionValue<number>; from: number; to: number }) {
  const opacity = useTransform(p, [from, to], [0, w.o ?? 0.7]);
  return <motion.path d={w.d} fill={w.fill} style={{ opacity }} />;
}

function Hatch({ d, p, from, to, id }: { d: string; p: MotionValue<number>; from: number; to: number; id: string }) {
  const opacity = useTransform(p, [from, to], [0, 0.5]);
  return <motion.path d={d} fill={`url(#${id}-hatch)`} style={{ opacity }} />;
}

/**
 * Renders one storybook illustration. `progress` (0 → 1) drives the drawing:
 * outlines first, then features, then the watercolour washes bleed in and the
 * doodles around her are sketched.
 */
export function SketchArt({
  art,
  progress,
  id,
  image,
  alt,
  className,
}: {
  art: Art;
  progress: MotionValue<number>;
  id: string;
  image?: string;
  alt: string;
  className?: string;
}) {
  const imageClip = useTransform(progress, (v) => `inset(${Math.round((1 - Math.min(1, v * 1.4)) * 100)}% 0 0 0)`);
  const imageOpacity = useTransform(progress, [0, 0.15], [0, 1]);
  const dotOpacity = useTransform(progress, [0.5, 0.66], [0, 1]);

  if (image) {
    return (
      <motion.img
        src={image}
        alt={alt}
        className={`h-full w-full object-contain ${className ?? ""}`}
        style={{ clipPath: imageClip, opacity: imageOpacity }}
      />
    );
  }

  const lines = art.lines.map(norm);
  const decor = art.decor.map(norm);
  const n = lines.length;
  const m = decor.length;

  return (
    <svg viewBox="0 0 400 520" className={className} role="img" aria-label={alt} style={{ overflow: "visible" }}>
      <defs>
        {/* graphite: a slight wobble so lines feel drawn by hand */}
        <filter id={`${id}-pencil`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed={id.length * 7} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" />
        </filter>
        {/* watercolour: soft, bleeding edges */}
        <filter id={`${id}-wc`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="3" seed={id.length * 3} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="10" />
          <feGaussianBlur stdDeviation="1.3" />
        </filter>
        <pattern id={`${id}-hatch`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
          <line x1="0" y1="0" x2="0" y2="5" stroke={INK.line} strokeWidth="0.7" strokeOpacity="0.7" />
        </pattern>
      </defs>

      <g transform={art.transform}>
        <g filter={`url(#${id}-wc)`}>
          {art.decorWashes.map((w, i) => (
            <WashLayer key={`dw${i}`} w={w} p={progress} from={0.62 + i * 0.03} to={0.95} />
          ))}
          {art.washes.map((w, i) => (
            <WashLayer key={`w${i}`} w={w} p={progress} from={0.42 + (i / art.washes.length) * 0.2} to={0.86} />
          ))}
        </g>

        {art.hatches.map((d, i) => (
          <Hatch key={`h${i}`} d={d} p={progress} from={0.6} to={0.92} id={id} />
        ))}

        <g fill="none" stroke={INK.line} strokeLinecap="round" strokeLinejoin="round" filter={`url(#${id}-pencil)`}>
          {lines.map((s, i) => {
            const from = (i / n) * 0.6;
            return <Line key={`l${i}`} s={s} p={progress} from={from} to={Math.min(1, from + 0.3)} />;
          })}
          {decor.map((s, i) => {
            const from = 0.28 + (i / m) * 0.5;
            return <Line key={`d${i}`} s={s} p={progress} from={from} to={Math.min(1, from + 0.22)} light />;
          })}
        </g>

        <motion.g style={{ opacity: dotOpacity }}>
          {art.dots.map((dot, i) => (
            <circle key={i} cx={dot.cx} cy={dot.cy} r={dot.r} fill={dot.fill} />
          ))}
        </motion.g>
      </g>
    </svg>
  );
}
