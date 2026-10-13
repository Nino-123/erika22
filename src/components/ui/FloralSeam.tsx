import type { CSSProperties } from "react";
import { leaf, petals } from "@/components/letter/Botanical";

type Variant = "foliage" | "petals" | "roses" | "glow";

const r1 = (n: number) => Math.round(n * 10) / 10;

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

type Pt = [number, number];
const bez = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
};

const PALETTES: Record<Variant, { blooms: string[]; flowers: number; glow: string }> = {
  foliage: { blooms: ["#f2b0c1", "#fbe1e6", "#f6d2c2"], flowers: 0.5, glow: "rgba(244,182,198,0.35)" },
  petals: { blooms: ["#f2b0c1", "#f9d0bd", "#fbe1e6"], flowers: 0.75, glow: "rgba(249,208,189,0.35)" },
  roses: { blooms: ["#ee9fb5", "#fbe1e6", "#f9d0bd", "#e98fa9"], flowers: 1, glow: "rgba(238,159,181,0.38)" },
  glow: { blooms: ["#f6c3cf", "#ffd9c9", "#fff1ee"], flowers: 0.85, glow: "rgba(255,217,201,0.45)" },
};

type Bloom = { x: number; y: number; r: number; n: number; fill: string; turn: number; glow: boolean };

/**
 * One side's arrangement: several vines curving in from the edge, leaves
 * along each (larger near the root), blossom clusters and buds near the tips.
 * Seeded per variant and side, so left and right are related but not mirrored.
 */
function arrangement(variant: Variant, side: number) {
  const r = seeded((variant.length * 131 + side * 977 + 17) * 7);
  const pal = PALETTES[variant];
  const vines: { d: string; w: number; o: number }[] = [];
  const leaves: { shape: string; vein: string; tone: number; o: number }[] = [];
  const blooms: Bloom[] = [];
  const buds: { x: number; y: number; a: number }[] = [];

  const count = 6;
  for (let v = 0; v < count; v++) {
    const back = v % 3 === 0; // a few dimmer vines behind, for depth
    const y0 = 70 + r() * 110;
    const len = 250 + r() * 260;
    const y3 = 40 + r() * 150;
    const p0: Pt = [-6, y0];
    const p1: Pt = [len * 0.3, y0 + (r() - 0.5) * 90];
    const p2: Pt = [len * 0.65, y3 + (r() - 0.5) * 100];
    const p3: Pt = [len, y3];
    vines.push({ d: `M${r1(p0[0])} ${r1(p0[1])} C${r1(p1[0])} ${r1(p1[1])} ${r1(p2[0])} ${r1(p2[1])} ${r1(p3[0])} ${r1(p3[1])}`, w: back ? 0.9 : 1.3, o: back ? 0.4 : 0.7 });

    // leaves, alternating sides, shrinking toward the tip
    const nLeaves = 7 + Math.floor(r() * 5);
    for (let k = 0; k < nLeaves; k++) {
      const t = 0.08 + (k / nLeaves) * 0.84 + r() * 0.04;
      const [x, y] = bez(p0, p1, p2, p3, t);
      const [x2, y2] = bez(p0, p1, p2, p3, Math.min(1, t + 0.02));
      const along = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
      const sideSign = k % 2 ? 1 : -1;
      const angle = along + sideSign * (40 + r() * 30);
      const size = (24 - t * 12) * (0.75 + r() * 0.5) * (back ? 0.8 : 1);
      const l = leaf(x, y, size, angle, 0.32 + r() * 0.1);
      leaves.push({ shape: l.shape, vein: l.vein, tone: Math.floor(r() * 3), o: back ? 0.38 : 0.62 + r() * 0.2 });
    }

    // blossoms clustered toward the tip, and a bud or two
    if (!back && r() < 0.45 + pal.flowers * 0.55) {
      const nb = 1 + Math.floor(r() * (1 + pal.flowers * 2.4));
      for (let b = 0; b < nb; b++) {
        const t = 0.6 + r() * 0.4;
        const [x, y] = bez(p0, p1, p2, p3, t);
        blooms.push({
          x: x + (r() - 0.5) * 18,
          y: y + (r() - 0.5) * 16,
          r: 7 + r() * 10 * (b === 0 ? 1.35 : 1),
          n: 5 + Math.floor(r() * 3),
          fill: pal.blooms[Math.floor(r() * pal.blooms.length)],
          turn: r() * 2,
          glow: b === 0 && r() < 0.6,
        });
      }
    }
    const [bx, by] = p3;
    buds.push({ x: bx, y: by, a: (Math.atan2(p3[1] - p2[1], p3[0] - p2[0]) * 180) / Math.PI + 90 });
    if (r() < 0.5) {
      const [x, y] = bez(p0, p1, p2, p3, 0.45 + r() * 0.2);
      buds.push({ x, y: y - 4, a: -20 + r() * 40 });
    }
  }
  return { vines, leaves, blooms, buds };
}

const ARRANGEMENTS = Object.fromEntries(
  (["foliage", "petals", "roses", "glow"] as Variant[]).map((v) => [v, [arrangement(v, 0), arrangement(v, 1)]]),
) as Record<Variant, ReturnType<typeof arrangement>[]>;

const LEAF_TONES = ["#40543b", "#4b6243", "#56704c"];

// loose petals drifting past the vines: [x, y, delay s, duration s]
const DRIFT: [number, number, number, number][] = [
  [330, 70, 0, 9],
  [410, 150, -3.5, 11],
  [250, 190, -6, 10],
];

function Cluster({ variant, side }: { variant: Variant; side: 0 | 1 }) {
  const a = ARRANGEMENTS[variant][side];
  const pal = PALETTES[variant];
  return (
    <div
      className={`absolute top-1/2 w-[40vw] max-w-[560px] min-w-[150px] -translate-y-1/2 opacity-80 sm:w-[44vw] sm:opacity-100 ${side ? "right-0 -scale-x-100" : "left-0"}`}
    >
      <div
        className="sway"
        style={{ transformOrigin: "0% 55%", "--sway": "0.9deg", "--sway-duration": side ? "13s" : "11s", "--sway-delay": side ? "-4s" : "0s" } as CSSProperties}
      >
        <svg viewBox="0 0 560 240" className="h-auto w-full overflow-visible" fill="none" strokeLinecap="round">
          {a.vines.map((v, i) => (
            <path key={i} d={v.d} stroke="#5d7552" strokeWidth={v.w} opacity={v.o} />
          ))}
          {a.leaves.map((l, i) => (
            <g key={i} opacity={l.o}>
              <path d={l.shape} fill={LEAF_TONES[l.tone]} stroke="#7f9673" strokeWidth={0.5} strokeOpacity={0.5} />
              <path d={l.vein} stroke="#8aa17c" strokeWidth={0.45} opacity={0.5} />
            </g>
          ))}
          {a.buds.map((b, i) => (
            <g key={i} transform={`translate(${r1(b.x)} ${r1(b.y)}) rotate(${r1(b.a)})`}>
              <path d="M0 0 C -3 -3, -3 -8, 0 -10 C 3 -8, 3 -3, 0 0Z" fill="#f2adc0" opacity={0.85} />
              <path d="M0 0 C -2 -2, -3 -4, -3.5 -5 M0 0 C 2 -2, 3 -4, 3.5 -5" stroke="#5d7552" strokeWidth={1} />
            </g>
          ))}
          {a.blooms.map((b, i) => (
            <g key={i}>
              {b.glow && (
                <circle
                  cx={r1(b.x)}
                  cy={r1(b.y)}
                  r={r1(b.r * 2.6)}
                  fill={`url(#seam-glow-${variant})`}
                  className="seam-glow"
                  style={{ animationDelay: `${-i * 1.3}s` }}
                />
              )}
              <path d={petals(b.x, b.y, b.r, b.n, b.turn)} fill={b.fill} opacity={0.82} />
              <path d={petals(b.x, b.y, b.r, b.n, b.turn)} stroke="#fde9ee" strokeWidth={0.6} opacity={0.4} />
              <circle cx={r1(b.x)} cy={r1(b.y)} r={r1(b.r * 0.2)} fill="#f1cd86" opacity={0.85} />
            </g>
          ))}
          <defs>
            <radialGradient id={`seam-glow-${variant}`}>
              <stop offset="0" stopColor={pal.glow} />
              <stop offset="1" stopColor={pal.glow} stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* a few loose petals drifting past */}
          {DRIFT.map(([x, y, delay, dur], i) => (
            <path
              key={i}
              d="M0 0 C5 -3 6 -11 0 -14 C-6 -11 -5 -3 0 0Z"
              fill="#f4b6c6"
              className="seam-petal"
              style={{ "--x": `${x}px`, "--y": `${y}px`, animationDelay: `${delay}s`, animationDuration: `${dur}s` } as CSSProperties}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

/**
 * Sits on the boundary between two chapters: a soft mist plus vines, leaves
 * and blossoms growing in from both edges, so one chapter flows into the next
 * instead of ending at a hard line. Overlaps both sections without adding
 * height, keeps the centre clear for the headings, and ignores clicks.
 */
export function FloralSeam({ variant = "foliage", glow = "rgba(244,170,192,0.12)" }: { variant?: Variant; glow?: string }) {
  return (
    <div aria-hidden className="pointer-events-none relative z-[6] -my-28 h-56 overflow-x-clip">
      <div className="absolute inset-0" style={{ background: `radial-gradient(55% 50% at 50% 50%, ${glow}, transparent 72%)` }} />
      <Cluster variant={variant} side={0} />
      <Cluster variant={variant} side={1} />
    </div>
  );
}
