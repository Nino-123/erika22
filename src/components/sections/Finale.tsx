"use client";

import { ArrowUpRight, RotateCcw } from "lucide-react";
import { site } from "@/content/site";
import { FlowerBed, type BedFlower } from "@/components/flowers/FlowerBed";
import { GardenFloor, GROUND } from "@/components/flowers/GardenFloor";
import { SecretFlower } from "@/components/flowers/SecretFlower";
import { BlurText } from "@/components/ui/BlurText";
import { NightSky } from "@/components/ui/NightSky";
import { Reveal } from "@/components/ui/Reveal";
import { GlassBadge } from "@/components/ui/SectionHeading";

// `rise` roots each stem a little further back in the meadow (higher up),
// so the bases step back in depth instead of sitting on one straight line
const FIELD: BedFlower[] = [
  // far
  { left: 18, size: "clamp(2.6rem, 5vw, 4rem)", stem: 110, palette: "cream", species: "anemone", tilt: -8, squash: 0.62, depth: 0, rise: 24 },
  { left: 37, size: "clamp(2.4rem, 4.5vw, 3.6rem)", stem: 90, palette: "blush", species: "rose", tilt: 6, squash: 0.65, maxOpen: 0.3, depth: 0, desktopOnly: true, rise: 28 },
  { left: 58, size: "clamp(2.6rem, 5vw, 4rem)", stem: 100, palette: "peach", species: "peony", tilt: -4, squash: 0.6, depth: 0, rise: 20 },
  { left: 77, size: "clamp(2.6rem, 5vw, 4rem)", stem: 120, palette: "cream", species: "anemone", tilt: 10, squash: 0.66, depth: 0, desktopOnly: true, rise: 26 },
  // middle
  { left: 4, size: "clamp(3.8rem, 8vw, 6.5rem)", stem: 180, palette: "peach", species: "anemone", tilt: -14, squash: 0.7, depth: 1, desktopOnly: true, rise: 8 },
  { left: 28, size: "clamp(3.8rem, 8vw, 6.5rem)", stem: 200, palette: "rose", species: "rose", tilt: -5, squash: 0.74, depth: 1, rise: 12 },
  { left: 46, size: "clamp(3rem, 6vw, 4.8rem)", stem: 150, palette: "blush", species: "peony", tilt: 4, squash: 0.8, maxOpen: 0.25, depth: 1, desktopOnly: true, rise: 14 },
  { left: 66, size: "clamp(3.8rem, 8vw, 6.5rem)", stem: 190, palette: "cream", species: "peony", tilt: 7, squash: 0.7, depth: 1, rise: 6 },
  { left: 84, size: "clamp(3rem, 6vw, 4.8rem)", stem: 170, palette: "peach", species: "rose", tilt: 12, squash: 0.76, maxOpen: 0.3, depth: 1, rise: 10 },
  // near
  { left: 11, size: "clamp(5.5rem, 12vw, 10rem)", stem: 270, palette: "blush", species: "peony", tilt: -9, squash: 0.72, depth: 2, rise: -8 },
  { left: 92, size: "clamp(5.5rem, 12vw, 10rem)", stem: 250, palette: "blush", species: "rose", tilt: 10, squash: 0.7, depth: 2, rise: -4 },
];

export function Finale({ onReplay }: { onReplay: () => void }) {
  const { finale, her, birthday } = site;

  return (
    <section id="forever" className="relative flex min-h-[100svh] flex-col overflow-clip bg-night">
      {/* rose dusk on the horizon */}
      <NightSky glowAt="50% 100%" glow="rgba(240,150,170,0.42)" grass={false} className="fade-top" />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-35%] left-1/2 h-[80vmax] w-[110vmax] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,214,190,0.32),rgba(224,120,152,0.16)_45%,transparent)]"
      />

      {/* the garden, back to front: meadow → flowers → soil, plants and grass.
          It runs on behind the footer, so the stems grow out of real ground. */}
      {/* on phones the footer stacks into three lines, so the garden is lifted to stay in view */}
      <GardenFloor layer="back" id="finale" className="z-[5] -translate-y-9 sm:translate-y-0" />
      <FlowerBed flowers={FIELD} idPrefix="field" ground={GROUND} className="z-[6] h-full -translate-y-9 sm:translate-y-0" />
      <GardenFloor layer="front" id="finale" className="z-[7] -translate-y-9 sm:translate-y-0" />
      {/* a little surprise by the path — above the content so it can be tapped */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[11] -translate-y-9 sm:translate-y-0">
        <SecretFlower message={finale.secret} label={finale.secretLabel} style={{ left: "57%", bottom: GROUND + 4 }} />
      </div>

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
      </div>

      <footer className="relative z-10 mx-4 mb-4 sm:mx-6">
        {/* a darker, translucent glass so it stays readable over the grass */}
        <div
          className="glass-soft mx-auto flex max-w-6xl flex-col items-start justify-between gap-1 rounded-3xl py-3 pr-36 pl-5 text-sm text-white/70 sm:flex-row sm:items-center sm:gap-2 sm:rounded-full sm:px-6"
          style={{ background: "linear-gradient(180deg, rgba(24,13,19,0.6), rgba(10,6,9,0.72))" }}
        >
          <span className="font-serif text-lg text-white italic">for {her.nickname}</span>
          <span>{finale.footer}</span>
          <span className="eyebrow text-white/55">{birthday.shortLabel}</span>
        </div>
      </footer>
    </section>
  );
}
