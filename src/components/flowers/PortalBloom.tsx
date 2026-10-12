"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";

/**
 * The flower becomes the doorway into the garden.
 *
 *   0.00 → 0.42  petals unfurl outward from the opening flower until they
 *                cover the whole screen (the opening page is hidden beneath)
 *   0.45         `onCovered` — the opening page is removed out of sight; the
 *                real garden is already mounted underneath
 *   0.50 → 1.00  the petals part from the centre in staggered, scalloped
 *                layers, opening a doorway onto the garden, then clear away
 *
 * Every petal is vector geometry recomputed per frame, so it stays crisp at
 * any size — nothing is a scaled-up bitmap.
 */

export type PortalOrigin = { x: number; y: number; r: number };

const DURATION = 2.3;
const COVERED_AT = 0.45;

type Layer = {
  count: number;
  /** extra angular width so neighbouring petals overlap with no gaps */
  overlap: number;
  twist: number;
  /** spin while unfurling, in radians */
  spin: number;
  /** how quickly this layer parts (inner layers part first) */
  openFactor: number;
  colors: [string, string, string];
};

const LAYERS: Layer[] = [
  { count: 9, overlap: 1.35, twist: 0, spin: 0.22, openFactor: 0.82, colors: ["#f7c4d1", "#de7d9b", "#a8415f"] },
  { count: 8, overlap: 1.3, twist: 0.35, spin: -0.26, openFactor: 1.0, colors: ["#fbd6df", "#ea9bb2", "#c25676"] },
  { count: 7, overlap: 1.25, twist: 0.15, spin: 0.3, openFactor: 1.2, colors: ["#fff3f6", "#f5c0cf", "#dc86a1"] },
];

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const r1 = (n: number) => Math.round(n * 10) / 10;

/** Deterministic per-petal variation so edges look organic, not machined. */
const wobble = (layer: number, i: number) => {
  const s = Math.sin((layer + 1) * 12.9898 + i * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

/**
 * One petal reaching outward from the centre: a rounded inner tip, softly
 * bulging sides and a rounded, slightly notched outer edge.
 */
function petal(cx: number, cy: number, theta: number, halfW: number, rIn: number, rOut: number, bulge: number) {
  const at = (rad: number, ang: number) => `${r1(cx + Math.cos(ang) * rad)} ${r1(cy + Math.sin(ang) * rad)}`;
  const shoulder = rIn + bulge * 0.7;
  const span = rOut - shoulder;
  const side = (dir: 1 | -1) => [
    at(shoulder + span * 0.35, theta + dir * halfW * 1.18),
    at(shoulder + span * 0.88, theta + dir * halfW * 1.08),
    at(rOut, theta + dir * halfW * 0.52),
  ];
  const [l1, l2, l3] = side(-1);
  const [r1a, r2a, r3a] = side(1);
  return (
    `M${at(shoulder, theta - halfW)} ` +
    `C${l1} ${l2} ${l3} ` +
    `Q${at(rOut * 1.07, theta - halfW * 0.22)} ${at(rOut * 0.985, theta)} ` +
    `Q${at(rOut * 1.07, theta + halfW * 0.22)} ${r3a} ` +
    `C${r2a} ${r1a} ${at(shoulder, theta + halfW)} ` +
    `Q${at(Math.max(0, rIn - bulge * 0.35), theta)} ${at(shoulder, theta - halfW)} Z `
  );
}

function layerPath(layer: Layer, li: number, p: number, origin: PortalOrigin, far: number) {
  // outer radius: from the flower's own size out past the farthest corner
  const grow = easeInOut(clamp(p / 0.42));
  const rOut = origin.r * 1.15 + (far * 1.6 - origin.r * 1.15) * grow;

  // inner radius: a ring around the real flower that closes over it, then reopens
  let rIn: number;
  if (p < 0.45) {
    rIn = origin.r * 0.7 * (1 - easeInOut(clamp((p - 0.06) / 0.34)));
  } else {
    rIn = easeInOut(clamp((p - 0.5) / 0.46)) * far * 1.5 * layer.openFactor;
  }

  const spin = layer.spin * easeInOut(clamp(p / 0.95));
  const halfW = (Math.PI / layer.count) * layer.overlap;
  let d = "";
  for (let i = 0; i < layer.count; i++) {
    const w = wobble(li, i);
    const theta = layer.twist + spin + (i / layer.count) * Math.PI * 2 + (w - 0.5) * 0.18;
    const bulge = (rOut * 0.035 + rIn * 0.22) * (0.75 + w * 0.5);
    d += petal(origin.x, origin.y, theta, halfW * (0.92 + w * 0.16), rIn * (0.9 + w * 0.2), rOut, bulge);
  }
  return d;
}

function PetalLayer({ layer, li, p, origin, far }: { layer: Layer; li: number; p: MotionValue<number>; origin: PortalOrigin; far: number }) {
  const d = useTransform(p, (v) => layerPath(layer, li, v, origin, far));
  // layers arrive outer-first, so the bloom visibly builds up in depth
  const opacity = useTransform(p, [li * 0.04, li * 0.04 + 0.12, 0.9, 1], [0, 1, 1, 0]);
  return (
    <motion.path
      d={d}
      fill={`url(#portal-g${li})`}
      stroke="rgba(150,52,86,0.32)"
      strokeWidth={1.4}
      strokeLinejoin="round"
      style={{ opacity }}
    />
  );
}

export function PortalBloom({
  origin,
  onCovered,
  onDone,
}: {
  origin: PortalOrigin;
  onCovered: () => void;
  onDone: () => void;
}) {
  const p = useMotionValue(0);
  const covered = useRef(false);
  const callbacks = useRef({ onCovered, onDone });

  useEffect(() => {
    callbacks.current = { onCovered, onDone };
  });

  const w = typeof window === "undefined" ? 1440 : window.innerWidth;
  const h = typeof window === "undefined" ? 900 : window.innerHeight;
  // distance from the flower to the farthest corner of the screen
  const far = Math.hypot(Math.max(origin.x, w - origin.x), Math.max(origin.y, h - origin.y));

  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      if (!covered.current) {
        covered.current = true;
        callbacks.current.onCovered();
      }
      callbacks.current.onDone();
    };
    const controls = animate(p, 1, {
      duration: DURATION,
      ease: "linear",
      onUpdate: (v) => {
        if (!covered.current && v >= COVERED_AT) {
          covered.current = true;
          callbacks.current.onCovered();
        }
      },
      onComplete: finish,
    });
    // safety net: if frames stall (e.g. she switches apps mid-transition),
    // never leave the opening page stuck behind a frozen portal
    const fallback = window.setTimeout(() => {
      controls.stop();
      finish();
    }, (DURATION + 1.5) * 1000);
    return () => {
      controls.stop();
      window.clearTimeout(fallback);
    };
  }, [p]);

  // a soft burst of light as the centre opens
  const flashR = useTransform(p, [0.36, 0.62], [origin.r * 0.4, far * 0.5]);
  const flashOpacity = useTransform(p, [0.36, 0.46, 0.66], [0, 0.6, 0]);

  return (
    <svg
      aria-hidden
      className="fixed inset-0 z-[74] h-full w-full"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ pointerEvents: "auto" }}
    >
      <defs>
        {LAYERS.map((layer, li) => (
          <radialGradient key={li} id={`portal-g${li}`} gradientUnits="userSpaceOnUse" cx={origin.x} cy={origin.y} r={far * 1.4}>
            <stop offset="0%" stopColor={layer.colors[0]} />
            <stop offset="38%" stopColor={layer.colors[1]} />
            <stop offset="100%" stopColor={layer.colors[2]} />
          </radialGradient>
        ))}
        <radialGradient id="portal-flash">
          <stop offset="0%" stopColor="#fffaf4" stopOpacity="1" />
          <stop offset="45%" stopColor="#ffe1ea" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#f4a3bb" stopOpacity="0" />
        </radialGradient>
      </defs>
      {LAYERS.map((layer, li) => (
        <PetalLayer key={li} layer={layer} li={li} p={p} origin={origin} far={far} />
      ))}
      <motion.circle cx={origin.x} cy={origin.y} r={flashR} fill="url(#portal-flash)" style={{ opacity: flashOpacity }} />
    </svg>
  );
}
