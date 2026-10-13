import type { CSSProperties } from "react";
import { leaf, petals } from "@/components/letter/Botanical";

/**
 * Hand-drawn stationery details for the last page of Her Story: corner
 * sprays, a wax seal, a pressed flower, a small divider, butterflies,
 * sparkles and a signature flourish. Same ink-over-watercolour style as the
 * letter book's botanicals, so everything reads as one illustrated page.
 * All purely decorative (aria-hidden, no pointer events).
 */

const INK = "#7a5560";
const ROSE = "#c98a9b";
const r1 = (n: number) => Math.round(n * 10) / 10;

/** A curving spray of stems, leaves, blossoms and buds, growing from (0, 0) into the corner. */
export function CornerSpray({ className, style, flowers = ["#f4bccb", "#fbe1e6", "#f6d0bd"] }: { className?: string; style?: CSSProperties; flowers?: string[] }) {
  const stems = [
    "M2 4 C 40 10, 80 18, 132 14",
    "M2 4 C 20 30, 30 62, 26 104",
    "M30 12 C 52 30, 70 40, 96 44",
  ];
  const leaves: [number, number, number, number][] = [
    [40, 11, 18, -40],
    [62, 15, 16, 30],
    [88, 16, 14, -35],
    [110, 15, 12, 25],
    [18, 34, 17, 150],
    [24, 58, 15, 30],
    [26, 82, 13, 160],
    [56, 34, 13, -20],
    [76, 41, 11, 40],
  ];
  return (
    <svg viewBox="0 0 150 120" className={className} style={style} aria-hidden fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* watercolour blush behind the blossoms */}
      <circle cx="30" cy="22" r="26" fill="#f6c3cf" opacity="0.22" />
      <circle cx="96" cy="40" r="14" fill="#f9d6c4" opacity="0.25" />
      {stems.map((d, i) => (
        <path key={i} d={d} stroke={INK} strokeWidth={0.9} opacity={0.7} />
      ))}
      {leaves.map(([x, y, len, ang], i) => {
        const l = leaf(x, y, len, ang, 0.36);
        return (
          <g key={i}>
            <path d={l.shape} fill="#b9c8aa" opacity={0.55} />
            <path d={l.shape} stroke={INK} strokeWidth={0.6} opacity={0.6} />
            <path d={l.vein} stroke={INK} strokeWidth={0.4} opacity={0.45} />
          </g>
        );
      })}
      {[
        [28, 20, 12, 6, flowers[0]],
        [96, 43, 7, 5, flowers[1]],
        [132, 14, 6, 5, flowers[2]],
      ].map(([x, y, r, n, fill], i) => (
        <g key={i}>
          <path d={petals(x as number, y as number, r as number, n as number, i * 0.6)} fill={fill as string} opacity={0.85} />
          <path d={petals(x as number, y as number, r as number, n as number, i * 0.6)} stroke={INK} strokeWidth={0.6} opacity={0.6} />
          <circle cx={x as number} cy={y as number} r={(r as number) * 0.2} fill="#e7c486" />
        </g>
      ))}
      {/* buds */}
      {[
        [26, 104, 180],
        [56, 22, -30],
      ].map(([x, y, a], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
          <path d="M0 0 C -3 -3, -3 -8, 0 -10 C 3 -8, 3 -3, 0 0Z" fill="#f2adc0" stroke={INK} strokeWidth={0.5} />
        </g>
      ))}
      {/* tiny berries */}
      {[
        [116, 26],
        [121, 30],
        [112, 31],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.6} fill="#d98aa3" opacity={0.8} />
      ))}
    </svg>
  );
}

/** A small dusty-rose wax seal pressed with a five-petal flower. */
export function WaxSeal({ className, style }: { className?: string; style?: CSSProperties }) {
  const blob =
    "M24 3 C 31 2, 38 6, 42 12 C 46 17, 46 25, 44 31 C 42 38, 36 44, 28 45 C 20 47, 11 44, 7 37 C 2 31, 2 22, 5 15 C 8 8, 16 4, 24 3 Z";
  return (
    <svg viewBox="0 0 48 48" className={className} style={style} aria-hidden>
      <defs>
        <radialGradient id="seal-wax" cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#e7a4b4" />
          <stop offset="0.6" stopColor="#c9798f" />
          <stop offset="1" stopColor="#a65a71" />
        </radialGradient>
      </defs>
      <path d={blob} fill="#7e3f52" opacity="0.25" transform="translate(1 1.5)" />
      <path d={blob} fill="url(#seal-wax)" />
      <circle cx="24" cy="24" r="13.5" fill="none" stroke="#8f4a5f" strokeOpacity="0.45" strokeWidth="1.2" />
      <path d={petals(24, 24, 8, 5, 0.3, 1.2)} fill="#b8657d" opacity="0.55" />
      <path d={petals(24, 24, 8, 5, 0.3, 1.2)} fill="none" stroke="#f3c7d3" strokeOpacity="0.55" strokeWidth="0.6" />
      <circle cx="24" cy="24" r="1.8" fill="#f3c7d3" opacity="0.7" />
      <path d="M13 13 C 16 10, 20 9, 23 9" stroke="#fbe1e6" strokeOpacity="0.55" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** A tiny pressed flower on a stem, for beside the eyebrow. */
export function PressedFlower({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 30" className={className} aria-hidden fill="none" strokeLinecap="round">
      <path d="M6 28 C 9 20, 12 14, 17 9" stroke={INK} strokeWidth="0.8" opacity="0.7" />
      <path d={leaf(9, 21, 8, 200, 0.4).shape} fill="#b9c8aa" stroke={INK} strokeWidth="0.4" opacity="0.8" />
      <path d={leaf(12, 16, 7, -20, 0.4).shape} fill="#b9c8aa" stroke={INK} strokeWidth="0.4" opacity="0.8" />
      <path d={petals(18, 8, 6, 5, 0.2)} fill="#f2b0c1" opacity="0.85" />
      <path d={petals(18, 8, 6, 5, 0.2)} stroke={INK} strokeWidth="0.45" opacity="0.6" />
      <circle cx="18" cy="8" r="1.3" fill="#e7c486" />
    </svg>
  );
}

/** A fine line – small blossom – fine line divider. */
export function LetterDivider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 16" className={className} aria-hidden fill="none" strokeLinecap="round">
      <path d="M4 8 C 30 6, 50 10, 66 8" stroke={ROSE} strokeWidth="0.8" opacity="0.7" />
      <path d="M94 8 C 110 6, 130 10, 156 8" stroke={ROSE} strokeWidth="0.8" opacity="0.7" />
      <path d={leaf(68, 8, 8, 160, 0.4).shape} fill="#b9c8aa" opacity="0.8" />
      <path d={leaf(92, 8, 8, 20, 0.4).shape} fill="#b9c8aa" opacity="0.8" />
      <path d={petals(80, 8, 6, 5, 0.3)} fill="#f2b0c1" opacity="0.85" />
      <path d={petals(80, 8, 6, 5, 0.3)} stroke={INK} strokeWidth="0.45" opacity="0.55" />
      <circle cx="80" cy="8" r="1.3" fill="#e7c486" />
    </svg>
  );
}

/** A hand-drawn butterfly with a blush wash in its wings. */
export function Butterfly({ className, style, tone = "#f6c3cf" }: { className?: string; style?: CSSProperties; tone?: string }) {
  return (
    <svg viewBox="-20 -16 40 32" className={className} style={style} aria-hidden fill="none" strokeLinecap="round" strokeLinejoin="round">
      <g className="butterfly-wings">
        <path d="M0 0 C -6 -12, -18 -14, -17 -5 C -16 1, -8 2, 0 0Z" fill={tone} opacity="0.7" />
        <path d="M0 0 C 6 -12, 18 -14, 17 -5 C 16 1, 8 2, 0 0Z" fill={tone} opacity="0.7" />
        <path d="M0 1 C -5 4, -12 10, -8 13 C -4 14, -1 7, 0 1Z" fill={tone} opacity="0.55" />
        <path d="M0 1 C 5 4, 12 10, 8 13 C 4 14, 1 7, 0 1Z" fill={tone} opacity="0.55" />
        <path d="M0 0 C -6 -12, -18 -14, -17 -5 C -16 1, -8 2, 0 0Z M0 0 C 6 -12, 18 -14, 17 -5 C 16 1, 8 2, 0 0Z M0 1 C -5 4, -12 10, -8 13 C -4 14, -1 7, 0 1Z M0 1 C 5 4, 12 10, 8 13 C 4 14, 1 7, 0 1Z" stroke={INK} strokeWidth="0.6" opacity="0.7" />
      </g>
      <path d="M0 -4 L0 8" stroke={INK} strokeWidth="1.1" />
      <path d="M0 -4 C -2 -8, -4 -10, -6 -11 M0 -4 C 2 -8, 4 -10, 6 -11" stroke={INK} strokeWidth="0.5" />
    </svg>
  );
}

/** A four-pointed sparkle that softly twinkles. */
export function Sparkle({ className, style, delay = 0 }: { className?: string; style?: CSSProperties; delay?: number }) {
  return (
    <svg viewBox="-10 -10 20 20" className={`letter-sparkle ${className ?? ""}`} style={{ animationDelay: `${delay}s`, ...style }} aria-hidden>
      <path d="M0 -9 C 1 -2, 2 -1, 9 0 C 2 1, 1 2, 0 9 C -1 2, -2 1, -9 0 C -2 -1, -1 -2, 0 -9Z" fill="#e7c486" opacity="0.9" />
    </svg>
  );
}

/** A slender hand-drawn stem with leaves and small blooms, rising from the bottom edge. */
export function SideStem({ className, style, flip = false }: { className?: string; style?: CSSProperties; flip?: boolean }) {
  const leaves: [number, number, number, number][] = [
    [21, 150, 16, 200],
    [19, 126, 15, -30],
    [16, 100, 13, 210],
    [15, 76, 12, -40],
  ];
  return (
    <svg viewBox="0 0 40 180" className={className} style={{ transform: flip ? "scaleX(-1)" : undefined, ...style }} aria-hidden fill="none" strokeLinecap="round">
      <path d="M22 180 C 22 140, 14 100, 16 50 C 17 34, 20 24, 24 16" stroke={INK} strokeWidth="0.9" opacity="0.7" />
      <path d="M17 64 C 10 56, 6 48, 6 40" stroke={INK} strokeWidth="0.7" opacity="0.6" />
      {leaves.map(([x, y, len, ang], i) => {
        const l = leaf(x, y, len, ang, 0.36);
        return (
          <g key={i}>
            <path d={l.shape} fill="#b9c8aa" opacity={0.55} />
            <path d={l.shape} stroke={INK} strokeWidth={0.55} opacity={0.6} />
          </g>
        );
      })}
      <path d={petals(24, 14, 7, 6, 0.4)} fill="#f4bccb" opacity="0.85" />
      <path d={petals(24, 14, 7, 6, 0.4)} stroke={INK} strokeWidth="0.5" opacity="0.6" />
      <circle cx="24" cy="14" r="1.4" fill="#e7c486" />
      <g transform="translate(6 40) rotate(-20)">
        <path d="M0 0 C -2.5 -3, -2.5 -7, 0 -9 C 2.5 -7, 2.5 -3, 0 0Z" fill="#f2adc0" stroke={INK} strokeWidth="0.45" />
      </g>
    </svg>
  );
}

/** Tiny ink daisies to tuck around the bottom blooms. */
export function TinyDaisies({ className, style }: { className?: string; style?: CSSProperties }) {
  const items = [
    [10, 30, 5],
    [26, 24, 6.5],
    [42, 32, 4.5],
  ];
  return (
    <svg viewBox="0 0 52 44" className={className} style={style} aria-hidden fill="none" strokeLinecap="round">
      {items.map(([x, y, r], i) => (
        <g key={i}>
          <path d={`M${x} 44 Q ${x - 2} ${r1((44 + y) / 2)} ${x} ${y}`} stroke={INK} strokeWidth="0.6" opacity="0.6" />
          <path d={petals(x, y, r, 8, i * 0.3, 1.15)} fill="#fffaf3" />
          <path d={petals(x, y, r, 8, i * 0.3, 1.15)} stroke={INK} strokeWidth="0.45" opacity="0.6" />
          <circle cx={x} cy={y} r={r * 0.28} fill="#e7c486" />
        </g>
      ))}
    </svg>
  );
}

/** The underline flourish beneath the signature. */
export function Flourish({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 18" className={className} aria-hidden fill="none" strokeLinecap="round">
      <path d="M4 12 C 30 4, 60 16, 88 9 C 104 5, 118 6, 128 10 C 132 12, 130 15, 126 14" stroke={ROSE} strokeWidth="1.1" opacity="0.8" />
      <path d={petals(118, 6, 3.4, 5, 0.2)} fill="#f2b0c1" opacity="0.85" />
    </svg>
  );
}
