import type { CSSProperties } from "react";

export type BloomPalette = "blush" | "rose" | "peach" | "cream";

type Palette = {
  outer: [string, string];
  mid: [string, string];
  inner: [string, string];
  center: [string, string];
  sepal: string;
  stem: string;
};

const PALETTES: Record<BloomPalette, Palette> = {
  blush: {
    outer: ["#e27798", "#fcdde6"],
    mid: ["#d9688a", "#f9c8d6"],
    inner: ["#c64f74", "#f4b2c4"],
    center: ["#f6d58e", "#e2a85b"],
    sepal: "#94a985",
    stem: "#8aa07c",
  },
  rose: {
    outer: ["#d65f80", "#f8c8d5"],
    mid: ["#c84f72", "#f3b4c6"],
    inner: ["#b03f62", "#ec9fb5"],
    center: ["#f4cf85", "#d99a50"],
    sepal: "#869d78",
    stem: "#7f9772",
  },
  peach: {
    outer: ["#f0a084", "#fee9dc"],
    mid: ["#ea8c73", "#fbd8c5"],
    inner: ["#e07765", "#f8c5b0"],
    center: ["#f6d690", "#e0a75c"],
    sepal: "#97ab88",
    stem: "#8aa07c",
  },
  cream: {
    outer: ["#eec3b6", "#fffbf5"],
    mid: ["#e8b2a6", "#fff2ec"],
    inner: ["#e19c98", "#fde2dc"],
    center: ["#f2d08b", "#d9a35a"],
    sepal: "#a1b392",
    stem: "#93a885",
  },
};

type Layer = {
  key: "outer" | "mid" | "inner";
  count: number;
  length: number;
  width: number;
  /** Angular offset as a fraction of one petal step. */
  offset: number;
  delay: number;
  /** Petal scale (x, y) while still a bud. */
  closed: [number, number];
  /** Petal scale when open. */
  open: number;
};

const LAYERS: Layer[] = [
  { key: "outer", count: 9, length: 92, width: 46, offset: 0, delay: 0, closed: [0.4, 0.8], open: 1 },
  { key: "mid", count: 7, length: 70, width: 38, offset: 0.5, delay: 0.16, closed: [0.38, 0.84], open: 0.96 },
  { key: "inner", count: 6, length: 46, width: 27, offset: 0.25, delay: 0.32, closed: [0.36, 0.9], open: 0.9 },
];

/** A soft teardrop petal drawn upward from the origin. */
function petalPath(length: number, width: number) {
  const L = length;
  const W = width / 2;
  return `M0 0 C ${W * 1.5} ${-L * 0.22}, ${W * 1.25} ${-L * 0.88}, ${W * 0.18} ${-L} Q 0 ${-L * 1.03}, ${-W * 0.18} ${-L} C ${-W * 1.25} ${-L * 0.88}, ${-W * 1.5} ${-L * 0.22}, 0 0 Z`;
}

function normalise(angle: number) {
  const a = ((angle % 360) + 360) % 360;
  return a > 180 ? a - 360 : a;
}

export type BloomProps = {
  open: boolean;
  palette?: BloomPalette;
  /** Rendered width in px (or any CSS length). */
  size?: number | string;
  /** Stem length in SVG units (0 = no stem). Flower head is ~210 units wide. */
  stem?: number;
  /** Seconds before the bloom begins once `open` becomes true. */
  delay?: number;
  /** Seconds the main bloom takes. */
  duration?: number;
  /** Rotates the whole head a little so a bed of flowers looks natural. */
  tilt?: number;
  className?: string;
  style?: CSSProperties;
  /** Stable id prefix for gradients (needed when many flowers share a page). */
  id: string;
};

/**
 * An SVG flower that opens from a closed bud. Every petal is a single path
 * with a CSS transform transition, so the browser animates it on the
 * compositor and there's no JS running per frame.
 */
export function Bloom({
  open,
  palette = "blush",
  size = 200,
  stem = 0,
  delay = 0,
  duration = 2.2,
  tilt = 0,
  className,
  style,
  id,
}: BloomProps) {
  const p = PALETTES[palette];
  const head = 108;
  const viewBox = `${-head} ${-head} ${head * 2} ${head * 2 + stem}`;
  const ease = "cubic-bezier(0.22, 1, 0.36, 1)";

  const petalStyle = (
    angle: number,
    layer: Layer,
    index: number,
  ): CSSProperties => {
    const a = normalise(angle);
    const transform = open
      ? `rotate(${a}deg) scale(${layer.open})`
      : `rotate(${a * 0.07}deg) scale(${layer.closed[0]}, ${layer.closed[1]})`;
    return {
      transformBox: "view-box",
      transformOrigin: "0px 0px",
      transform,
      transition: `transform ${duration}s ${ease} ${delay + layer.delay + index * 0.03}s`,
    };
  };

  return (
    <svg
      viewBox={viewBox}
      className={className}
      style={{ overflow: "visible", width: size, height: "auto", ...style }}
      aria-hidden
      focusable="false"
    >
      <defs>
        {LAYERS.map((layer) => (
          <linearGradient
            key={layer.key}
            id={`${id}-${layer.key}`}
            x1="0.5"
            y1="1"
            x2="0.5"
            y2="0"
          >
            <stop offset="0%" stopColor={p[layer.key][0]} />
            <stop offset="100%" stopColor={p[layer.key][1]} />
          </linearGradient>
        ))}
        <radialGradient id={`${id}-center`} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0%" stopColor={p.center[0]} />
          <stop offset="100%" stopColor={p.center[1]} />
        </radialGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff6ea" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff6ea" stopOpacity="0" />
        </radialGradient>
      </defs>

      {stem > 0 && (
        <g>
          <path
            d={`M0 8 C 7 ${stem * 0.3}, -9 ${stem * 0.62}, 0 ${stem + head - 4}`}
            stroke={p.stem}
            strokeWidth={5}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M1 ${stem * 0.5} C 26 ${stem * 0.38}, 46 ${stem * 0.42}, 58 ${stem * 0.3} C 40 ${stem * 0.52}, 20 ${stem * 0.56}, 1 ${stem * 0.5} Z`}
            fill={p.sepal}
            opacity={0.9}
          />
          <path
            d={`M-2 ${stem * 0.74} C -24 ${stem * 0.62}, -44 ${stem * 0.66}, -56 ${stem * 0.55} C -40 ${stem * 0.78}, -20 ${stem * 0.8}, -2 ${stem * 0.74} Z`}
            fill={p.sepal}
            opacity={0.8}
          />
        </g>
      )}

      <g transform={tilt ? `rotate(${tilt})` : undefined}>
        {/* soft glow behind the open flower */}
        <circle
          r={100}
          fill={`url(#${id}-glow)`}
          style={{
            opacity: open ? 0.85 : 0,
            transition: `opacity ${duration}s ease ${delay + 0.4}s`,
          }}
        />

        {/* sepals: hug the bud, then fold down beneath the open flower */}
        {[-34, 0, 34].map((angle, i) => (
          <path
            key={`sepal-${i}`}
            d={petalPath(40, 18)}
            fill={p.sepal}
            style={{
              transformBox: "view-box",
              transformOrigin: "0px 0px",
              transform: open
                ? `rotate(${angle === 0 ? 180 : angle * 4.4}deg) scale(0.7)`
                : `rotate(${angle}deg) scale(1)`,
              transition: `transform ${duration}s ${ease} ${delay}s`,
            }}
          />
        ))}

        {LAYERS.map((layer) => {
          const step = 360 / layer.count;
          const d = petalPath(layer.length, layer.width);
          return (
            <g key={layer.key}>
              {Array.from({ length: layer.count }, (_, i) => {
                const angle = (i + layer.offset) * step;
                return (
                  <path
                    key={i}
                    d={d}
                    fill={`url(#${id}-${layer.key})`}
                    stroke="rgba(255,255,255,0.28)"
                    strokeWidth={0.8}
                    style={petalStyle(angle, layer, i)}
                  />
                );
              })}
            </g>
          );
        })}

        {/* centre + stamens */}
        <g
          style={{
            transformBox: "view-box",
            transformOrigin: "0px 0px",
            transform: open ? "scale(1)" : "scale(0)",
            transition: `transform ${duration * 0.7}s ${ease} ${delay + duration * 0.45}s`,
          }}
        >
          <circle r={15} fill={`url(#${id}-center)`} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const r = 19 + (i % 3) * 2.5;
            return (
              <circle
                key={i}
                // rounded so server and browser render identical markup
                cx={Math.round(Math.cos(a) * r * 100) / 100}
                cy={Math.round(Math.sin(a) * r * 100) / 100}
                r={1.9}
                fill={p.center[1]}
                opacity={0.85}
              />
            );
          })}
        </g>
      </g>
    </svg>
  );
}
