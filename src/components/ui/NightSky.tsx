import type { CSSProperties } from "react";

/** Deterministic pseudo-random numbers so server and browser render the same sky. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function starField(count: number, seed: number) {
  const r = seeded(seed);
  return Array.from({ length: count }, () => {
    const x = (r() * 100).toFixed(2);
    const y = (r() * 100).toFixed(2);
    const a = (0.25 + r() * 0.6).toFixed(2);
    return `${x}vw ${y}vh 0 ${r() > 0.85 ? "1px" : "0"} rgba(255,240,245,${a})`;
  }).join(",");
}

const STARS_A = starField(70, 7);
const STARS_B = starField(40, 19);

function grassBlades(count: number, seed: number) {
  const r = seeded(seed);
  return Array.from({ length: count }, (_, i) => {
    const x = (i / count) * 1000 + r() * 20;
    const h = 40 + r() * 110;
    const lean = (r() - 0.5) * 60;
    const w = 1.5 + r() * 2.5;
    return `M${x.toFixed(1)} 200 Q ${(x + lean * 0.4).toFixed(1)} ${(200 - h * 0.6).toFixed(1)} ${(x + lean).toFixed(1)} ${(200 - h).toFixed(1)} L ${(x + w).toFixed(1)} 200 Z`;
  }).join(" ");
}

const GRASS_BACK = grassBlades(140, 3);
const GRASS_FRONT = grassBlades(90, 11);

/**
 * The midnight garden backdrop: a dusk glow on the horizon, twinkling stars,
 * and swaying grass silhouettes — the cinematic "video hero" mood, drawn
 * in a few lightweight layers instead of a heavy video file.
 */
export function NightSky({
  glow = "rgba(244,182,198,0.28)",
  glowAt = "50% 78%",
  stars = true,
  grass = true,
  className = "",
}: {
  glow?: string;
  glowAt?: string;
  stars?: boolean;
  grass?: boolean;
  className?: string;
}) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* horizon glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(60% 45% at ${glowAt}, ${glow} 0%, rgba(120,60,90,0.12) 45%, transparent 75%)`,
        }}
      />
      {stars && (
        <>
          <span
            className="absolute top-0 left-0 h-px w-px rounded-full"
            style={{ boxShadow: STARS_A, animation: "twinkle 5s ease-in-out infinite" } as CSSProperties}
          />
          <span
            className="absolute top-0 left-0 h-px w-px rounded-full"
            style={{ boxShadow: STARS_B, animation: "twinkle 7s ease-in-out -3s infinite" } as CSSProperties}
          />
        </>
      )}
      {grass && (
        <svg
          viewBox="0 0 1000 200"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-[22vh] min-h-32 w-full"
        >
          <defs>
            <linearGradient id="grass-back" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2a3a2c" stopOpacity="0.5" />
              <stop offset="1" stopColor="#0b120c" />
            </linearGradient>
            <linearGradient id="grass-front" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3b4f3a" stopOpacity="0.85" />
              <stop offset="1" stopColor="#050805" />
            </linearGradient>
          </defs>
          <path d={GRASS_BACK} fill="url(#grass-back)" />
          <path d={GRASS_FRONT} fill="url(#grass-front)" transform="translate(0 18) scale(1 0.9)" />
        </svg>
      )}
      {/* fade into the next section */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-night" />
    </div>
  );
}
