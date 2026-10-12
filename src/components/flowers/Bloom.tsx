import type { CSSProperties } from "react";

/**
 * Botanical SVG flowers.
 *
 * Every petal is generated with an organic, slightly asymmetric outline
 * (ruffled, scalloped or notched edges), its own colour variation, a sheen
 * where it curves toward the light, faint veins and a rim of light. Petals
 * open individually — outer layers first, the heart last — so the bloom is
 * real, not a scaled picture. Geometry is generated from a seed, so flowers
 * are varied but render identically on the server and in the browser.
 */

export type BloomPalette = "blush" | "rose" | "peach" | "cream";
export type BloomSpecies = "peony" | "rose" | "anemone";

type Pt = [number, number];
const r2 = (n: number) => Math.round(n * 100) / 100;

function rng(seed: number) {
  let s = (Math.abs(Math.floor(seed)) % 2147483646) + 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashString(s: string) {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Smooth closed curve through the points (Catmull-Rom → cubic Béziers). */
function smoothClosed(p: Pt[]) {
  const n = p.length;
  let d = `M${r2(p[0][0])} ${r2(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n];
    const p1 = p[i];
    const p2 = p[(i + 1) % n];
    const p3 = p[(i + 2) % n];
    d += ` C${r2(p1[0] + (p2[0] - p0[0]) / 6)} ${r2(p1[1] + (p2[1] - p0[1]) / 6)} ${r2(p2[0] - (p3[0] - p1[0]) / 6)} ${r2(p2[1] - (p3[1] - p1[1]) / 6)} ${r2(p2[0])} ${r2(p2[1])}`;
  }
  return `${d}Z`;
}

type TipKind = "round" | "scallop" | "notch" | "point";

/** Outline of one petal (or leaf), base at the origin, pointing up. */
function petalPoints(rand: () => number, L: number, W: number, widest: number, tip: TipKind, ruffle: number, lobes = 3): Pt[] {
  const skew = (rand() - 0.5) * W * 0.14;
  const end = 0.86;
  const side = (sign: 1 | -1) => {
    const pts: Pt[] = [];
    const steps = 5;
    for (let i = 1; i <= steps; i++) {
      const t = (i / steps) * end;
      const prof =
        t < widest
          ? 0.16 + 0.84 * Math.pow(Math.sin((t / widest) * (Math.PI / 2)), 0.8)
          : 1 - 0.34 * Math.pow((t - widest) / (end - widest), 1.5);
      const noise = (rand() - 0.5) * ruffle * W * (0.3 + t);
      pts.push([sign * (W / 2) * prof + noise + skew * t, -L * t]);
    }
    return pts;
  };
  const right = side(1);
  const left = side(-1).reverse();
  const [rx, ry] = right[right.length - 1];
  const [lx, ly] = left[0];
  const cx = (rx + lx) / 2;
  const cy = (ry + ly) / 2;
  const hw = (rx - lx) / 2;
  const tipH = L * 0.15;
  const k = tip === "scallop" ? lobes * 2 + 1 : 6;
  const tipPts: Pt[] = [];
  for (let j = 1; j < k; j++) {
    const a = (j / k) * Math.PI;
    let rr = 1;
    if (tip === "scallop") rr = j % 2 === 0 ? 0.74 - rand() * 0.1 : 1 + rand() * 0.06;
    if (tip === "notch") rr = 1 - 0.42 * Math.exp(-Math.pow((a - Math.PI / 2) / 0.28, 2));
    const h = tip === "point" ? tipH * 1.9 * Math.pow(Math.sin(a), 3) : tipH * Math.sin(a);
    const wx = tip === "point" ? Math.cos(a) * (0.6 + 0.4 * Math.abs(Math.cos(a))) : Math.cos(a);
    tipPts.push([cx + hw * wx, cy - h * rr + (rand() - 0.5) * ruffle * W * 0.35]);
  }
  return [[0, 0], ...right, ...tipPts, ...left];
}

function veinPath(rand: () => number, L: number, W: number, count: number) {
  let d = "";
  for (let j = 0; j < count; j++) {
    const f = count === 1 ? 0 : j / (count - 1) - 0.5;
    const ex = f * W * 0.62 + (rand() - 0.5) * 3;
    const ey = -L * (0.62 + rand() * 0.2 - Math.abs(f) * 0.25);
    d += `M${r2(f * 2)} -3 Q${r2(ex * 0.35)} ${r2(ey * 0.55)} ${r2(ex)} ${r2(ey)} `;
  }
  return d.trim();
}

// ── Species ─────────────────────────────────────────────────────────────────

type LayerDef = {
  count: number;
  L: [number, number];
  W: [number, number];
  widest: number;
  tip: TipKind;
  ruffle: number;
  lobes?: number;
  /** Petal scale once open — a smaller y reads as a cupped petal. */
  open: [number, number];
  /** Petal scale while folded in the bud. */
  closed: [number, number];
  stage: number;
  jitter: number;
  veins: number;
};

type SpeciesDef = { layers: LayerDef[]; center: "none" | "spiral" | "disk" };

const SPECIES: Record<BloomSpecies, SpeciesDef> = {
  peony: {
    center: "none",
    layers: [
      { count: 7, L: [88, 100], W: [70, 82], widest: 0.6, tip: "scallop", ruffle: 0.08, lobes: 3, open: [1, 1], closed: [0.42, 0.82], stage: 0, jitter: 10, veins: 5 },
      { count: 9, L: [70, 80], W: [54, 62], widest: 0.58, tip: "scallop", ruffle: 0.09, lobes: 3, open: [0.95, 0.88], closed: [0.36, 0.86], stage: 1, jitter: 12, veins: 4 },
      { count: 10, L: [50, 60], W: [40, 48], widest: 0.55, tip: "scallop", ruffle: 0.11, lobes: 2, open: [0.9, 0.7], closed: [0.32, 0.88], stage: 2, jitter: 14, veins: 3 },
      { count: 12, L: [28, 38], W: [26, 32], widest: 0.5, tip: "scallop", ruffle: 0.13, lobes: 2, open: [0.85, 0.55], closed: [0.3, 0.9], stage: 3, jitter: 18, veins: 0 },
    ],
  },
  rose: {
    center: "spiral",
    layers: [
      { count: 5, L: [90, 100], W: [84, 94], widest: 0.62, tip: "round", ruffle: 0.05, open: [1, 1], closed: [0.46, 0.8], stage: 0, jitter: 8, veins: 5 },
      { count: 6, L: [70, 80], W: [66, 74], widest: 0.6, tip: "round", ruffle: 0.05, open: [0.95, 0.84], closed: [0.4, 0.84], stage: 1, jitter: 10, veins: 4 },
      { count: 7, L: [50, 58], W: [46, 52], widest: 0.58, tip: "round", ruffle: 0.06, open: [0.88, 0.6], closed: [0.34, 0.88], stage: 2, jitter: 12, veins: 3 },
    ],
  },
  anemone: {
    center: "disk",
    layers: [
      { count: 8, L: [86, 98], W: [48, 58], widest: 0.66, tip: "notch", ruffle: 0.05, open: [1, 1], closed: [0.36, 0.85], stage: 0, jitter: 6, veins: 6 },
      { count: 5, L: [68, 76], W: [40, 46], widest: 0.64, tip: "notch", ruffle: 0.06, open: [0.95, 0.9], closed: [0.32, 0.88], stage: 1, jitter: 10, veins: 4 },
    ],
  },
};

type Pose = { a: number; sx: number; sy: number };
type PetalGeo = { d: string; veins: string; sheen: string; open: Pose; closed: Pose; delay: number; dur: number; variant: number };
type LayerGeo = { petals: PetalGeo[]; reach: number; stage: number };
type FlowerGeo = {
  layers: LayerGeo[];
  sepal: string;
  lastStage: number;
  crescents: string[];
  stamens: { lines: string; dots: string };
  /** The smooth, wrapped outer skin of the closed bud. */
  shell: { d: string; seams: string };
};

const cache = new Map<string, FlowerGeo>();

function normalise(angle: number) {
  const a = ((angle % 360) + 360) % 360;
  return a > 180 ? a - 360 : a;
}

function buildFlower(species: BloomSpecies, seed: number, detail: "high" | "low"): FlowerGeo {
  const key = `${species}|${seed}|${detail}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const rand = rng(seed * 7919 + species.length);
  const def = SPECIES[species];
  const size = 0.94 + rand() * 0.12;
  const layerDefs = detail === "low" ? def.layers.filter((l) => l.stage < 3) : def.layers;
  const twist = rand() * 360;

  const layers: LayerGeo[] = layerDefs.map((ld, li) => {
    const step = 360 / ld.count;
    const petals: PetalGeo[] = [];
    let reach = 0;
    for (let i = 0; i < ld.count; i++) {
      const L = (ld.L[0] + rand() * (ld.L[1] - ld.L[0])) * size;
      const W = (ld.W[0] + rand() * (ld.W[1] - ld.W[0])) * size;
      reach = Math.max(reach, L);
      const angle = normalise(twist + (i + (li % 2) * 0.5) * step + (rand() - 0.5) * ld.jitter * 2);
      const pts = petalPoints(rand, L, W, ld.widest, ld.tip, ld.ruffle, ld.lobes);
      petals.push({
        d: smoothClosed(pts),
        veins: detail === "high" && ld.veins ? veinPath(rand, L, W, ld.veins) : "",
        sheen: `translate(${r2(W * (0.08 + rand() * 0.08))} ${r2(-L * 0.03)}) scale(${r2(0.42 + rand() * 0.12)} ${r2(0.86 + rand() * 0.08)})`,
        open: { a: r2(angle), sx: r2(ld.open[0] * (0.94 + rand() * 0.1)), sy: r2(ld.open[1] * (0.92 + rand() * 0.12)) },
        closed: { a: r2(angle * 0.06 + (rand() - 0.5) * 5), sx: r2(ld.closed[0]), sy: r2(ld.closed[1] * (0.95 + rand() * 0.08)) },
        delay: r2(ld.stage * 0.15 + rand() * 0.1),
        dur: r2(0.78 + rand() * 0.42),
        variant: Math.floor(rand() * 3),
      });
    }
    // shuffle draw order so overlaps look organic, not like a fan
    for (let i = petals.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [petals[i], petals[j]] = [petals[j], petals[i]];
    }
    return { petals, reach, stage: ld.stage };
  });

  const crescents: string[] = [];
  if (def.center === "spiral") {
    for (let i = 8; i >= 0; i--) {
      const r = 5 + i * 2.7;
      const start = (i * 112 + twist) * (Math.PI / 180);
      const span = (130 + rand() * 30) * (Math.PI / 180);
      const x1 = r * Math.cos(start);
      const y1 = r * Math.sin(start);
      const x2 = r * Math.cos(start + span);
      const y2 = r * Math.sin(start + span);
      const R = r * 1.4;
      crescents.push(`M${r2(x1)} ${r2(y1)} A${r2(r)} ${r2(r)} 0 0 1 ${r2(x2)} ${r2(y2)} A${r2(R)} ${r2(R)} 0 0 0 ${r2(x1)} ${r2(y1)}Z`);
    }
  }

  let lines = "";
  let dots = "";
  if (def.center === "disk") {
    const n = detail === "high" ? 34 : 16;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rand() * 0.2;
      const r0 = 9;
      const r1 = 15 + rand() * 6;
      const x0 = Math.cos(a) * r0;
      const y0 = Math.sin(a) * r0;
      const x1 = Math.cos(a) * r1;
      const y1 = Math.sin(a) * r1;
      lines += `M${r2(x0)} ${r2(y0)} L${r2(x1)} ${r2(y1)} `;
      dots += `M${r2(x1 - 1.3)} ${r2(y1)} a1.3 1.3 0 1 0 2.6 0 a1.3 1.3 0 1 0 -2.6 0 `;
    }
  }

  // closed bud: the outer petals wrap the bud smoothly, with a couple of seams
  const outer = layerDefs[0];
  const H = outer.L[1] * outer.closed[1] * size * 1.14;
  const B = H * (species === "rose" ? 0.6 : 0.56);
  const j = () => (rand() - 0.5) * B * 0.05;
  const shellPts: Pt[] = [
    [0, 0],
    [B * 0.3 + j(), -H * 0.12],
    [B * 0.5 + j(), -H * 0.36],
    [B * 0.5 + j(), -H * 0.62],
    [B * 0.34 + j(), -H * 0.86],
    [B * 0.08, -H],
    [-B * 0.1, -H * 0.99],
    [-B * 0.36 + j(), -H * 0.84],
    [-B * 0.5 + j(), -H * 0.6],
    [-B * 0.5 + j(), -H * 0.34],
    [-B * 0.3 + j(), -H * 0.11],
  ];
  const shell = {
    d: smoothClosed(shellPts),
    seams:
      `M${r2(-B * 0.12)} ${r2(-H * 0.05)} Q${r2(B * 0.42)} ${r2(-H * 0.45)} ${r2(B * 0.22)} ${r2(-H * 0.93)} ` +
      `M${r2(B * 0.18)} ${r2(-H * 0.12)} Q${r2(-B * 0.46)} ${r2(-H * 0.5)} ${r2(-B * 0.3)} ${r2(-H * 0.88)}`,
  };

  const geo: FlowerGeo = {
    shell,
    layers,
    sepal: smoothClosed(petalPoints(rand, 46, 17, 0.4, "point", 0.02)),
    lastStage: Math.max(...layers.map((l) => l.stage)) + (def.center === "none" ? 0 : 1),
    crescents,
    stamens: { lines: lines.trim(), dots: dots.trim() },
  };
  cache.set(key, geo);
  return geo;
}

// ── Colour ──────────────────────────────────────────────────────────────────

type Tone = { deep: string; mid: string; tip: string; vein: string; disk: [string, string]; stamen: string };

const TONES: Record<BloomPalette, Tone> = {
  blush: { deep: "#b84a6c", mid: "#e98fa9", tip: "#fde3ea", vein: "#9e3a5a", disk: ["#6e5a2e", "#2c1d12"], stamen: "#f3d593" },
  rose: { deep: "#8f2b4e", mid: "#d06787", tip: "#f6c1cf", vein: "#7a2443", disk: ["#5a2f3a", "#22101a"], stamen: "#f1cf8e" },
  peach: { deep: "#c6614b", mid: "#f0a68a", tip: "#fee8db", vein: "#a24c3a", disk: ["#7a5a2a", "#2e1d0e"], stamen: "#f6dc98" },
  cream: { deep: "#c29089", mid: "#f0d6cb", tip: "#fffaf3", vein: "#a3746e", disk: ["#6b6a3a", "#25220f"], stamen: "#f4dc9c" },
};

function mix(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => Math.round(((pa >> shift) & 255) * (1 - t) + ((pb >> shift) & 255) * t);
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
}

// ── Leaves & stem ───────────────────────────────────────────────────────────

function buildStem(seed: number, stem: number, head: number) {
  const rand = rng(seed * 104729 + 3);
  const bend = (rand() - 0.5) * 34;
  const bottom = stem + head;
  const at = (t: number): Pt => {
    const u = 1 - t;
    return [2 * u * t * bend + t * t * bend * 0.35, u * u * 8 + 2 * u * t * (bottom * 0.5) + t * t * bottom];
  };
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    const [x, y] = at(t);
    const w = 2.1 + t * 1.6;
    left.push([x - w, y]);
    right.push([x + w, y]);
  }
  const d = `M${left.map(([x, y]) => `${r2(x)} ${r2(y)}`).join(" L")} L${right
    .reverse()
    .map(([x, y]) => `${r2(x)} ${r2(y)}`)
    .join(" L")}Z`;

  const leaves: { d: string; veins: string; transform: string }[] = [];
  const count = stem > 140 ? 2 + Math.floor(rand() * 2) : stem > 60 ? 1 : 0;
  let side = rand() > 0.5 ? 1 : -1;
  for (let i = 0; i < count; i++) {
    const t = 0.3 + (i / Math.max(count, 1)) * 0.45 + rand() * 0.08;
    const [x, y] = at(t);
    const L = 54 + rand() * 30;
    const W = 19 + rand() * 9;
    const pts = petalPoints(rand, L, W, 0.42, "point", 0.03);
    const veins =
      `M0 -2 Q${r2(W * 0.06)} ${r2(-L * 0.5)} 0 ${r2(-L * 0.96)} ` +
      [1, 2, 3, 4]
        .map((k) => {
          const vy = -L * k * 0.18;
          return `M0 ${r2(vy)} Q${r2(W * 0.2)} ${r2(vy - L * 0.06)} ${r2(W * 0.38)} ${r2(vy - L * 0.12)} M0 ${r2(vy)} Q${r2(-W * 0.2)} ${r2(vy - L * 0.06)} ${r2(-W * 0.38)} ${r2(vy - L * 0.12)}`;
        })
        .join(" ");
    leaves.push({
      d: smoothClosed(pts),
      veins,
      transform: `translate(${r2(x)} ${r2(y)}) rotate(${r2(side * (52 + rand() * 26))}) scale(${r2(0.9 + rand() * 0.2)} 1)`,
    });
    side = -side;
  }
  return { d, leaves };
}

// ── Component ───────────────────────────────────────────────────────────────

export type BloomProps = {
  open: boolean;
  palette?: BloomPalette;
  species?: BloomSpecies;
  /** Varies the generated petals; defaults to a hash of `id`. */
  seed?: number;
  /** Rendered width (any CSS length). */
  size?: number | string;
  /** Stem length in SVG units (0 = no stem). The flower head is ~236 units wide. */
  stem?: number;
  /** Seconds before the bloom begins once `open` becomes true. */
  delay?: number;
  /** Seconds for the main bloom; inner petals follow on their own timing. */
  duration?: number;
  /** Degrees the head leans. */
  tilt?: number;
  /** How much the open head is foreshortened (1 = seen from above, 0.6 = from the side). */
  squash?: number;
  /** How far it opens (0.3 = a bud just starting to part). */
  maxOpen?: number;
  /** "low" drops fine detail for tiny icons. */
  detail?: "high" | "low";
  className?: string;
  style?: CSSProperties;
  id: string;
};

export function Bloom({
  open,
  palette = "blush",
  species = "peony",
  seed,
  size = 200,
  stem = 0,
  delay = 0,
  duration = 2.6,
  tilt = 0,
  squash = 0.8,
  maxOpen = 1,
  detail = "high",
  className,
  style,
  id,
}: BloomProps) {
  const head = 118;
  const flowerSeed = seed ?? hashString(id);
  const geo = buildFlower(species, flowerSeed, detail);
  const tone = TONES[palette];
  const hi = detail === "high";
  const ease = "cubic-bezier(0.16, 1, 0.3, 1)";
  // petals unfold slowly at first, then settle gently — like a real bloom
  const unfold = "cubic-bezier(0.45, 0.05, 0.22, 1)";
  const m = Math.max(0, Math.min(1, maxOpen));
  const stemGeo = stem > 0 ? buildStem(flowerSeed, stem, head) : null;
  const viewBox = `${-head} ${-head} ${head * 2} ${head * 2 + stem}`;

  const lerp = (a: number, b: number) => r2(a + (b - a) * m);
  const petalStyle = (p: PetalGeo): CSSProperties => ({
    transformBox: "view-box",
    transformOrigin: "0px 0px",
    transform: open
      ? `rotate(${lerp(p.closed.a, p.open.a)}deg) scale(${lerp(p.closed.sx, p.open.sx)}, ${lerp(p.closed.sy, p.open.sy)})`
      : `rotate(${p.closed.a}deg) scale(${p.closed.sx}, ${p.closed.sy})`,
    transition: `transform ${r2(duration * p.dur)}s ${unfold} ${r2(delay + duration * p.delay)}s`,
  });

  const fade = (on: boolean, stage: number): CSSProperties => ({
    transformBox: "view-box",
    transformOrigin: "0px 0px",
    opacity: on ? 1 : 0,
    transform: on ? "scale(1)" : "scale(0.35)",
    transition: `opacity ${r2(duration * 0.6)}s ease ${r2(delay + duration * stage * 0.15)}s, transform ${r2(duration * 0.9)}s ${ease} ${r2(delay + duration * stage * 0.15)}s`,
  });

  const centerOn = open && m > 0.6;

  return (
    <svg
      viewBox={viewBox}
      className={className}
      style={{ overflow: "visible", width: size, height: "auto", ...style }}
      aria-hidden
      focusable="false"
    >
      <defs>
        {geo.layers.map((_, li) =>
          [0, 1, 2].map((v) => {
            const depth = li * 0.13 + (v - 1) * 0.06;
            return (
              <linearGradient key={`${li}-${v}`} id={`${id}-L${li}v${v}`} x1="0.5" y1="1" x2="0.5" y2="0">
                <stop offset="0%" stopColor={mix(tone.deep, "#3a0f22", li * 0.08)} />
                <stop offset={`${38 + v * 6}%`} stopColor={mix(tone.mid, tone.deep, Math.max(0, depth))} />
                <stop offset="100%" stopColor={mix(tone.tip, tone.mid, Math.max(0, li * 0.12 + (v === 2 ? 0.12 : 0)))} />
              </linearGradient>
            );
          }),
        )}
        <linearGradient id={`${id}-rim`} x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%" stopColor="#fff2f6" stopOpacity="0" />
          <stop offset="70%" stopColor="#fff2f6" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#fff8fa" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="55%" stopColor="#fff6f8" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.04" />
        </linearGradient>
        <radialGradient id={`${id}-occ`}>
          <stop offset="0%" stopColor="#2a0616" stopOpacity="0.68" />
          <stop offset="55%" stopColor="#2a0616" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#2a0616" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0%" stopColor="#ffd9e3" stopOpacity="0.38" />
          <stop offset="45%" stopColor="#f4a3bb" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#f4a3bb" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#97ad87" />
          <stop offset="55%" stopColor="#6b8460" />
          <stop offset="100%" stopColor="#3f5539" />
        </linearGradient>
        <linearGradient id={`${id}-stem`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9db48d" />
          <stop offset="100%" stopColor="#465c40" />
        </linearGradient>
        <linearGradient id={`${id}-cres`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={tone.mid} />
          <stop offset="100%" stopColor={mix(tone.deep, "#3a0f22", 0.2)} />
        </linearGradient>
        <radialGradient id={`${id}-disk`} cx="0.42" cy="0.38" r="0.7">
          <stop offset="0%" stopColor={tone.disk[0]} />
          <stop offset="100%" stopColor={tone.disk[1]} />
        </radialGradient>
      </defs>

      {stemGeo && (
        <g>
          {stemGeo.leaves.map((leaf, i) => (
            <g key={i} transform={leaf.transform}>
              <path d={leaf.d} fill={`url(#${id}-leaf)`} stroke="rgba(220,235,205,0.18)" strokeWidth={0.7} />
              {hi && <path d={leaf.veins} fill="none" stroke="#c9d8b8" strokeOpacity={0.28} strokeWidth={0.6} strokeLinecap="round" />}
            </g>
          ))}
          <path d={stemGeo.d} fill={`url(#${id}-stem)`} />
        </g>
      )}

      {/* soft warm light the flower sits in */}
      <circle r={112} fill={`url(#${id}-glow)`} style={{ opacity: open ? 1 : 0.45, transition: `opacity ${duration}s ease ${delay}s` }} />

      <g
        style={{
          transformBox: "view-box",
          transformOrigin: "0px 0px",
          transform: open ? `rotate(${r2(tilt)}deg) scale(1, ${lerp(1, squash)})` : `rotate(${r2(tilt * 0.35)}deg)`,
          transition: `transform ${r2(duration * 1.1)}s ${ease} ${delay}s`,
        }}
      >
        {/* sepals behind: fold down beneath the open flower */}
        {[-40, -18, 0, 18, 40].map((a, i) => (
          <path
            key={`sb${i}`}
            d={geo.sepal}
            fill={`url(#${id}-leaf)`}
            style={{
              transformBox: "view-box",
              transformOrigin: "0px 0px",
              transform: open && m > 0.5 ? `rotate(${180 + a * 1.6}deg) scale(0.8)` : `rotate(${a * 0.7}deg) scale(0.9)`,
              transition: `transform ${r2(duration)}s ${ease} ${delay}s`,
            }}
          />
        ))}

        {geo.layers.map((layer, li) => (
          <g key={li}>
            {layer.petals.map((p, pi) => (
              <g key={pi} style={petalStyle(p)}>
                <path d={p.d} fill={`url(#${id}-L${li}v${p.variant})`} stroke={`url(#${id}-rim)`} strokeWidth={0.9} />
                {hi && <path d={p.d} transform={p.sheen} fill={`url(#${id}-sheen)`} />}
                {hi && p.veins && (
                  <path d={p.veins} fill="none" stroke={tone.vein} strokeOpacity={0.2} strokeWidth={0.6} strokeLinecap="round" />
                )}
              </g>
            ))}
            {/* shade where the next layer of petals overlaps this one */}
            {li < geo.layers.length - 1 && (
              <circle
                r={r2(geo.layers[li + 1].reach * 0.8)}
                fill={`url(#${id}-occ)`}
                style={{ opacity: open ? 1 : 0.35, transition: `opacity ${duration}s ease ${delay}s` }}
              />
            )}
          </g>
        ))}

        {geo.crescents.length > 0 && (
          <g style={fade(centerOn, geo.lastStage)}>
            {geo.crescents.map((d, i) => (
              <path key={i} d={d} fill={`url(#${id}-cres)`} stroke={`url(#${id}-rim)`} strokeWidth={0.7} />
            ))}
          </g>
        )}

        {geo.stamens.lines && (
          <g style={fade(centerOn, geo.lastStage)}>
            <circle r={11} fill={`url(#${id}-disk)`} />
            <path d={geo.stamens.lines} stroke={mix(tone.stamen, "#3a2a10", 0.45)} strokeWidth={0.8} strokeLinecap="round" />
            <path d={geo.stamens.dots} fill={tone.stamen} />
          </g>
        )}

        {/* the wrapped bud — dissolves as the outer petals part */}
        <g
          style={{
            transformBox: "view-box",
            transformOrigin: "0px 0px",
            opacity: open ? r2(Math.max(0, 1 - m * 3)) : 1,
            transform: open ? "scale(1.12, 1.04)" : "scale(1)",
            transition: `opacity ${r2(duration * 0.32)}s ease ${r2(delay + duration * 0.04)}s, transform ${r2(duration * 0.5)}s ${ease} ${delay}s`,
          }}
        >
          <path d={geo.shell.d} fill={`url(#${id}-L0v1)`} stroke={`url(#${id}-rim)`} strokeWidth={0.9} />
          {hi && <path d={geo.shell.d} transform="translate(5 -2) scale(0.5 0.92)" fill={`url(#${id}-sheen)`} />}
          <path d={geo.shell.seams} fill="none" stroke={tone.deep} strokeOpacity={0.45} strokeWidth={0.9} strokeLinecap="round" />
        </g>

        {/* sepals in front: hug the closed bud, then slip away as it opens */}
        {[-26, 0, 26].map((a, i) => (
          <path
            key={`sf${i}`}
            d={geo.sepal}
            fill={`url(#${id}-leaf)`}
            stroke="rgba(220,235,205,0.2)"
            strokeWidth={0.6}
            style={{
              transformBox: "view-box",
              transformOrigin: "0px 0px",
              opacity: open ? r2(Math.max(0, 1 - m * 1.6)) : 1,
              transform: open ? `rotate(${a * 3}deg) scale(0.85, ${r2(0.95 - m * 0.4)})` : `rotate(${a}deg) scale(0.95, 0.95)`,
              transition: `transform ${r2(duration * 0.8)}s ${ease} ${delay}s, opacity ${r2(duration * 0.35)}s ease ${r2(delay + duration * 0.1)}s`,
            }}
          />
        ))}
      </g>
    </svg>
  );
}
