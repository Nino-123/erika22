"use client";

import type { CSSProperties } from "react";
import { Images, RotateCcw } from "lucide-react";
import { site } from "@/content/site";
import { FlowerBed, type BedFlower } from "@/components/flowers/FlowerBed";
import { Reveal } from "@/components/ui/Reveal";

const FIELD: BedFlower[] = [
  { left: 3, size: "clamp(3.5rem, 9vw, 7rem)", stem: 150, palette: "peach", tilt: -14, desktopOnly: true },
  { left: 10, size: "clamp(4.5rem, 12vw, 9.5rem)", stem: 260, palette: "blush", tilt: -8 },
  { left: 21, size: "clamp(3.5rem, 8vw, 6.5rem)", stem: 120, palette: "cream", tilt: 6, desktopOnly: true },
  { left: 31, size: "clamp(4rem, 10vw, 8rem)", stem: 190, palette: "rose", tilt: -4 },
  { left: 43, size: "clamp(3rem, 7vw, 5.5rem)", stem: 90, palette: "peach", tilt: 10, desktopOnly: true },
  { left: 52, size: "clamp(3.5rem, 8vw, 6.5rem)", stem: 110, palette: "blush", tilt: -6 },
  { left: 63, size: "clamp(3rem, 7vw, 5.5rem)", stem: 95, palette: "cream", tilt: 8, desktopOnly: true },
  { left: 71, size: "clamp(4rem, 10vw, 8rem)", stem: 200, palette: "peach", tilt: 4 },
  { left: 81, size: "clamp(3.5rem, 8vw, 6.5rem)", stem: 130, palette: "rose", tilt: -10, desktopOnly: true },
  { left: 91, size: "clamp(4.5rem, 12vw, 9.5rem)", stem: 250, palette: "blush", tilt: 10 },
];

// Fixed values (not random) so server and browser render identically.
const PARTICLES = [
  { left: 8, size: 6, d: 16, delay: 0, x: 20 },
  { left: 17, size: 4, d: 12, delay: -4, x: -10 },
  { left: 26, size: 8, d: 19, delay: -9, x: 30 },
  { left: 38, size: 5, d: 14, delay: -2, x: -20 },
  { left: 47, size: 7, d: 18, delay: -11, x: 15 },
  { left: 56, size: 4, d: 13, delay: -6, x: -25 },
  { left: 64, size: 6, d: 17, delay: -1, x: 25 },
  { left: 73, size: 5, d: 15, delay: -8, x: -15 },
  { left: 82, size: 8, d: 20, delay: -13, x: 10 },
  { left: 90, size: 4, d: 12, delay: -5, x: -30 },
  { left: 33, size: 3, d: 11, delay: -7, x: 12 },
  { left: 68, size: 3, d: 10, delay: -3, x: -8 },
];

export function Finale({ onReplay }: { onReplay: () => void }) {
  const { finale, her, birthday } = site;

  return (
    <section
      id="forever"
      className="relative flex min-h-[100svh] flex-col items-center overflow-hidden bg-gradient-to-b from-[#fbe1e6] via-[#f8cdd2] to-[#f6c3ad] px-6 pt-28 pb-[38svh] text-center sm:pb-[44svh]"
    >
      {/* sunset glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-30%] left-1/2 h-[90vmax] w-[90vmax] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,240,214,0.95)_0%,rgba(255,214,190,0.55)_35%,transparent_65%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="particle"
            style={
              {
                left: `${p.left}%`,
                bottom: "8%",
                width: p.size * 2,
                height: p.size * 2,
                "--d": `${p.d}s`,
                "--delay": `${p.delay}s`,
                "--x": `${p.x}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="relative z-10 max-w-3xl">
        <Reveal>
          <p className="eyebrow text-rose-deep/80">{finale.eyebrow}</p>
        </Reveal>
        <Reveal delay={0.2}>
          <h2 className="mt-5 font-serif text-[clamp(2.4rem,7vw,4.8rem)] leading-[1.08] font-light text-ink text-balance">
            {finale.message}
          </h2>
        </Reveal>
        <Reveal delay={0.5}>
          <p className="mt-6 font-script text-[clamp(2.2rem,6vw,3.6rem)] leading-tight text-rose-deep">
            {finale.sign}, {her.name}
          </p>
        </Reveal>
        <Reveal delay={0.8}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#memories"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ivory/85 px-7 py-3 font-serif text-lg text-rose-deep shadow-[0_12px_30px_-16px_rgba(169,70,106,0.6)] backdrop-blur transition hover:bg-white"
            >
              <Images className="h-5 w-5" aria-hidden />
              {finale.memoriesButton}
            </a>
            <button
              type="button"
              onClick={onReplay}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-rose-deep/25 px-7 py-3 font-serif text-lg text-rose-deep transition hover:bg-white/40"
            >
              <RotateCcw className="h-5 w-5" aria-hidden />
              {finale.replayButton}
            </button>
          </div>
        </Reveal>
      </div>

      <FlowerBed flowers={FIELD} idPrefix="field" className="z-[6] h-full" />

      <p className="eyebrow absolute bottom-4 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-[0.62rem] text-ink/60">
        {finale.footer} · {birthday.dateLabel}
      </p>
    </section>
  );
}
