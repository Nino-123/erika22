import type { CSSProperties } from "react";
import { leaf, petals } from "@/components/letter/Botanical";

type Variant = "foliage" | "petals" | "roses" | "glow";

const BLOOMS: Record<Variant, { x: number; y: number; r: number; n: number; fill: string }[]> = {
  foliage: [
    { x: 236, y: 98, r: 13, n: 5, fill: "#f2b0c1" },
    { x: 172, y: 70, r: 8, n: 5, fill: "#fbe1e6" },
  ],
  petals: [
    { x: 232, y: 96, r: 17, n: 6, fill: "#f2b0c1" },
    { x: 262, y: 150, r: 12, n: 5, fill: "#f9d0bd" },
  ],
  roses: [
    { x: 230, y: 96, r: 19, n: 7, fill: "#ee9fb5" },
    { x: 172, y: 70, r: 11, n: 5, fill: "#fbe1e6" },
    { x: 262, y: 150, r: 13, n: 6, fill: "#f9d0bd" },
  ],
  glow: [
    { x: 232, y: 96, r: 18, n: 6, fill: "#f6c3cf" },
    { x: 262, y: 150, r: 15, n: 7, fill: "#ffd9c9" },
    { x: 172, y: 70, r: 10, n: 5, fill: "#fff1ee" },
  ],
};

const STEMS = [
  "M0 150 C 80 140, 150 122, 232 96",
  "M0 120 C 60 118, 120 96, 172 70",
  "M0 182 C 90 178, 170 164, 262 150",
];

const LEAVES: [number, number, number, number][] = [
  [60, 140, 26, -60],
  [110, 128, 22, 40],
  [150, 118, 20, -70],
  [50, 116, 20, 60],
  [100, 100, 18, -50],
  [80, 178, 24, -40],
  [150, 170, 22, 50],
  [205, 160, 18, -60],
];

/** One cluster of foliage and blooms growing in from a side of the page. */
function Cluster({ variant, side }: { variant: Variant; side: "left" | "right" }) {
  return (
    <div
      className={`absolute top-1/2 w-[46vw] max-w-[420px] -translate-y-1/2 ${side === "left" ? "left-0" : "right-0 -scale-x-100"}`}
    >
      <div
        className="sway"
        style={{ transformOrigin: "0% 60%", "--sway": "0.8deg", "--sway-duration": side === "left" ? "11s" : "13s" } as CSSProperties}
      >
        <svg viewBox="0 0 420 220" className="h-auto w-full" fill="none" strokeLinecap="round">
          {STEMS.map((d, i) => (
            <path key={i} d={d} stroke="#4f6347" strokeWidth={1.4} opacity={0.65} />
          ))}
          {LEAVES.map(([x, y, len, ang], i) => {
            const l = leaf(x, y, len, ang, 0.34);
            return <path key={i} d={l.shape} fill="#40543b" opacity={0.6} stroke="#6f8466" strokeWidth={0.6} strokeOpacity={0.5} />;
          })}
          {BLOOMS[variant].map((b, i) => (
            <g key={i}>
              <circle cx={b.x} cy={b.y} r={b.r * 2.2} fill={b.fill} opacity={0.1} />
              <path d={petals(b.x, b.y, b.r, b.n, i * 0.5)} fill={b.fill} opacity={0.5} />
              <path d={petals(b.x, b.y, b.r, b.n, i * 0.5)} stroke="#fde9ee" strokeWidth={0.6} opacity={0.35} />
              <circle cx={b.x} cy={b.y} r={b.r * 0.18} fill="#f1cd86" opacity={0.75} />
            </g>
          ))}
          {/* loose petals drifting toward the middle */}
          {[
            [300, 120, 30],
            [336, 92, -20],
            [360, 140, 70],
          ].map(([x, y, a], i) => (
            <path
              key={i}
              d="M0 0 C5 -3 6 -11 0 -14 C-6 -11 -5 -3 0 0Z"
              fill="#f4b6c6"
              opacity={0.35 - i * 0.08}
              transform={`translate(${x} ${y}) rotate(${a})`}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

/**
 * Sits on the boundary between two chapters: a soft mist plus foliage growing
 * in from both edges, so one section flows into the next instead of ending
 * at a hard line. Never covers text (it hugs the sides) and ignores clicks.
 */
export function FloralSeam({ variant = "foliage", glow = "rgba(244,170,192,0.12)" }: { variant?: Variant; glow?: string }) {
  return (
    <div aria-hidden className="pointer-events-none relative z-[6] -my-28 h-56 overflow-hidden">
      <div className="absolute inset-0" style={{ background: `radial-gradient(55% 50% at 50% 50%, ${glow}, transparent 72%)` }} />
      <Cluster variant={variant} side="left" />
      <Cluster variant={variant} side="right" />
    </div>
  );
}
