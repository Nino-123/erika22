"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/** Fire `burstPetals(x, y)` to release a puff of petals from a point on screen. */
export const PETAL_BURST_EVENT = "garden:petal-burst";

export function burstPetals(x: number, y: number) {
  window.dispatchEvent(new CustomEvent(PETAL_BURST_EVENT, { detail: { x, y } }));
}

// [base, middle, tip] — front face; the back face is drawn a little deeper.
const TONES: [string, string, string][] = [
  ["#d97a98", "#f2b3c5", "#fde6ec"],
  ["#c9607f", "#eea0b6", "#fbd7e0"],
  ["#e28f78", "#f6c3ae", "#fee9de"],
  ["#e7b3ab", "#f8dcd4", "#fffaf4"],
  ["#d2688a", "#f0a9bd", "#fcdfe7"],
];

type Petal = {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  flip: number;
  vf: number;
  sway: number;
  phase: number;
  alpha: number;
  tone: [string, string, string];
  /** Burst petals fly out, slow down, then fall — and are not recycled. */
  burst?: { age: number };
};

type Firefly = { x: number; y: number; r: number; phase: number; speed: number; drift: number; vy: number };

/**
 * Drifting petals and glowing fireflies drawn on a single <canvas> — one DOM
 * node no matter how many petals, paused when the tab is hidden, and disabled
 * entirely for people who prefer reduced motion.
 */
export function PetalCanvas({
  count = 18,
  fireflies = 14,
  above = false,
}: {
  count?: number;
  fireflies?: number;
  /** Draw above full-screen overlays (the opening scene). */
  above?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let last = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const small = window.matchMedia("(max-width: 640px)").matches;
    const n = Math.max(4, Math.round(count * (small ? 0.6 : 1)));

    const make = (initial: boolean): Petal => ({
      x: Math.random() * (w + 120) - 60,
      y: initial ? Math.random() * h : -30 - Math.random() * h * 0.4,
      size: 5 + Math.random() * 8,
      vx: -6 + Math.random() * 18,
      vy: 12 + Math.random() * 22,
      rot: Math.random() * Math.PI * 2,
      vr: -0.6 + Math.random() * 1.2,
      flip: Math.random() * Math.PI * 2,
      vf: 0.4 + Math.random() * 1.2,
      sway: 8 + Math.random() * 26,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.55 + Math.random() * 0.4,
      tone: TONES[Math.floor(Math.random() * TONES.length)],
    });

    const petals: Petal[] = Array.from({ length: n }, () => make(true));

    const onBurst = (e: Event) => {
      const { x, y } = (e as CustomEvent<{ x: number; y: number }>).detail;
      const amount = small ? 14 : 24;
      for (let i = 0; i < amount; i++) {
        const angle = (i / amount) * Math.PI * 2 + Math.random() * 0.4;
        const speed = 70 + Math.random() * 160;
        petals.push({
          ...make(false),
          x,
          y,
          size: 6 + Math.random() * 8,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 40,
          vr: -2 + Math.random() * 4,
          vf: 1 + Math.random() * 2,
          alpha: 0.7 + Math.random() * 0.3,
          burst: { age: 0 },
        });
      }
    };

    const makeFly = (initial: boolean): Firefly => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 10,
      r: 1.2 + Math.random() * 2.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.2,
      drift: 10 + Math.random() * 30,
      vy: 6 + Math.random() * 14,
    });
    const flies = Array.from({ length: Math.round(fireflies * (small ? 0.6 : 1)) }, () => makeFly(true));

    const drawFly = (f: Firefly) => {
      const glow = 0.35 + 0.65 * Math.max(0, Math.sin(f.phase));
      const x = f.x + Math.sin(f.phase * 0.5) * f.drift;
      const g = ctx.createRadialGradient(x, f.y, 0, x, f.y, f.r * 7);
      g.addColorStop(0, `rgba(255,244,214,${0.95 * glow})`);
      g.addColorStop(0.25, `rgba(255,214,190,${0.45 * glow})`);
      g.addColorStop(1, "rgba(255,200,210,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, f.y, f.r * 7, 0, Math.PI * 2);
      ctx.fill();
    };

    /** A soft, slightly cupped petal with a shallow notch at its tip. */
    const draw = (p: Petal) => {
      const s = p.size;
      const turn = Math.cos(p.flip);
      const back = turn < 0;
      ctx.save();
      ctx.translate(p.x + (p.burst ? 0 : Math.sin(p.phase) * p.sway), p.y);
      ctx.rotate(p.rot);
      ctx.scale(Math.max(0.16, Math.abs(turn)), 1);
      ctx.globalAlpha = p.alpha * (back ? 0.85 : 1);

      const g = ctx.createLinearGradient(0, s, 0, -s);
      g.addColorStop(0, p.tone[0]);
      g.addColorStop(0.45, back ? p.tone[0] : p.tone[1]);
      g.addColorStop(1, back ? p.tone[1] : p.tone[2]);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, s);
      ctx.bezierCurveTo(s * 1.05, s * 0.35, s * 0.95, -s * 0.75, s * 0.26, -s);
      ctx.quadraticCurveTo(0, -s * 0.8, -s * 0.26, -s);
      ctx.bezierCurveTo(-s * 0.95, -s * 0.75, -s * 1.05, s * 0.35, 0, s);
      ctx.fill();

      if (!back) {
        // light catching the curve of the petal
        ctx.globalAlpha = p.alpha * 0.35;
        ctx.fillStyle = "#fff6f8";
        ctx.beginPath();
        ctx.ellipse(s * 0.22, -s * 0.25, s * 0.22, s * 0.5, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        if (p.burst) {
          p.burst.age += dt;
          const drag = Math.exp(-2.2 * dt);
          p.vx *= drag;
          p.vy = p.vy * drag + 26 * dt;
          if (p.burst.age > 6) p.alpha -= dt * 0.5;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.flip += p.vf * dt;
        p.phase += dt * 0.7;
        const gone = p.y > h + 40 || p.x < -80 || p.x > w + 80 || p.alpha <= 0;
        if (gone) {
          if (p.burst) {
            petals.splice(i, 1);
            continue;
          }
          Object.assign(p, make(false));
        }
        draw(p);
      }
      ctx.globalAlpha = 1;
      for (const f of flies) {
        f.phase += dt * f.speed;
        f.y -= f.vy * dt;
        if (f.y < -20) Object.assign(f, makeFly(false));
        drawFly(f);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("resize", resize);
    window.addEventListener(PETAL_BURST_EVENT, onBurst);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener(PETAL_BURST_EVENT, onBurst);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [count, fireflies, reduced]);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none fixed inset-0 h-full w-full ${above ? "z-[72]" : "z-[5]"}`} />;
}
