import type { CSSProperties } from "react";

/**
 * The ground the finale's flowers grow out of, in two halves that sandwich
 * the FlowerBed:
 *
 *   <GardenFloor layer="back" />   distant meadow silhouettes + back grass
 *   <FlowerBed ground={GROUND} />  the flowers, rooted at the soil line
 *   <GardenFloor layer="front" />  meadow mound, soil + moss, stones, low
 *                                  plants, fallen petals, foreground grass,
 *                                  fireflies and a few petals settling down
 *
 * Grass and soil are wide SVG strips drawn 1:1 in pixels and cropped at the
 * sides on narrow screens (`xMidYMax slice`), so blades never get squashed.
 * Stones, flowers and petals are separate little SVGs placed by % / px, so
 * they keep their shape at every width. Everything ignores the pointer.
 */

/** Distance from the bottom of the section to the top of the soil, in px. */
export const GROUND = 72;

const W = 2000; // strip width in SVG units (≈ px)
const r1 = (n: number) => Math.round(n * 10) / 10;

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Curved grass blades rooted along `root` (SVG y), as one path.
 * `gaps` (-1…1, higher = more) thins the grass into irregular clumps so moss
 * and soil show through; `clear` keeps a lane open for the path at the centre.
 */
function blades(
  seed: number,
  count: number,
  root: number,
  hMin: number,
  hMax: number,
  wMin = 2,
  wMax = 5,
  { gaps = -1, clear = 0 }: { gaps?: number; clear?: number } = {},
) {
  const r = seeded(seed);
  let d = "";
  for (let i = 0; i < count; i++) {
    const x = (i / count) * W + r() * (W / count) * 1.6 - 10;
    const patch = Math.sin(x * 0.0061 + seed) * 0.6 + Math.sin(x * 0.0173 + seed * 3) * 0.4;
    if (patch < gaps && r() < 0.85) continue;
    if (Math.abs(x - W / 2) < clear && r() < 0.8) continue;
    // clumps: taller where a slow wave peaks, so the grass isn't an even comb
    const clump = 0.55 + 0.45 * Math.sin(x * 0.011 + seed) * Math.sin(x * 0.0037 + seed * 2);
    const h = hMin + r() * (hMax - hMin) * (0.5 + clump * 0.6);
    const lean = (r() - 0.5) * h * 0.7;
    const w = wMin + r() * (wMax - wMin);
    const y = root + r() * 6;
    d +=
      `M${r1(x)} ${r1(y)} ` +
      `Q${r1(x + lean * 0.3)} ${r1(y - h * 0.6)} ${r1(x + lean + w * 0.3)} ${r1(y - h)} ` +
      `Q${r1(x + w + lean * 0.35)} ${r1(y - h * 0.55)} ${r1(x + w)} ${r1(y)}Z `;
  }
  return d;
}

/** A soft, uneven ridge (top edge at roughly `top`) filled down to `bottom`. */
function ridge(seed: number, top: number, amp: number, bottom: number) {
  const r = seeded(seed);
  const a = r() * 6;
  const b = r() * 6;
  let d = `M0 ${bottom} L0 ${r1(top)}`;
  for (let x = 0; x <= W; x += 40) {
    const y = top + Math.sin(x * 0.004 + a) * amp + Math.sin(x * 0.013 + b) * amp * 0.45 + (r() - 0.5) * amp * 0.5;
    d += ` L${x} ${r1(y)}`;
  }
  return `${d} L${W} ${bottom}Z`;
}

/** Tiny far-away flower heads on thin stems, for the distant meadow. */
function distantFlowers(seed: number, count: number, root: number) {
  const r = seeded(seed);
  let stems = "";
  let heads = "";
  for (let i = 0; i < count; i++) {
    const x = r() * W;
    const h = 18 + r() * 46;
    const lean = (r() - 0.5) * 10;
    stems += `M${r1(x)} ${root} Q${r1(x + lean * 0.4)} ${r1(root - h * 0.6)} ${r1(x + lean)} ${r1(root - h)} `;
    const rad = 2.2 + r() * 2.6;
    const cx = x + lean;
    const cy = root - h;
    heads += `M${r1(cx - rad)} ${r1(cy)} a${r1(rad)} ${r1(rad * 0.8)} 0 1 0 ${r1(rad * 2)} 0 a${r1(rad)} ${r1(rad * 0.8)} 0 1 0 ${r1(-rad * 2)} 0 `;
  }
  return { stems, heads };
}

type Blob = [number, number, number];

/** A leafy crown: big overlapping masses plus a scalloped fringe of small ones. */
function canopy(r: () => number, cx: number, cy: number, rx: number, ry: number, big: number, fringe: number): Blob[] {
  const out: Blob[] = [];
  for (let i = 0; i < big; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * 0.7;
    out.push([r1(cx + Math.cos(a) * rx * d), r1(cy + Math.sin(a) * ry * d), r1(Math.min(rx, ry) * (0.32 + r() * 0.22))]);
  }
  for (let i = 0; i < fringe; i++) {
    const a = (i / fringe) * Math.PI * 2 + r() * 0.2;
    const k = 0.86 + r() * 0.16;
    out.push([r1(cx + Math.cos(a) * rx * k), r1(cy + Math.sin(a) * ry * k), r1(Math.min(rx, ry) * (0.1 + r() * 0.1))]);
  }
  return out;
}

/** A gently leaning trunk with two branches reaching into the crown. */
function trunk(r: () => number, x: number, base: number, top: number, w: number) {
  const lean = (r() - 0.5) * w * 4;
  const mid = (base + top) / 2;
  const tx = x + lean;
  const b1 = `M${r1(x + lean * 0.5)} ${r1(mid)} Q${r1(x + lean * 0.5 - w * 3)} ${r1(mid - w * 4)} ${r1(x - w * 6)} ${r1(top + w)}`;
  const b2 = `M${r1(x + lean * 0.6)} ${r1(mid + w * 2)} Q${r1(x + lean + w * 3)} ${r1(mid - w * 2)} ${r1(x + w * 7)} ${r1(top + w * 3)}`;
  return {
    body: `M${r1(x - w)} ${base} C${r1(x - w * 0.8)} ${r1(mid)} ${r1(tx - w * 0.5)} ${r1(top + 20)} ${r1(tx - w * 0.3)} ${r1(top)} L${r1(tx + w * 0.3)} ${r1(top)} C${r1(tx + w * 0.5)} ${r1(top + 20)} ${r1(x + w * 0.8)} ${r1(mid)} ${r1(x + w)} ${base}Z`,
    branches: `${b1} ${b2}`,
  };
}

function edgeGrove(seed: number) {
  const r = seeded(seed);
  return {
    // a tall tree furthest back, softened by haze
    far: { trunk: trunk(r, 150, 440, 170, 7), crown: canopy(r, 150, 140, 120, 105, 22, 34) },
    // a smaller, nearer tree
    mid: { trunk: trunk(r, 290, 440, 250, 5), crown: canopy(r, 290, 230, 85, 70, 16, 26) },
    // low leafy bushes along the ground
    bushes: [
      ...canopy(r, 80, 400, 90, 46, 12, 22),
      ...canopy(r, 230, 410, 70, 36, 9, 18),
      ...canopy(r, 330, 418, 50, 26, 7, 14),
    ],
  };
}

const GROVES = [edgeGrove(51), edgeGrove(67)];

/** Five round petals around (x, y), as path data. */
function blossom(x: number, y: number, rad: number, turn: number) {
  let d = "";
  for (let k = 0; k < 5; k++) {
    const a = turn + (k / 5) * Math.PI * 2;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad * 0.8;
    const pr = rad * 0.62;
    d += `M${r1(px - pr)} ${r1(py)} a${r1(pr)} ${r1(pr)} 0 1 0 ${r1(pr * 2)} 0 a${r1(pr)} ${r1(pr)} 0 1 0 ${r1(-pr * 2)} 0 `;
  }
  return d;
}

/**
 * A bank of tall grass and wildflowers that climbs toward the outer edge
 * (x = 0) and thins out toward the centre, so the edges frame the scene.
 */
function wildBank(seed: number) {
  const r = seeded(seed);
  const H = 300;
  let blades = "";
  for (let i = 0; i < 190; i++) {
    const x = Math.pow(r(), 1.25) * 520;
    const edge = Math.pow(1 - x / 520, 1.6);
    const h = 26 + edge * 200 * (0.45 + r() * 0.75);
    const lean = (r() - 0.5) * h * 0.5 + h * 0.12;
    const w = 2 + r() * 4;
    blades +=
      `M${r1(x)} ${H} Q${r1(x + lean * 0.3)} ${r1(H - h * 0.6)} ${r1(x + lean + w * 0.3)} ${r1(H - h)} ` +
      `Q${r1(x + w + lean * 0.35)} ${r1(H - h * 0.55)} ${r1(x + w)} ${H}Z `;
  }
  let stems = "";
  let pink = "";
  let white = "";
  let lavender = "";
  let centres = "";
  for (let i = 0; i < 44; i++) {
    const x = Math.pow(r(), 1.4) * 500 + 6;
    const edge = Math.pow(1 - x / 520, 1.3);
    const h = 30 + edge * 190 * (0.4 + r() * 0.7);
    const lean = (r() - 0.4) * 14;
    const tx = x + lean;
    const ty = H - h;
    stems += `M${r1(x)} ${H} Q${r1(x + lean * 0.3)} ${r1(H - h * 0.5)} ${r1(tx)} ${r1(ty)} `;
    const kind = r();
    if (kind < 0.25) {
      // a lavender spike
      for (let j = 0; j < 6; j++) {
        const yy = ty + j * 4.2;
        const rad = 2.4 - j * 0.15;
        lavender += `M${r1(tx - rad)} ${r1(yy)} a${r1(rad)} ${r1(rad * 1.3)} 0 1 0 ${r1(rad * 2)} 0 a${r1(rad)} ${r1(rad * 1.3)} 0 1 0 ${r1(-rad * 2)} 0 `;
      }
    } else {
      const rad = 3 + r() * 3.4;
      const d = blossom(tx, ty, rad, r() * 2);
      if (kind < 0.62) pink += d;
      else white += d;
      const c = rad * 0.42;
      centres += `M${r1(tx - c)} ${r1(ty)} a${r1(c)} ${r1(c)} 0 1 0 ${r1(c * 2)} 0 a${r1(c)} ${r1(c)} 0 1 0 ${r1(-c * 2)} 0 `;
    }
  }
  return { blades, stems, pink, white, lavender, centres };
}

const BANKS = [wildBank(71), wildBank(83)];

// Geometry is built once at module load (deterministic → SSR-safe).
const H_BACK = 300;
const MEADOW_FAR = ridge(5, 168, 22, H_BACK);
const MEADOW_NEAR = ridge(9, 200, 12, H_BACK);
const FAR_FLOWERS = distantFlowers(13, 110, 206);
const FAR_GRASS = blades(15, 320, 196, 10, 46, 1.4, 3);
const BACK_GRASS = blades(17, 420, 236, 20, 84, 1.8, 4);

const H_FRONT = 240;
const SOIL_TOP = H_FRONT - GROUND; // SVG y of the soil line
const MOUND = ridge(21, SOIL_TOP - 40, 9, H_FRONT);
const MOUND_GRASS = blades(23, 520, SOIL_TOP - 30, 16, 66, 2, 4.4, { gaps: -0.45, clear: 34 });
const SOIL = ridge(29, SOIL_TOP - 4, 5, H_FRONT);
const MOSS = ridge(31, SOIL_TOP - 7, 4, SOIL_TOP + 10);
const FRONT_GRASS = [
  blades(37, 360, H_FRONT - 8, 44, 128, 3, 6.5, { gaps: -0.3, clear: 52 }),
  blades(41, 280, H_FRONT - 4, 56, 160, 3.4, 7, { gaps: -0.15, clear: 64 }),
  blades(43, 300, H_FRONT, 34, 104, 3.6, 7.5, { gaps: -0.4, clear: 44 }),
];

function Strip({ height, children, className = "", style }: { height: number; children: React.ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      preserveAspectRatio="xMidYMax slice"
      className={`absolute inset-x-0 bottom-0 w-full ${className}`}
      style={{ height, ...style }}
    >
      {children}
    </svg>
  );
}

/* ── small botanical details ─────────────────────────────────────────────── */

type Spot = { left: string; bottom: number; size: number; flip?: boolean; className?: string };

function Placed({ spot, children, sway }: { spot: Spot; children: React.ReactNode; sway?: number }) {
  return (
    <div
      className={`absolute -translate-x-1/2 ${spot.className ?? ""}`}
      style={{ left: spot.left, bottom: spot.bottom, width: spot.size, transform: spot.flip ? "scaleX(-1)" : undefined }}
    >
      <div
        className={sway ? "sway" : undefined}
        style={
          sway
            ? ({ "--sway": "2.4deg", "--sway-duration": `${5 + sway * 0.8}s`, "--sway-delay": `${-sway * 1.7}s` } as CSSProperties)
            : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}

function Stone({ tone = 0 }: { tone?: number }) {
  return (
    <svg viewBox="0 0 60 30" className="block h-auto w-full">
      <defs>
        <radialGradient id={`stone-${tone}`} cx="0.42" cy="0.25" r="0.85">
          <stop offset="0" stopColor={tone ? "#4a3a40" : "#3f3236"} />
          <stop offset="0.55" stopColor="#241a1e" />
          <stop offset="1" stopColor="#120c0e" />
        </radialGradient>
      </defs>
      <ellipse cx="30" cy="27" rx="27" ry="4" fill="#050304" opacity="0.6" />
      <path d="M4 26 C 3 15, 14 5, 30 5 C 46 5, 57 14, 56 25 C 48 29, 14 29, 4 26 Z" fill={`url(#stone-${tone})`} />
      {/* dusky-rose rim light from the horizon glow */}
      <path d="M10 13 C 16 7, 26 5, 34 6" stroke="#f0a5b8" strokeOpacity="0.28" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M8 24 C 14 22, 18 25, 24 23" stroke="#4f6347" strokeOpacity="0.5" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// three irregular flat-stone outlines, seen low and in perspective
const STONE_SHAPES = [
  "M4 9 C 3 5, 12 2.4, 26 2.2 C 42 2, 57 3.6, 57 8 C 57 12.4, 44 14.4, 28 14.2 C 13 14, 5 12.6, 4 9 Z",
  "M3 8 C 5 4, 17 1.8, 31 2.6 C 46 3.2, 58 5, 56 9.4 C 54 13, 40 14.6, 24 14 C 10 13.4, 2 11.6, 3 8 Z",
  "M6 7.4 C 9 3.4, 22 2, 34 2.4 C 49 3, 56 6, 55 9.6 C 53.6 13, 39 14.8, 23 14.2 C 11 13.6, 4 10.6, 6 7.4 Z",
];

/** One flat stepping stone; `far` (0–1) darkens and flattens it with distance. */
function PathStone({ stone }: { stone: PathStoneSpot }) {
  const d = STONE_SHAPES[stone.shape % STONE_SHAPES.length];
  return (
    <div
      className="absolute -translate-x-1/2"
      style={{
        left: stone.left,
        bottom: stone.bottom,
        width: stone.size,
        opacity: 1 - stone.far * 0.45,
        transform: `rotate(${stone.rot}deg) scaleY(${1 - stone.far * 0.35})`,
      }}
    >
      <svg viewBox="0 0 60 17" className="block h-auto w-full">
        <path d={d} fill="#050304" opacity="0.6" transform="translate(0 2)" />
        <path d={d} fill={stone.far > 0.5 ? "#2e2328" : "#3a2d32"} />
        <path d={d} fill="#5a4850" opacity={0.8 - stone.far * 0.5} transform="translate(30 8) scale(0.72 0.58) translate(-30 -9.5)" />
        <path d="M10 5 C 20 2.6, 36 2.2, 48 4.4" stroke="#f0a5b8" strokeOpacity={0.38 - stone.far * 0.24} strokeWidth="1.1" fill="none" strokeLinecap="round" />
        {/* moss creeping over the lower edge */}
        <path d="M8 12.6 C 14 14.4, 20 13.8, 26 14.2" stroke="#56684a" strokeOpacity="0.55" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/** A few muted lavender spikes. */
function Lavender({ seed }: { seed: number }) {
  const r = seeded(seed * 97 + 11);
  const spikes = [0, 1, 2].map((k) => ({ x: 8 + k * 7 + r() * 3, h: 30 + r() * 16, lean: (r() - 0.5) * 6 }));
  return (
    <svg viewBox="0 0 30 50" className="block h-auto w-full overflow-visible">
      {spikes.map((sp, k) => (
        <g key={k}>
          <path d={`M${r1(sp.x)} 50 Q${r1(sp.x + sp.lean * 0.3)} ${r1(50 - sp.h * 0.5)} ${r1(sp.x + sp.lean)} ${r1(50 - sp.h)}`} stroke="#566a4c" strokeWidth="0.9" fill="none" />
          {Array.from({ length: 6 }, (_, j) => {
            const t = 0.55 + j * 0.08;
            return (
              <ellipse
                key={j}
                cx={r1(sp.x + sp.lean * t * t)}
                cy={r1(50 - sp.h * t)}
                rx={r1(1.9 - j * 0.15)}
                ry={r1(2.6 - j * 0.2)}
                fill={j % 2 ? "#9b86b4" : "#b49cc8"}
                opacity={0.85}
              />
            );
          })}
        </g>
      ))}
    </svg>
  );
}

/** A loose cluster of tiny five-petal wildflowers in white, pink and lavender. */
function Wildflowers({ seed }: { seed: number }) {
  const r = seeded(seed * 131 + 7);
  const colors = ["#f6eee9", "#f2b0c1", "#c7b2d8", "#fbe1e6"];
  const items = Array.from({ length: 5 + Math.floor(r() * 3) }, () => ({
    x: 4 + r() * 52,
    h: 6 + r() * 16,
    c: colors[Math.floor(r() * colors.length)],
    s: 0.7 + r() * 0.6,
  }));
  return (
    <svg viewBox="0 0 60 30" className="block h-auto w-full overflow-visible">
      {items.map((it, k) => (
        <g key={k}>
          <path d={`M${r1(it.x)} 30 L${r1(it.x)} ${r1(30 - it.h)}`} stroke="#4f6347" strokeWidth="0.7" />
          <g transform={`translate(${r1(it.x)} ${r1(30 - it.h)}) scale(${r1(it.s)} ${r1(it.s * 0.7)})`}>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx="0" cy="-2" rx="1.5" ry="2.2" fill={it.c} transform={`rotate(${a})`} />
            ))}
            <circle r="1" fill="#efc04e" />
          </g>
        </g>
      ))}
    </svg>
  );
}

/** A white daisy (or pink cosmos) on a short stem, seen slightly from the side. */
function Daisy({ cosmos = false, stem = 26 }: { cosmos?: boolean; stem?: number }) {
  const n = cosmos ? 8 : 13;
  const petal = cosmos ? "#f3b7c8" : "#f6eee9";
  const edge = cosmos ? "#d98aa3" : "#d9c9c6";
  return (
    <svg viewBox={`-20 -14 40 ${28 + stem}`} className="block h-auto w-full overflow-visible">
      <path d={`M0 ${stem + 14} Q ${-3} ${stem * 0.5} 0 2`} stroke="#5a7050" strokeWidth="1.4" fill="none" />
      <path d={`M0 ${stem * 0.75} C -6 ${stem * 0.6}, -11 ${stem * 0.5}, -12 ${stem * 0.38} C -6 ${stem * 0.4}, -2 ${stem * 0.55}, 0 ${stem * 0.75}Z`} fill="#4b6243" />
      {Array.from({ length: n }, (_, k) => {
        const a = (k / n) * 360;
        return (
          <ellipse key={k} cx="0" cy={cosmos ? -8 : -7.5} rx={cosmos ? 4.4 : 2.2} ry={cosmos ? 8 : 7.5} fill={petal} stroke={edge} strokeWidth="0.4" transform={`scale(1 0.62) rotate(${a})`} />
        );
      })}
      <ellipse cx="0" cy="0" rx="3.6" ry="2.6" fill={cosmos ? "#e7b84f" : "#efc04e"} />
      <ellipse cx="-0.8" cy="-0.7" rx="1.6" ry="1" fill="#fbe4a1" opacity="0.8" />
    </svg>
  );
}

/** Clover-like low leaves with a couple of tiny buds. */
function Clover({ buds = true }: { buds?: boolean }) {
  const leaf = (x: number, y: number, s: number, rot: number) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {[0, 120, 240].map((a) => (
        <path key={a} d="M0 0 C -5 -3, -6 -9, -2 -11 C 0 -12, 1 -11, 0 -9 C 1 -11, 2 -12, 4 -11 C 7 -9, 5 -3, 0 0Z" fill="#41583b" stroke="#6f8a62" strokeOpacity="0.35" strokeWidth="0.6" transform={`rotate(${a})`} />
      ))}
    </g>
  );
  return (
    <svg viewBox="0 0 60 30" className="block h-auto w-full overflow-visible">
      <path d="M14 30 Q 15 22 14 17 M30 30 Q 31 20 30 13 M46 30 Q 45 23 47 18" stroke="#4f6347" strokeWidth="1.2" fill="none" />
      {leaf(14, 17, 0.9, 10)}
      {leaf(30, 13, 1.1, -14)}
      {leaf(47, 18, 0.85, 30)}
      {buds && (
        <>
          <path d="M22 30 Q 23 18 22 9" stroke="#56704c" strokeWidth="1" fill="none" />
          <ellipse cx="22" cy="7.5" rx="2.4" ry="3.4" fill="#f2b0c1" />
          <path d="M39 30 Q 38 20 40 12" stroke="#56704c" strokeWidth="1" fill="none" />
          <ellipse cx="40" cy="10.5" rx="2" ry="2.8" fill="#fbe1e6" />
        </>
      )}
    </svg>
  );
}

function FallenPetal({ rot, tone = 0 }: { rot: number; tone?: number }) {
  return (
    <svg viewBox="-8 -8 16 16" className="block h-auto w-full">
      <path
        d="M0 6 C 5 3, 6 -3, 0 -6 C -6 -3, -5 3, 0 6Z"
        fill={["#f2adc0", "#f7c6d2", "#e891aa"][tone % 3]}
        opacity="0.85"
        transform={`rotate(${rot}) scale(1 0.55)`}
      />
    </svg>
  );
}

/* placements (left in %, bottom in px from the section's bottom edge) ──── */

const STONES: (Spot & { tone?: number })[] = [
  { left: "19%", bottom: GROUND - 14, size: 58, className: "hidden sm:block" },
  { left: "73.5%", bottom: GROUND - 18, size: 72, tone: 1 },
  { left: "35%", bottom: GROUND - 6, size: 38, className: "hidden md:block" },
  { left: "96%", bottom: GROUND - 10, size: 50 },
];

// A winding path of stepping stones: large and close at the front, smaller,
// darker and closer together as it recedes toward the horizon.
type PathStoneSpot = { left: string; bottom: number; size: number; rot: number; far: number; shape: number };
const PATH_NEAR: PathStoneSpot[] = [
  { left: "50%", bottom: GROUND - 2, size: 72, rot: -5, far: 0, shape: 0 },
  { left: "53.4%", bottom: GROUND + 14, size: 54, rot: 8, far: 0.14, shape: 1 },
  { left: "51.6%", bottom: GROUND + 28, size: 42, rot: -3, far: 0.28, shape: 2 },
  { left: "48.7%", bottom: GROUND + 39, size: 32, rot: 5, far: 0.4, shape: 0 },
];
const PATH_FAR: PathStoneSpot[] = [
  { left: "50.1%", bottom: GROUND + 49, size: 25, rot: -2, far: 0.52, shape: 1 },
  { left: "52.3%", bottom: GROUND + 57, size: 19, rot: 4, far: 0.64, shape: 2 },
  { left: "51.2%", bottom: GROUND + 64, size: 14, rot: -4, far: 0.76, shape: 0 },
  { left: "49.9%", bottom: GROUND + 70, size: 10, rot: 2, far: 0.86, shape: 1 },
];

const MOSS_PATCHES: { left: string; bottom: number; w: number; h: number; className?: string }[] = [
  { left: "6%", bottom: GROUND - 18, w: 120, h: 26 },
  { left: "21%", bottom: GROUND - 10, w: 90, h: 20, className: "hidden sm:block" },
  { left: "44%", bottom: GROUND - 6, w: 70, h: 16 },
  { left: "57.5%", bottom: GROUND - 14, w: 110, h: 24 },
  { left: "78%", bottom: GROUND - 20, w: 130, h: 28 },
  { left: "97%", bottom: GROUND - 8, w: 90, h: 20, className: "hidden sm:block" },
];

const LAVENDER: Spot[] = [
  { left: "16.5%", bottom: GROUND - 10, size: 22 },
  { left: "17.8%", bottom: GROUND - 14, size: 18, flip: true },
  { left: "39%", bottom: GROUND - 8, size: 20, className: "hidden sm:block" },
  { left: "74.5%", bottom: GROUND - 12, size: 22, flip: true },
  { left: "76%", bottom: GROUND - 8, size: 17 },
  { left: "97.5%", bottom: GROUND - 12, size: 20, className: "hidden sm:block" },
];

const WILDFLOWERS: Spot[] = [
  { left: "2.5%", bottom: GROUND - 6, size: 40 },
  { left: "20%", bottom: GROUND - 16, size: 34 },
  { left: "34%", bottom: GROUND - 18, size: 36, className: "hidden sm:block" },
  { left: "45.5%", bottom: GROUND + 2, size: 30 },
  { left: "55%", bottom: GROUND + 10, size: 28, flip: true },
  { left: "60%", bottom: GROUND - 18, size: 38, className: "hidden sm:block" },
  { left: "71%", bottom: GROUND - 20, size: 34, flip: true },
  { left: "90.5%", bottom: GROUND - 16, size: 36 },
];

const DAISIES: (Spot & { cosmos?: boolean; stem?: number })[] = [
  { left: "8%", bottom: GROUND - 10, size: 42 },
  { left: "14.5%", bottom: GROUND - 16, size: 35, cosmos: true, stem: 34 },
  { left: "25%", bottom: GROUND - 8, size: 32, className: "hidden sm:block" },
  { left: "31%", bottom: GROUND - 14, size: 42, cosmos: true, stem: 30 },
  { left: "43%", bottom: GROUND - 4, size: 29, className: "hidden md:block" },
  { left: "62%", bottom: GROUND - 12, size: 38, stem: 30, className: "hidden sm:block" },
  { left: "68.5%", bottom: GROUND - 8, size: 35, cosmos: true },
  { left: "81%", bottom: GROUND - 14, size: 42, stem: 30 },
  { left: "88.5%", bottom: GROUND - 10, size: 35, cosmos: true, stem: 34, className: "hidden sm:block" },
  { left: "94%", bottom: GROUND - 18, size: 38 },
];

const CLOVERS: (Spot & { buds?: boolean })[] = [
  { left: "4%", bottom: GROUND - 10, size: 73 },
  { left: "12%", bottom: GROUND - 6, size: 62, buds: false },
  { left: "29%", bottom: GROUND - 8, size: 68, flip: true },
  { left: "46%", bottom: GROUND - 10, size: 54, buds: false, className: "hidden sm:block" },
  { left: "57%", bottom: GROUND - 8, size: 65, className: "hidden sm:block" },
  { left: "66%", bottom: GROUND - 12, size: 59, buds: false, flip: true },
  { left: "86%", bottom: GROUND - 8, size: 70, flip: true },
  { left: "92%", bottom: GROUND - 4, size: 57, buds: false, className: "hidden sm:block" },
];

const PETALS: { left: string; bottom: number; size: number; rot: number; tone: number }[] = [
  { left: "10%", bottom: GROUND - 20, size: 11, rot: 30, tone: 0 },
  { left: "22%", bottom: GROUND - 12, size: 9, rot: -50, tone: 1 },
  { left: "38%", bottom: GROUND - 16, size: 10, rot: 80, tone: 2 },
  { left: "47%", bottom: GROUND + 2, size: 8, rot: 10, tone: 0 },
  { left: "55%", bottom: GROUND - 18, size: 11, rot: -20, tone: 1 },
  { left: "64%", bottom: GROUND - 10, size: 9, rot: 120, tone: 0 },
  { left: "77%", bottom: GROUND - 22, size: 10, rot: 60, tone: 2 },
  { left: "90%", bottom: GROUND - 14, size: 9, rot: -70, tone: 1 },
];

// a few petals that drift down and come to rest among the grass — the first
// and last fall from the two big flowers in front
const SETTLING = [
  { left: "12.5%", bottom: GROUND - 6, dur: 19, delay: -4, dx: "-18px", rot: "220deg" },
  { left: "41%", bottom: GROUND - 2, dur: 23, delay: -13, dx: "50px", rot: "-160deg" },
  { left: "71%", bottom: GROUND - 10, dur: 21, delay: -8, dx: "-40px", rot: "190deg" },
  { left: "90.5%", bottom: GROUND - 4, dur: 25, delay: -18, dx: "16px", rot: "-240deg" },
];

type Fly = { left: string; bottom: number; size: number; o: number; dur: number; delay: number; fx: string; fy: string; className?: string };

// near the viewer: in front of the flowers, a little larger and brighter
const FIREFLIES: Fly[] = [
  { left: "7%", bottom: 150, size: 14, o: 1, dur: 6.5, delay: 0, fx: "10px", fy: "-14px" },
  { left: "16%", bottom: 96, size: 11, o: 0.85, dur: 8, delay: -3, fx: "-12px", fy: "-8px" },
  { left: "27%", bottom: 210, size: 12, o: 0.8, dur: 7, delay: -1.5, fx: "14px", fy: "-10px", className: "hidden sm:block" },
  { left: "39%", bottom: 120, size: 13, o: 0.9, dur: 9, delay: -5, fx: "-8px", fy: "-16px" },
  { left: "47%", bottom: 92, size: 10, o: 0.75, dur: 10, delay: -8, fx: "6px", fy: "-8px" },
  { left: "56%", bottom: 104, size: 9, o: 0.7, dur: 7.8, delay: -3.5, fx: "-6px", fy: "-10px" },
  { left: "58%", bottom: 160, size: 12, o: 0.8, dur: 7.5, delay: -2, fx: "12px", fy: "-6px", className: "hidden sm:block" },
  { left: "69%", bottom: 104, size: 14, o: 1, dur: 8.5, delay: -6, fx: "-14px", fy: "-12px" },
  { left: "82%", bottom: 190, size: 11, o: 0.85, dur: 6.8, delay: -4, fx: "8px", fy: "-14px" },
  { left: "94%", bottom: 130, size: 13, o: 0.9, dur: 9.5, delay: -7, fx: "-10px", fy: "-8px", className: "hidden sm:block" },
];

// far away: behind the flowers, over the meadow and along the path — tiny and dim
const FIREFLIES_FAR: Fly[] = [
  { left: "13%", bottom: 210, size: 6, o: 0.55, dur: 9, delay: -2, fx: "6px", fy: "-6px", className: "hidden sm:block" },
  { left: "31%", bottom: 150, size: 7, o: 0.6, dur: 11, delay: -6, fx: "-5px", fy: "-7px" },
  { left: "44%", bottom: 132, size: 5, o: 0.5, dur: 8.5, delay: -1, fx: "4px", fy: "-5px" },
  { left: "53%", bottom: 146, size: 6, o: 0.6, dur: 10, delay: -4.5, fx: "-4px", fy: "-6px" },
  { left: "62%", bottom: 176, size: 5, o: 0.45, dur: 12, delay: -9, fx: "5px", fy: "-4px", className: "hidden sm:block" },
  { left: "86%", bottom: 230, size: 7, o: 0.55, dur: 9.5, delay: -3, fx: "-6px", fy: "-6px" },
];

function Firefly({ fly }: { fly: Fly }) {
  return (
    <span
      className={`firefly absolute block rounded-full ${fly.className ?? ""}`}
      style={
        {
          left: fly.left,
          bottom: fly.bottom,
          width: fly.size,
          height: fly.size,
          "--fly-o": fly.o,
          "--fly-dur": `${fly.dur}s`,
          "--fly-delay": `${fly.delay}s`,
          "--fx": fly.fx,
          "--fy": fly.fy,
        } as CSSProperties
      }
    />
  );
}

/* ── layers ──────────────────────────────────────────────────────────────── */

export function GardenFloor({
  layer,
  id = "floor",
  path = true,
  groves = true,
  banks = false,
  className = "",
}: {
  layer: "back" | "front";
  /** Prefix for SVG gradient ids — give each garden on the page its own. */
  id?: string;
  /** The winding stepping-stone path at the centre. */
  path?: boolean;
  /** Tree and bush silhouettes at the far edges. */
  groves?: boolean;
  /** Tall wildflower banks rising at the left and right edges. */
  banks?: boolean;
  className?: string;
}) {
  const u = (name: string) => `${id}-${name}`;
  if (layer === "back") {
    return (
      <div aria-hidden className={`pointer-events-none absolute inset-x-0 bottom-0 overflow-clip ${className}`} style={{ height: 560 }}>
        {/* groves framing the left and right edges; the centre stays open */}
        {groves &&
          GROVES.map((g, side) => (
          <svg
            key={side}
            viewBox="0 0 400 440"
            className="absolute h-auto"
            style={{
              bottom: 96,
              width: "clamp(130px, 23vw, 340px)",
              [side ? "right" : "left"]: "clamp(-40px, -2vw, 0px)",
              transform: side ? "scaleX(-1)" : undefined,
            }}
          >
            <defs>
              <linearGradient id={u(`grove-far-${side}`)} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="440">
                <stop offset="0" stopColor="#3a1d2c" />
                <stop offset="1" stopColor="#1a0d14" />
              </linearGradient>
              <linearGradient id={u(`grove-mid-${side}`)} gradientUnits="userSpaceOnUse" x1="0" y1="140" x2="0" y2="440">
                <stop offset="0" stopColor="#2a1520" />
                <stop offset="1" stopColor="#120a0e" />
              </linearGradient>
            </defs>
            <g fill={`url(#${u(`grove-far-${side}`)})`} opacity="0.55">
              <path d={g.far.trunk.body} />
              <path d={g.far.trunk.branches} stroke={`url(#${u(`grove-far-${side}`)})`} strokeWidth="5" strokeLinecap="round" fill="none" />
              {g.far.crown.map(([x, y, rad], i) => (
                <circle key={i} cx={x} cy={y} r={rad} />
              ))}
            </g>
            <g fill={`url(#${u(`grove-mid-${side}`)})`} opacity="0.85">
              <path d={g.mid.trunk.body} />
              <path d={g.mid.trunk.branches} stroke={`url(#${u(`grove-mid-${side}`)})`} strokeWidth="3.5" strokeLinecap="round" fill="none" />
              {g.mid.crown.map(([x, y, rad], i) => (
                <circle key={i} cx={x} cy={y} r={rad} />
              ))}
            </g>
            <g fill="#120a0e">
              {g.bushes.map(([x, y, rad], i) => (
                <circle key={i} cx={x} cy={y} r={rad} />
              ))}
            </g>
          </svg>
          ))}

        <Strip height={H_BACK}>
          <defs>
            <linearGradient id={u("meadow-far")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0.3" stopColor="#3a1a2a" stopOpacity="0" />
              <stop offset="0.55" stopColor="#2a1320" stopOpacity="0.7" />
              <stop offset="1" stopColor="#0d080b" />
            </linearGradient>
            <linearGradient id={u("meadow-near")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0.55" stopColor="#1f1218" stopOpacity="0.6" />
              <stop offset="0.8" stopColor="#140b10" />
              <stop offset="1" stopColor="#0b0709" />
            </linearGradient>
            <linearGradient id={u("grass-far")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0.45" stopColor="#5d4a52" stopOpacity="0.7" />
              <stop offset="0.75" stopColor="#24201f" />
              <stop offset="1" stopColor="#0e0a0c" />
            </linearGradient>
          </defs>
          {/* haze sitting on the horizon */}
          <path d={MEADOW_FAR} fill={`url(#${u("meadow-far")})`} />
          <path d={FAR_GRASS} fill="#2a1a22" opacity="0.8" />
          <g opacity="0.8">
            <path d={FAR_FLOWERS.stems} stroke="#3a2530" strokeWidth="1" fill="none" />
            <path d={FAR_FLOWERS.heads} fill="#8a5268" />
          </g>
          <path d={MEADOW_NEAR} fill={`url(#${u("meadow-near")})`} />
          <path d={BACK_GRASS} fill={`url(#${u("grass-far")})`} />
        </Strip>

        {/* the far end of the path, fading into the meadow */}
        {path && PATH_FAR.map((s, i) => <PathStone key={i} stone={s} />)}

        {/* wildflower banks climbing up both edges, behind the big flowers */}
        {banks &&
          BANKS.map((b, side) => (
            <div
              key={`bank${side}`}
              className="absolute"
              style={{
                bottom: GROUND - 34,
                width: "clamp(170px, 34vw, 560px)",
                [side ? "right" : "left"]: 0,
                transform: side ? "scaleX(-1)" : undefined,
              }}
            >
              <svg
                viewBox="0 0 520 300"
                className="grass-lean block h-auto w-full"
                style={{ "--lean": "1deg", "--lean-dur": `${11 + side * 3}s`, "--lean-delay": `${-side * 4}s` } as CSSProperties}
              >
                <defs>
                  <linearGradient id={u(`bank-${side}`)} gradientUnits="userSpaceOnUse" x1="0" y1="40" x2="0" y2="300">
                    <stop offset="0" stopColor="#6d7a5f" />
                    <stop offset="0.45" stopColor="#2e3a28" />
                    <stop offset="1" stopColor="#0a0c09" />
                  </linearGradient>
                </defs>
                <path d={b.blades} fill={`url(#${u(`bank-${side}`)})`} />
                <path d={b.stems} stroke="#3f5038" strokeWidth="0.8" fill="none" />
                <path d={b.lavender} fill="#a48cc0" opacity="0.85" />
                <path d={b.pink} fill="#e89ab2" opacity="0.9" />
                <path d={b.white} fill="#f1e7e4" opacity="0.9" />
                <path d={b.centres} fill="#e9bf5c" />
              </svg>
            </div>
          ))}
        {FIREFLIES_FAR.map((f, i) => (
          <Firefly key={i} fly={f} />
        ))}
      </div>
    );
  }

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-x-0 bottom-0 overflow-clip ${className}`} style={{ height: 420 }}>
      {/* a soft contact shadow so the flower bases sit *in* the ground */}
      <div className="absolute inset-x-0 bottom-0 h-[150px] bg-[radial-gradient(70%_100%_at_50%_100%,rgba(4,2,3,0.75),transparent_70%)]" />

      {/* meadow mound + its grass, in front of the stems */}
      <Strip height={H_FRONT}>
        <defs>
          <linearGradient id={u("mound")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#21171c" />
            <stop offset="0.5" stopColor="#140d11" />
            <stop offset="1" stopColor="#0b0709" />
          </linearGradient>
          <linearGradient id={u("mound-grass")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#66745a" />
            <stop offset="0.5" stopColor="#2a3626" />
            <stop offset="1" stopColor="#100f0c" />
          </linearGradient>
        </defs>
        <path d={MOUND} fill={`url(#${u("mound")})`} />
        <path d={MOUND_GRASS} fill={`url(#${u("mound-grass")})`} />
      </Strip>

      {/* soil, with moss along its edge and a faint rose rim of horizon light */}
      <Strip height={H_FRONT}>
        <defs>
          <linearGradient id={u("soil")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a1a1f" />
            <stop offset="0.35" stopColor="#170e12" />
            <stop offset="1" stopColor="#070405" />
          </linearGradient>
          <linearGradient id={u("moss")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#56684a" stopOpacity="0.85" />
            <stop offset="1" stopColor="#233021" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={SOIL} fill={`url(#${u("soil")})`} />
        <path d={MOSS} fill={`url(#${u("moss")})`} opacity="0.7" />
      </Strip>

      {/* irregular moss patches the grass parts around */}
      {MOSS_PATCHES.map((m, i) => (
        <span
          key={`moss${i}`}
          className={`absolute block -translate-x-1/2 rounded-[50%] ${m.className ?? ""}`}
          style={{
            left: m.left,
            bottom: m.bottom,
            width: m.w,
            height: m.h,
            background: "radial-gradient(closest-side, rgba(96,118,82,0.55), rgba(58,74,50,0.35) 55%, transparent)",
          }}
        />
      ))}

      {/* the stepping-stone path, winding in from the front */}
      {path && PATH_NEAR.map((s, i) => <PathStone key={`path${i}`} stone={s} />)}

      {STONES.map((s, i) => (
        <Placed key={`stone${i}`} spot={s}>
          <Stone tone={s.tone} />
        </Placed>
      ))}
      {PETALS.map((p, i) => (
        <div key={`petal${i}`} className="absolute -translate-x-1/2" style={{ left: p.left, bottom: p.bottom, width: p.size }}>
          <FallenPetal rot={p.rot} tone={p.tone} />
        </div>
      ))}
      {CLOVERS.map((c, i) => (
        <Placed key={`clover${i}`} spot={c}>
          <Clover buds={c.buds} />
        </Placed>
      ))}
      {DAISIES.map((d, i) => (
        <Placed key={`daisy${i}`} spot={d} sway={i + 1}>
          <Daisy cosmos={d.cosmos} stem={d.stem} />
        </Placed>
      ))}
      {LAVENDER.map((l, i) => (
        <Placed key={`lav${i}`} spot={l} sway={i + 3}>
          <Lavender seed={i} />
        </Placed>
      ))}
      {WILDFLOWERS.map((w, i) => (
        <Placed key={`wild${i}`} spot={w}>
          <Wildflowers seed={i} />
        </Placed>
      ))}

      {SETTLING.map((p, i) => (
        <span
          key={`settle${i}`}
          className="petal-settle absolute block"
          style={
            {
              left: p.left,
              bottom: p.bottom,
              width: 11,
              "--settle-dur": `${p.dur}s`,
              "--settle-delay": `${p.delay}s`,
              "--settle-dx": p.dx,
              "--settle-rot": p.rot,
            } as CSSProperties
          }
        >
          <FallenPetal rot={0} tone={i} />
        </span>
      ))}

      {/* foreground grass: three strips leaning in the breeze at their own pace */}
      {FRONT_GRASS.map((d, i) => (
        <Strip
          key={`grass${i}`}
          height={H_FRONT}
          className="grass-lean"
          style={
            {
              "--lean": `${1.6 + i * 0.7}deg`,
              "--lean-dur": `${7 + i * 2.3}s`,
              "--lean-delay": `${-i * 2.9}s`,
            } as CSSProperties
          }
        >
          <defs>
            <linearGradient id={u(`front-grass-${i}`)} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={["#7d8a6c", "#66765a", "#55644b"][i]} />
              <stop offset="0.35" stopColor={["#3e4d36", "#33412d", "#2a3626"][i]} />
              <stop offset="0.7" stopColor="#141b12" />
              <stop offset="1" stopColor="#060805" />
            </linearGradient>
          </defs>
          <path d={d} fill={`url(#${u(`front-grass-${i}`)})`} />
        </Strip>
      ))}

      {FIREFLIES.map((f, i) => (
        <Firefly key={`fly${i}`} fly={f} />
      ))}
    </div>
  );
}
