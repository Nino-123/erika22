/**
 * Hand-sketched botanical artwork for the letter book: one larger study per
 * illustrated (left-hand) page, and small corner sprigs for reading pages.
 * Ink lines over soft watercolour washes, matching the Her Story sketches.
 */

const INK = "#6d4b54";
const r1 = (n: number) => Math.round(n * 10) / 10;

export function petals(x: number, y: number, r: number, n: number, turn = 0, stretch = 1.25) {
  let d = "";
  for (let k = 0; k < n; k++) {
    const a = turn + (k / n) * Math.PI * 2;
    const p = (ang: number, rad: number) => `${r1(x + Math.cos(ang) * rad)} ${r1(y + Math.sin(ang) * rad)}`;
    d += `M${r1(x)} ${r1(y)} Q${p(a - 0.55, r * stretch)} ${p(a, r)} Q${p(a + 0.55, r * stretch)} ${r1(x)} ${r1(y)} `;
  }
  return d;
}

export function leaf(x: number, y: number, len: number, angle: number, w = 0.38) {
  const a = (angle * Math.PI) / 180;
  const tx = x + Math.cos(a) * len;
  const ty = y + Math.sin(a) * len;
  const nx = -Math.sin(a) * len * w;
  const ny = Math.cos(a) * len * w;
  const mx = (x + tx) / 2;
  const my = (y + ty) / 2;
  return {
    shape: `M${r1(x)} ${r1(y)} Q${r1(mx + nx)} ${r1(my + ny)} ${r1(tx)} ${r1(ty)} Q${r1(mx - nx)} ${r1(my - ny)} ${r1(x)} ${r1(y)}Z`,
    vein: `M${r1(x)} ${r1(y)} L${r1(x + (tx - x) * 0.85)} ${r1(y + (ty - y) * 0.85)}`,
  };
}

function Leaves({ items }: { items: [number, number, number, number][] }) {
  return (
    <>
      {items.map(([x, y, len, ang], i) => {
        const l = leaf(x, y, len, ang);
        return (
          <g key={i}>
            <path d={l.shape} fill="#a9bb9c" opacity={0.55} />
            <path d={l.shape} fill="none" stroke={INK} strokeWidth={0.8} opacity={0.7} />
            <path d={l.vein} stroke={INK} strokeWidth={0.5} opacity={0.5} />
          </g>
        );
      })}
    </>
  );
}

function Wash({ cx, cy, r, fill, o = 0.4 }: { cx: number; cy: number; r: number; fill: string; o?: number }) {
  // stacked translucent circles give a soft watercolour bloom without a costly blur filter
  return (
    <g fill={fill}>
      <circle cx={cx} cy={cy} r={r} opacity={o * 0.35} />
      <circle cx={cx + r * 0.08} cy={cy - r * 0.05} r={r * 0.72} opacity={o * 0.45} />
      <circle cx={cx - r * 0.05} cy={cy + r * 0.04} r={r * 0.45} opacity={o * 0.55} />
    </g>
  );
}

/** A larger botanical study for an illustrated page. variant 0–4. */
export function BotanicalStudy({ variant, className }: { variant: number; className?: string }) {
  const v = ((variant % 5) + 5) % 5;
  return (
    <svg viewBox="0 0 200 240" className={className} aria-hidden fill="none" strokeLinecap="round" strokeLinejoin="round">
      {v === 0 && (
        // peony on a curving stem
        <g>
          <Wash cx={104} cy={84} r={46} fill="#f6c3cf" o={0.5} />
          <path d="M100 232 C 96 190, 108 150, 104 112" stroke={INK} strokeWidth={1.1} opacity={0.8} />
          <Leaves items={[[101, 196, 34, 200], [102, 172, 30, -25], [103, 148, 24, 205]]} />
          <path d={petals(104, 84, 40, 7, 0.2)} fill="#f2b0c1" opacity={0.55} />
          <path d={petals(104, 84, 40, 7, 0.2)} stroke={INK} strokeWidth={0.9} opacity={0.75} />
          <path d={petals(104, 84, 24, 6, 0.6)} fill="#e98fa9" opacity={0.45} />
          <path d={petals(104, 84, 24, 6, 0.6)} stroke={INK} strokeWidth={0.8} opacity={0.7} />
          <path d={petals(104, 84, 11, 5, 0.1, 1.4)} stroke={INK} strokeWidth={0.7} opacity={0.65} />
        </g>
      )}
      {v === 1 && (
        // rose sprig with a bud
        <g>
          <Wash cx={92} cy={74} r={38} fill="#f4bccb" o={0.45} />
          <Wash cx={140} cy={130} r={22} fill="#f9d6c4" o={0.4} />
          <path d="M84 232 C 90 190, 84 140, 92 100 M88 168 C 110 158, 128 146, 138 128" stroke={INK} strokeWidth={1.1} opacity={0.8} />
          <Leaves items={[[87, 206, 30, 195], [88, 186, 28, -20], [110, 156, 22, -70], [120, 150, 22, 15]]} />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const r = 6 + i * 6;
            return (
              <path
                key={i}
                d={`M${92 - r} ${74 + r * 0.15} A${r} ${r * 0.85} 0 0 1 ${92 + r * 0.9} ${74 - r * 0.2}`}
                stroke={INK}
                strokeWidth={0.85}
                opacity={0.72}
              />
            );
          })}
          <path d="M60 80 C 58 50, 120 40, 126 74 C 128 100, 70 112, 60 80 Z" fill="#ee9fb5" opacity={0.35} />
          <path d="M138 128 C 130 116, 134 104, 142 100 C 150 108, 150 120, 138 128 Z" fill="#f4b8c6" opacity={0.6} stroke={INK} strokeWidth={0.8} />
          <path d="M138 128 C 132 124, 130 118, 132 114 M138 128 C 144 124, 148 120, 148 116" stroke="#7f9673" strokeWidth={0.9} />
        </g>
      )}
      {v === 2 && (
        // two anemones
        <g>
          <Wash cx={80} cy={96} r={34} fill="#fbe1e6" o={0.7} />
          <Wash cx={134} cy={70} r={28} fill="#f9d0bd" o={0.5} />
          <path d="M80 232 C 82 190, 76 150, 80 118 M134 232 C 130 180, 140 130, 134 92" stroke={INK} strokeWidth={1.05} opacity={0.8} />
          <Leaves items={[[79, 200, 28, 205], [133, 190, 26, -30], [135, 160, 20, 210]]} />
          {[
            [80, 96, 30, "#fff4f2", 0.2],
            [134, 70, 24, "#fbd6c6", 0.5],
          ].map(([x, y, r, fill, turn], i) => (
            <g key={i}>
              <path d={petals(x as number, y as number, r as number, 6, turn as number, 1.35)} fill={fill as string} opacity={0.8} />
              <path d={petals(x as number, y as number, r as number, 6, turn as number, 1.35)} stroke={INK} strokeWidth={0.85} opacity={0.72} />
              <circle cx={x as number} cy={y as number} r={(r as number) * 0.2} fill="#3a2a2e" opacity={0.75} />
              {Array.from({ length: 12 }, (_, k) => {
                const a = (k / 12) * Math.PI * 2;
                return (
                  <circle
                    key={k}
                    cx={r1((x as number) + Math.cos(a) * (r as number) * 0.32)}
                    cy={r1((y as number) + Math.sin(a) * (r as number) * 0.32)}
                    r={1}
                    fill="#c9a36c"
                  />
                );
              })}
            </g>
          ))}
        </g>
      )}
      {v === 3 && (
        // fern frond with little buds
        <g>
          <Wash cx={110} cy={120} r={50} fill="#dfe8d5" o={0.6} />
          <path d="M70 232 C 86 170, 110 110, 140 40" stroke={INK} strokeWidth={1} opacity={0.8} />
          {Array.from({ length: 13 }, (_, k) => {
            const t = (k + 1) / 14;
            const x = 70 + (140 - 70) * t + Math.sin(t * 3) * 6;
            const y = 232 - (232 - 40) * t;
            const len = 26 * (1 - t * 0.7);
            const a = leaf(x, y, len, 200 - t * 10, 0.3);
            const b = leaf(x, y, len, -20 - t * 10, 0.3);
            return (
              <g key={k}>
                <path d={a.shape} fill="#9fb495" opacity={0.6} stroke={INK} strokeWidth={0.5} />
                <path d={b.shape} fill="#9fb495" opacity={0.6} stroke={INK} strokeWidth={0.5} />
              </g>
            );
          })}
          {[
            [44, 120],
            [160, 160],
            [150, 92],
          ].map(([x, y], i) => (
            <g key={i}>
              <path d={`M${x} ${y + 20} Q${x + 2} ${y + 8} ${x} ${y}`} stroke="#7f9673" strokeWidth={0.9} />
              <path d={`M${x} ${y} C${x - 6} ${y - 6} ${x - 4} ${y - 14} ${x} ${y - 16} C${x + 4} ${y - 14} ${x + 6} ${y - 6} ${x} ${y}Z`} fill="#f2adc0" opacity={0.75} stroke={INK} strokeWidth={0.7} />
            </g>
          ))}
        </g>
      )}
      {v === 4 && (
        // a small bouquet tied with a ribbon — for the ending
        <g>
          <Wash cx={100} cy={86} r={60} fill="#f8cdd7" o={0.45} />
          <path d="M100 180 L88 232 M100 180 L100 236 M100 180 L112 232 M100 180 L80 120 M100 180 L120 118 M100 180 L100 100" stroke={INK} strokeWidth={0.9} opacity={0.75} />
          <Leaves items={[[92, 150, 26, 210], [108, 148, 26, -30], [100, 130, 22, 250]]} />
          {[
            [80, 108, 18, "#f2b0c1", 6],
            [120, 106, 16, "#fbd6c6", 5],
            [100, 86, 20, "#ee9fb5", 7],
            [70, 140, 11, "#fff1ee", 5],
            [130, 138, 12, "#f6c3cf", 6],
          ].map(([x, y, r, fill, n], i) => (
            <g key={i}>
              <path d={petals(x as number, y as number, r as number, n as number, i * 0.4)} fill={fill as string} opacity={0.7} />
              <path d={petals(x as number, y as number, r as number, n as number, i * 0.4)} stroke={INK} strokeWidth={0.8} opacity={0.7} />
            </g>
          ))}
          <path d="M92 182 C 84 190, 76 196, 70 206 M108 182 C 116 190, 126 196, 132 206 M90 180 C 96 186, 104 186, 110 180" stroke="#d27f98" strokeWidth={1.4} opacity={0.85} />
        </g>
      )}
    </svg>
  );
}

/** Small corner sprig for reading pages; `variant` changes the flower. */
export function CornerSprig({ variant = 0, className, style }: { variant?: number; className?: string; style?: React.CSSProperties }) {
  const flowerColor = ["#f4b6c6", "#f6c7b0", "#e9a3b9", "#f8d6dd"][variant % 4];
  return (
    <svg viewBox="0 0 120 120" className={className} style={style} aria-hidden>
      <path d="M6 114 C 30 90, 52 64, 70 30" stroke="#9cae8c" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M30 88 C 18 80, 14 68, 16 60 C 26 66, 32 76, 30 88 Z" fill="#b5c4a6" />
      <path d="M44 70 C 58 70, 66 62, 68 54 C 58 54, 48 60, 44 70 Z" fill="#c3d0b5" />
      {variant % 2 === 0 && <path d="M58 46 C 48 38, 46 26, 48 18 C 56 26, 60 36, 58 46 Z" fill="#b5c4a6" />}
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} cx="72" cy="20" rx="5.5" ry="9" fill={flowerColor} transform={`rotate(${r + variant * 12} 72 28)`} />
      ))}
      <circle cx="72" cy="28" r="3.4" fill="#f1cd86" />
      {variant % 2 === 1 && (
        <path d="M24 46 C 20 40, 22 34, 26 32 C 30 34, 30 42, 24 46 Z" fill="#f2b0c1" opacity={0.8} />
      )}
    </svg>
  );
}
