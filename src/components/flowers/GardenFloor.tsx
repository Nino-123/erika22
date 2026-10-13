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

/** Curved grass blades rooted along `root` (SVG y), as one path. */
function blades(seed: number, count: number, root: number, hMin: number, hMax: number, wMin = 2, wMax = 5) {
  const r = seeded(seed);
  let d = "";
  for (let i = 0; i < count; i++) {
    const x = (i / count) * W + r() * (W / count) * 1.6 - 10;
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
const MOUND_GRASS = blades(23, 520, SOIL_TOP - 30, 16, 66, 2, 4.4);
const SOIL = ridge(29, SOIL_TOP - 4, 5, H_FRONT);
const MOSS = ridge(31, SOIL_TOP - 7, 4, SOIL_TOP + 10);
const FRONT_GRASS = [
  blades(37, 360, H_FRONT - 8, 44, 128, 3, 6.5),
  blades(41, 280, H_FRONT - 4, 56, 160, 3.4, 7),
  blades(43, 300, H_FRONT, 34, 104, 3.6, 7.5),
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

function FlatStone() {
  return (
    <svg viewBox="0 0 60 16" className="block h-auto w-full">
      <ellipse cx="30" cy="10" rx="29" ry="6" fill="#050304" opacity="0.55" />
      <ellipse cx="30" cy="8" rx="28" ry="6.5" fill="#2a2024" />
      <ellipse cx="27" cy="6.5" rx="20" ry="3.6" fill="#3d3035" opacity="0.8" />
      <path d="M8 6 C 18 2, 34 1.5, 46 4" stroke="#f0a5b8" strokeOpacity="0.22" strokeWidth="1" fill="none" />
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

// a short path of stepping stones receding into the meadow
const STEPS: Spot[] = [
  { left: "49%", bottom: GROUND - 2, size: 54 },
  { left: "52.5%", bottom: GROUND + 16, size: 38 },
  { left: "50%", bottom: GROUND + 30, size: 26 },
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

// a few petals that drift down and come to rest among the grass
const SETTLING = [
  { left: "17%", bottom: GROUND - 6, dur: 19, delay: -4, dx: "-60px", rot: "220deg" },
  { left: "41%", bottom: GROUND - 2, dur: 23, delay: -13, dx: "50px", rot: "-160deg" },
  { left: "71%", bottom: GROUND - 10, dur: 21, delay: -8, dx: "-40px", rot: "190deg" },
  { left: "86%", bottom: GROUND - 4, dur: 25, delay: -18, dx: "70px", rot: "-240deg" },
];

const FIREFLIES = [
  { left: "7%", bottom: 150, dur: 6.5, delay: 0, fx: "10px", fy: "-14px" },
  { left: "16%", bottom: 96, dur: 8, delay: -3, fx: "-12px", fy: "-8px" },
  { left: "27%", bottom: 210, dur: 7, delay: -1.5, fx: "14px", fy: "-10px", className: "hidden sm:block" },
  { left: "39%", bottom: 120, dur: 9, delay: -5, fx: "-8px", fy: "-16px" },
  { left: "58%", bottom: 160, dur: 7.5, delay: -2, fx: "12px", fy: "-6px", className: "hidden sm:block" },
  { left: "69%", bottom: 104, dur: 8.5, delay: -6, fx: "-14px", fy: "-12px" },
  { left: "82%", bottom: 190, dur: 6.8, delay: -4, fx: "8px", fy: "-14px" },
  { left: "94%", bottom: 130, dur: 9.5, delay: -7, fx: "-10px", fy: "-8px", className: "hidden sm:block" },
];

/* ── layers ──────────────────────────────────────────────────────────────── */

export function GardenFloor({ layer, className = "" }: { layer: "back" | "front"; className?: string }) {
  if (layer === "back") {
    return (
      <div aria-hidden className={`pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden ${className}`} style={{ height: H_BACK }}>
        <Strip height={H_BACK}>
          <defs>
            <linearGradient id="meadow-far" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0.3" stopColor="#3a1a2a" stopOpacity="0" />
              <stop offset="0.55" stopColor="#2a1320" stopOpacity="0.7" />
              <stop offset="1" stopColor="#0d080b" />
            </linearGradient>
            <linearGradient id="meadow-near" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0.55" stopColor="#1f1218" stopOpacity="0.6" />
              <stop offset="0.8" stopColor="#140b10" />
              <stop offset="1" stopColor="#0b0709" />
            </linearGradient>
            <linearGradient id="grass-far" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0.45" stopColor="#5d4a52" stopOpacity="0.7" />
              <stop offset="0.75" stopColor="#24201f" />
              <stop offset="1" stopColor="#0e0a0c" />
            </linearGradient>
          </defs>
          {/* haze sitting on the horizon */}
          <path d={MEADOW_FAR} fill="url(#meadow-far)" />
          <path d={FAR_GRASS} fill="#2a1a22" opacity="0.8" />
          <g opacity="0.8">
            <path d={FAR_FLOWERS.stems} stroke="#3a2530" strokeWidth="1" fill="none" />
            <path d={FAR_FLOWERS.heads} fill="#8a5268" />
          </g>
          <path d={MEADOW_NEAR} fill="url(#meadow-near)" />
          <path d={BACK_GRASS} fill="url(#grass-far)" />
        </Strip>
      </div>
    );
  }

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden ${className}`} style={{ height: 420 }}>
      {/* a soft contact shadow so the flower bases sit *in* the ground */}
      <div className="absolute inset-x-0 bottom-0 h-[150px] bg-[radial-gradient(70%_100%_at_50%_100%,rgba(4,2,3,0.75),transparent_70%)]" />

      {/* meadow mound + its grass, in front of the stems */}
      <Strip height={H_FRONT}>
        <defs>
          <linearGradient id="mound" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#21171c" />
            <stop offset="0.5" stopColor="#140d11" />
            <stop offset="1" stopColor="#0b0709" />
          </linearGradient>
          <linearGradient id="mound-grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#66745a" />
            <stop offset="0.5" stopColor="#2a3626" />
            <stop offset="1" stopColor="#100f0c" />
          </linearGradient>
        </defs>
        <path d={MOUND} fill="url(#mound)" />
        <path d={MOUND_GRASS} fill="url(#mound-grass)" />
      </Strip>

      {/* stepping stones, half sunk in the mound */}
      {STEPS.map((s, i) => (
        <Placed key={`step${i}`} spot={s}>
          <FlatStone />
        </Placed>
      ))}

      {/* soil, with moss along its edge and a faint rose rim of horizon light */}
      <Strip height={H_FRONT}>
        <defs>
          <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a1a1f" />
            <stop offset="0.35" stopColor="#170e12" />
            <stop offset="1" stopColor="#070405" />
          </linearGradient>
          <linearGradient id="moss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#56684a" stopOpacity="0.85" />
            <stop offset="1" stopColor="#233021" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={SOIL} fill="url(#soil)" />
        <path d={MOSS} fill="url(#moss)" opacity="0.7" />
      </Strip>

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
            <linearGradient id={`front-grass-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={["#7d8a6c", "#66765a", "#55644b"][i]} />
              <stop offset="0.35" stopColor={["#3e4d36", "#33412d", "#2a3626"][i]} />
              <stop offset="0.7" stopColor="#141b12" />
              <stop offset="1" stopColor="#060805" />
            </linearGradient>
          </defs>
          <path d={d} fill={`url(#front-grass-${i})`} />
        </Strip>
      ))}

      {FIREFLIES.map((f, i) => (
        <span
          key={`fly${i}`}
          className={`firefly absolute block h-3.5 w-3.5 rounded-full ${f.className ?? ""}`}
          style={
            {
              left: f.left,
              bottom: f.bottom,
              "--fly-dur": `${f.dur}s`,
              "--fly-delay": `${f.delay}s`,
              "--fx": f.fx,
              "--fy": f.fy,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
