"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

const COLORS: [string, string][] = [
  ["#f4b6c6", "#fde6ec"],
  ["#ee9fb5", "#fbd3de"],
  ["#f5c4ae", "#fee8dc"],
  ["#f9dbe3", "#ffffff"],
  ["#e892aa", "#f8cbd7"],
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
  color: [string, string];
};

type Firefly = { x: number; y: number; r: number; phase: number; speed: number; drift: number; vy: number };

/**
 * Drifting petals and glowing fireflies drawn on a single <canvas> — one DOM node no matter how
 * many petals, paused when the tab is hidden, and disabled entirely for
 * people who prefer reduced motion.
 */
export function PetalCanvas({ count = 18, fireflies = 14 }: { count?: number; fireflies?: number }) {
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
      size: 5 + Math.random() * 9,
      vx: -6 + Math.random() * 20,
      vy: 14 + Math.random() * 26,
      rot: Math.random() * Math.PI * 2,
      vr: -0.7 + Math.random() * 1.4,
      flip: Math.random() * Math.PI * 2,
      vf: 0.5 + Math.random() * 1.5,
      sway: 8 + Math.random() * 28,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.45 + Math.random() * 0.45,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });

    const petals = Array.from({ length: n }, () => make(true));

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

    const draw = (p: Petal) => {
      const s = p.size;
      ctx.save();
      ctx.translate(p.x + Math.sin(p.phase) * p.sway, p.y);
      ctx.rotate(p.rot);
      ctx.scale(Math.max(0.18, Math.abs(Math.cos(p.flip))), 1);
      ctx.globalAlpha = p.alpha;
      const g = ctx.createLinearGradient(0, -s, 0, s);
      g.addColorStop(0, p.color[1]);
      g.addColorStop(1, p.color[0]);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.95, -s * 0.55, s * 0.7, s * 0.75, 0, s);
      ctx.bezierCurveTo(-s * 0.7, s * 0.75, -s * 0.95, -s * 0.55, 0, -s);
      ctx.fill();
      ctx.restore();
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (const p of petals) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.flip += p.vf * dt;
        p.phase += dt * 0.7;
        if (p.y > h + 40 || p.x < -80 || p.x > w + 80) Object.assign(p, make(false));
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
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [count, fireflies, reduced]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[5] h-full w-full"
    />
  );
}
