const r1 = (n: number) => Math.round(n * 10) / 10;

/** A fern frond: leaflets along a gently curving stem. */
function fern(x0: number, y0: number, x1: number, y1: number, bend: number, size: number) {
  const cx = (x0 + x1) / 2 + bend;
  const cy = (y0 + y1) / 2;
  const at = (t: number) => {
    const u = 1 - t;
    return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1];
  };
  const leaflets: { x: number; y: number; a: number; s: number }[] = [];
  for (let k = 1; k < 15; k++) {
    const t = k / 15;
    const [x, y] = at(t);
    const [nx, ny] = at(Math.min(1, t + 0.02));
    const dir = (Math.atan2(ny - y, nx - x) * 180) / Math.PI;
    const s = size * (1 - t * 0.75);
    leaflets.push({ x: r1(x), y: r1(y), a: r1(dir - 62), s: r1(s) }, { x: r1(x), y: r1(y), a: r1(dir + 62), s: r1(s) });
  }
  return { stem: `M${x0} ${y0} Q${r1(cx)} ${r1(cy)} ${x1} ${y1}`, leaflets };
}

/** A flattened, pressed blossom with veined petals and a tufted centre. */
function Blossom({ x, y, r, petals, fill, turn = 0 }: { x: number; y: number; r: number; petals: number; fill: string; turn?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${turn})`}>
      {Array.from({ length: petals }, (_, i) => (
        <g key={i} transform={`rotate(${(360 / petals) * i})`}>
          <path
            d={`M0 0 C${r1(r * 0.55)} ${r1(-r * 0.25)} ${r1(r * 0.62)} ${r1(-r * 0.95)} 0 ${r1(-r)} C${r1(-r * 0.62)} ${r1(-r * 0.95)} ${r1(-r * 0.55)} ${r1(-r * 0.25)} 0 0Z`}
            fill={fill}
            opacity={0.88}
            stroke="#7e5a55"
            strokeOpacity={0.18}
            strokeWidth={0.6}
          />
          <path d={`M0 -2 L0 ${r1(-r * 0.8)}`} stroke="#7e5a55" strokeOpacity={0.15} strokeWidth={0.5} />
        </g>
      ))}
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        return <circle key={i} cx={r1(Math.cos(a) * r * 0.12)} cy={r1(Math.sin(a) * r * 0.12)} r={r1(r * 0.07)} fill="#c9a36c" />;
      })}
    </g>
  );
}

function Leaf({ x, y, a, s }: { x: number; y: number; a: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
      <path d="M0 0 C6 -6 7 -18 0 -26 C-7 -18 -6 -6 0 0Z" fill="#9aae94" opacity={0.92} />
      <path d="M0 -2 L0 -23" stroke="#6f8468" strokeWidth={0.5} opacity={0.6} />
    </g>
  );
}

/** A pressed-flower arrangement for the cover of the letter book. */
export function PressedFlowers({ className }: { className?: string }) {
  const f1 = fern(78, 196, 30, 40, -14, 7);
  const f2 = fern(232, 200, 276, 70, 10, 6);
  return (
    <svg viewBox="0 0 300 220" className={className} aria-hidden>
      {[f1, f2].map((f, i) => (
        <g key={i}>
          <path d={f.stem} stroke="#7f9576" strokeWidth={1.1} fill="none" />
          {f.leaflets.map((l, j) => (
            <path
              key={j}
              d="M0 0 C3 -2 4 -7 0 -10 C-4 -7 -3 -2 0 0Z"
              fill="#8ea486"
              opacity={0.85}
              transform={`translate(${l.x} ${l.y}) rotate(${l.a + 90}) scale(${r1(l.s / 6)})`}
            />
          ))}
        </g>
      ))}
      {/* sage sprigs */}
      <path d="M150 196 Q160 140 190 96" stroke="#7f9576" strokeWidth={1} fill="none" />
      <Leaf x={168} y={140} a={40} s={1.05} />
      <Leaf x={176} y={124} a={-30} s={0.95} />
      <Leaf x={186} y={104} a={30} s={0.8} />
      <path d="M140 196 Q120 150 104 116" stroke="#7f9576" strokeWidth={1} fill="none" />
      <Leaf x={122} y={148} a={-40} s={0.95} />
      <Leaf x={112} y={130} a={20} s={0.8} />
      {/* blossoms */}
      <Blossom x={150} y={118} r={30} petals={5} fill="#c99199" turn={8} />
      <Blossom x={108} y={150} r={22} petals={4} fill="#efe1cd" turn={20} />
      <Blossom x={196} y={150} r={20} petals={4} fill="#d8a7ab" turn={-12} />
      <Blossom x={128} y={84} r={14} petals={5} fill="#f2e6d6" turn={30} />
      <Blossom x={184} y={86} r={12} petals={5} fill="#e7c3bf" turn={4} />
      {/* loose petals */}
      {[
        [62, 70, -30, "#c99199"],
        [236, 54, 40, "#d8a7ab"],
        [244, 168, 110, "#efe1cd"],
        [52, 150, 70, "#e7c3bf"],
      ].map(([x, y, a, fill], i) => (
        <path
          key={i}
          d="M0 0 C6 -4 7 -14 0 -18 C-7 -14 -6 -4 0 0Z"
          fill={fill as string}
          opacity={0.85}
          transform={`translate(${x} ${y}) rotate(${a})`}
        />
      ))}
    </svg>
  );
}
