"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ChevronDown } from "lucide-react";
import { site } from "@/content/site";
import { FlowerBed, type BedFlower } from "@/components/flowers/FlowerBed";
import { DreamyBackdrop } from "@/components/ui/DreamyBackdrop";

const BED: BedFlower[] = [
  { left: 6, size: "clamp(5rem, 13vw, 10rem)", stem: 260, palette: "peach", tilt: -12, desktopOnly: true },
  { left: 15, size: "clamp(7rem, 15vw, 12rem)", stem: 400, palette: "blush", tilt: -6 },
  { left: 33, size: "clamp(4.5rem, 10vw, 8rem)", stem: 190, palette: "cream", tilt: 8 },
  { left: 68, size: "clamp(4.5rem, 10vw, 8rem)", stem: 230, palette: "rose", tilt: -8 },
  { left: 86, size: "clamp(7rem, 15vw, 12rem)", stem: 360, palette: "blush", tilt: 6 },
  { left: 95, size: "clamp(5rem, 12vw, 9rem)", stem: 240, palette: "peach", tilt: 12, desktopOnly: true },
];

export function GardenHero({ entered }: { entered: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const nameY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 120]);
  const nameOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);
  const { garden, her, birthday } = site;

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 18, filter: reduced ? "none" : "blur(10px)" },
    animate: entered ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined,
    transition: { duration: reduced ? 0.01 : 1.6, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section
      id="garden"
      ref={ref}
      className="relative flex min-h-[100svh] flex-col items-center overflow-hidden bg-gradient-to-b from-[#fbd9e1] via-[#fbe3e8] to-[#fcece9] pt-28 pb-[42svh] sm:pb-[46svh]"
    >
      <DreamyBackdrop
        blobs={[
          { color: "rgba(244,160,186,0.5)", top: "-15%", left: "-15%", size: "60vmax", duration: 24 },
          { color: "rgba(255,226,206,0.75)", top: "30%", left: "45%", size: "55vmax", dx: "-30px" },
          { color: "rgba(255,250,244,0.85)", top: "5%", left: "30%", size: "45vmax", dy: "30px" },
          { color: "rgba(200,220,190,0.35)", top: "70%", left: "-10%", size: "45vmax", duration: 28 },
        ]}
      />

      {/* side labels, like the editorial posters */}
      <div aria-hidden className="eyebrow pointer-events-none absolute top-1/2 left-5 z-10 hidden -translate-y-1/2 -rotate-90 text-rose-deep/50 lg:block">
        {birthday.dateLabel}
      </div>
      <div aria-hidden className="eyebrow pointer-events-none absolute top-1/2 right-5 z-10 hidden -translate-y-1/2 rotate-90 text-rose-deep/50 lg:block">
        for you, always
      </div>

      <motion.div style={{ y: nameY, opacity: nameOpacity }} className="relative z-10 flex flex-col items-center px-6 text-center">
        <motion.p className="eyebrow text-rose-deep" {...fade(0.3)}>
          {garden.eyebrow}
        </motion.p>
        <motion.h1
          className="mt-3 font-serif text-[clamp(4rem,17vw,10.5rem)] leading-[0.95] font-light tracking-[-0.02em] text-white drop-shadow-[0_4px_30px_rgba(169,70,106,0.35)]"
          {...fade(0.5)}
        >
          {her.name}
        </motion.h1>
        <motion.p
          className="mt-5 font-serif text-2xl text-rose-deep italic sm:text-3xl"
          {...fade(0.9)}
        >
          {garden.title}
        </motion.p>
        <motion.p
          className="mt-5 max-w-md text-base leading-relaxed text-ink-soft text-pretty sm:text-[1.05rem]"
          {...fade(1.2)}
        >
          {garden.body}
        </motion.p>
      </motion.div>

      {entered && <FlowerBed flowers={BED} idPrefix="hero" className="z-[6] h-full" />}

      <motion.a
        href="#memories"
        className="eyebrow absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 rounded-full px-4 py-2 text-rose-deep/80 hover:text-rose-deep"
        {...fade(1.8)}
      >
        {garden.scrollHint}
        <ChevronDown aria-hidden className="h-4 w-4 animate-bounce" />
      </motion.a>
    </section>
  );
}
