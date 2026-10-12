"use client";

import { ArrowUpRight, RotateCcw } from "lucide-react";
import { site } from "@/content/site";
import { FlowerBed, type BedFlower } from "@/components/flowers/FlowerBed";
import { BlurText } from "@/components/ui/BlurText";
import { NightSky } from "@/components/ui/NightSky";
import { Reveal } from "@/components/ui/Reveal";
import { GlassBadge } from "@/components/ui/SectionHeading";

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

export function Finale({ onReplay }: { onReplay: () => void }) {
  const { finale, her, birthday } = site;

  return (
    <section id="forever" className="relative flex min-h-[100svh] flex-col overflow-hidden bg-night">
      {/* rose dusk on the horizon */}
      <NightSky glowAt="50% 100%" glow="rgba(240,150,170,0.42)" />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-35%] left-1/2 h-[80vmax] w-[110vmax] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,214,190,0.32),rgba(224,120,152,0.16)_45%,transparent)]"
      />

      {/* flowers root just above the footer */}
      <div className="relative flex flex-1 flex-col">
        <div className="relative z-10 flex flex-1 flex-col items-center px-6 pt-32 pb-[34svh] text-center sm:pb-[40svh]">
          <Reveal>
            <GlassBadge tag={finale.eyebrow}>{birthday.dateLabel}</GlassBadge>
          </Reveal>
          <BlurText
            text={finale.message}
            className="mt-7 max-w-4xl font-serif text-[clamp(2.8rem,8vw,6rem)] leading-[1] tracking-[-0.01em] text-white italic text-balance drop-shadow-[0_0_40px_rgba(0,0,0,0.5)]"
          />
          <Reveal delay={0.5}>
            <p className="mt-6 font-serif text-[clamp(1.6rem,4vw,2.4rem)] text-petal italic">
              {finale.sign}, {her.name}
            </p>
          </Reveal>
          <Reveal delay={0.7}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#memories" className="btn-light">
                {finale.memoriesButton} <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
              <button type="button" onClick={onReplay} className="btn-glass glass">
                <RotateCcw className="h-4 w-4" aria-hidden />
                {finale.replayButton}
              </button>
            </div>
          </Reveal>
        </div>

        <FlowerBed flowers={FIELD} idPrefix="field" className="z-[6] h-full" />
      </div>

      <footer className="relative z-10 mx-4 mb-4 sm:mx-6">
        <div className="glass-soft mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 rounded-3xl px-6 py-3 text-sm text-white/55 sm:flex-row sm:rounded-full">
          <span className="font-serif text-lg text-white italic">for {her.nickname}</span>
          <span>{finale.footer}</span>
          <span className="eyebrow text-white/40">{birthday.shortLabel}</span>
        </div>
      </footer>
    </section>
  );
}
