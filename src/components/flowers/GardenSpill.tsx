import type { CSSProperties } from "react";

/**
 * Sits on the boundary between the opening garden and Chapter I: a few
 * out-of-focus blades and blossoms in the very foreground spill over the edge
 * at both corners (the centre, where the chapter heading is, stays clear),
 * so the garden carries on past the section instead of stopping at a line.
 * Purely decorative and ignores the pointer.
 */

const r1 = (n: number) => Math.round(n * 10) / 10;

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Thick, close-up blades leaning in from the outer edge (x = 0). */
function closeBlades(seed: number) {
  const r = seeded(seed);
  let d = "";
  for (let i = 0; i < 26; i++) {
    const x = Math.pow(r(), 1.5) * 300;
    const h = 120 + (1 - x / 300) * 200 * (0.5 + r() * 0.6);
    const lean = (r() - 0.3) * h * 0.45;
    const w = 7 + r() * 9;
    const y = 320;
    d +=
      `M${r1(x)} ${y} Q${r1(x + lean * 0.3)} ${r1(y - h * 0.6)} ${r1(x + lean + w * 0.3)} ${r1(y - h)} ` +
      `Q${r1(x + w + lean * 0.35)} ${r1(y - h * 0.55)} ${r1(x + w)} ${y}Z `;
  }
  return d;
}

const BLADES = [closeBlades(5), closeBlades(19)];

// soft blossoms seen out of focus: [left/right offset %, top px, size px, colour]
const BOKEH: [number, number, number, string][][] = [
  [
    [2, -40, 120, "rgba(234,140,170,0.42)"],
    [9, 40, 80, "rgba(246,190,206,0.28)"],
    [-2, 110, 140, "rgba(200,100,140,0.22)"],
    [14, -90, 56, "rgba(250,214,224,0.22)"],
  ],
  [
    [4, -70, 110, "rgba(234,140,170,0.4)"],
    [12, 30, 70, "rgba(250,214,224,0.24)"],
    [0, 90, 130, "rgba(214,112,150,0.22)"],
  ],
];

const BLOSSOMS: [number, number, number, string][][] = [
  [
    [6, 60, 76, "#ec9db5"],
    [22, 130, 52, "#f6c9d5"],
  ],
  [
    [10, 80, 64, "#e48aa6"],
    [26, 150, 44, "#f9dbe3"],
  ],
];

export function GardenSpill() {
  return (
    <div aria-hidden className="pointer-events-none relative z-[9] h-0">

      {[0, 1].map((side) => (
        <div
          key={side}
          className="absolute -top-56 hidden h-[460px] w-[34vw] max-w-[420px] sm:block"
          style={{ [side ? "right" : "left"]: 0, transform: side ? "scaleX(-1)" : undefined } as CSSProperties}
        >
          {BOKEH[side].map(([x, y, size, color], i) => (
            <span
              key={i}
              className="absolute block rounded-full"
              style={{
                left: `${x}%`,
                top: 200 + y,
                width: size,
                height: size,
                background: `radial-gradient(closest-side, ${color}, transparent)`,
              }}
            />
          ))}
          {/* close-up grass, softly blurred (a static blur, drawn once) */}
          <svg viewBox="0 0 320 320" preserveAspectRatio="xMinYMax meet" className="absolute bottom-0 left-0 h-[320px] w-auto" style={{ filter: "blur(3px)" }}>
            <defs>
              <linearGradient id={`spill-${side}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#4a5a40" stopOpacity="0.55" />
                <stop offset="0.55" stopColor="#1c2419" stopOpacity="0.5" />
                <stop offset="1" stopColor="#060406" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={BLADES[side]} fill={`url(#spill-${side})`} />
          </svg>
          {/* two blossoms right in front of the lens, out of focus */}
          {BLOSSOMS[side].map(([x, y, size, color], i) => (
            <svg
              key={i}
              viewBox="-20 -20 40 40"
              className="absolute"
              style={{ left: `${x}%`, top: 200 + y, width: size, filter: "blur(4px)", opacity: 0.75 }}
            >
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx="0" cy="-9" rx="7" ry="10" fill={color} transform={`rotate(${a + i * 20})`} />
              ))}
              <circle r="4" fill="#f3cf86" opacity="0.8" />
            </svg>
          ))}
        </div>
      ))}
    </div>
  );
}
