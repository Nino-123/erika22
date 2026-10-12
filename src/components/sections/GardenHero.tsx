"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight, Play } from "lucide-react";
import { site } from "@/content/site";
import { FlowerBed, type BedFlower } from "@/components/flowers/FlowerBed";
import { BlurText } from "@/components/ui/BlurText";
import { NightSky } from "@/components/ui/NightSky";
import { DUR, EASE_OUT, STAGGER } from "@/lib/motion";

const BED: BedFlower[] = [
  // far away — small, dim, soft focus
  { left: 22, size: "clamp(3rem, 6vw, 5rem)", stem: 130, palette: "cream", species: "anemone", tilt: -10, squash: 0.65, depth: 0, desktopOnly: true },
  { left: 31, size: "clamp(2.6rem, 5vw, 4.2rem)", stem: 90, palette: "blush", species: "rose", tilt: 8, squash: 0.7, maxOpen: 0.3, depth: 0 },
  { left: 69, size: "clamp(2.8rem, 5.5vw, 4.6rem)", stem: 110, palette: "peach", species: "anemone", tilt: -6, squash: 0.62, depth: 0 },
  { left: 79, size: "clamp(3rem, 6vw, 5rem)", stem: 150, palette: "blush", species: "peony", tilt: 12, squash: 0.7, depth: 0, desktopOnly: true },
  // middle distance, including buds that haven't opened yet
  { left: 4, size: "clamp(5rem, 10vw, 8.5rem)", stem: 240, palette: "peach", species: "rose", tilt: -16, squash: 0.72, depth: 1, desktopOnly: true },
  { left: 25, size: "clamp(3.4rem, 7vw, 5.6rem)", stem: 210, palette: "rose", species: "peony", tilt: -4, squash: 0.8, maxOpen: 0.22, depth: 1 },
  { left: 75, size: "clamp(3.4rem, 7vw, 5.6rem)", stem: 240, palette: "blush", species: "rose", tilt: 6, squash: 0.8, maxOpen: 0.3, depth: 1, desktopOnly: true },
  { left: 96, size: "clamp(5rem, 10vw, 8.5rem)", stem: 260, palette: "cream", species: "peony", tilt: 14, squash: 0.7, depth: 1, desktopOnly: true },
  // close to the viewer
  { left: 12, size: "clamp(7rem, 15vw, 12.5rem)", stem: 380, palette: "blush", species: "peony", tilt: -8, squash: 0.74, depth: 2 },
  { left: 88, size: "clamp(6.5rem, 14vw, 11.5rem)", stem: 330, palette: "rose", species: "rose", tilt: 9, squash: 0.7, depth: 2 },
];

const CHAPTERS = [
  { href: "#memories", label: "Our Memories" },
  { href: "#letter", label: "A Letter" },
  { href: "#wishes", label: "Wishes" },
  { href: "#forever", label: "Always" },
];

export function GardenHero({ entered }: { entered: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const skyY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 60]);
  const { garden, her } = site;

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 16 },
    animate: entered ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: reduced ? 0.01 : DUR.slow, delay: reduced ? 0 : delay, ease: EASE_OUT },
  });

  return (
    <section
      id="garden"
      ref={ref}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-night px-5 pt-28 pb-[30svh]"
    >
      <motion.div style={{ y: skyY }} className="absolute inset-0">
        <NightSky glowAt="50% 70%" />
      </motion.div>

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-10 flex max-w-4xl flex-col items-center text-center">
        <motion.span className="glass inline-flex items-center gap-2 rounded-full py-1 pr-4 pl-1 text-sm text-white/80" {...rise(0.3)}>
          <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-night">{garden.eyebrow}</span>
          {her.name}
        </motion.span>

        <BlurText
          as="h1"
          trigger="mount"
          play={entered}
          delay={0.5}
          text={garden.title}
          className="mt-7 font-serif text-[clamp(3.2rem,10vw,7.5rem)] leading-[0.98] tracking-[-0.015em] text-white italic text-balance drop-shadow-[0_0_40px_rgba(0,0,0,0.6)]"
        />

        <motion.p className="mt-6 max-w-xl text-base leading-relaxed font-light text-white/70 text-pretty sm:text-lg" {...rise(1.1)}>
          {garden.body}
        </motion.p>

        <motion.div className="mt-8 flex flex-col items-center gap-3 sm:flex-row" {...rise(1.3)}>
          <a href="#memories" className="btn-light">
            Our memories <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
          <a href="#letter" className="btn-glass">
            <Play className="h-3.5 w-3.5 fill-current" aria-hidden /> Read my letter
          </a>
        </motion.div>
      </motion.div>

      {entered && <FlowerBed flowers={BED} idPrefix="hero" className="z-[6] h-full" />}

      {/* chapter row — the "partners" strip from the reference */}
      <motion.nav
        aria-label="Chapters"
        className="absolute inset-x-0 bottom-5 z-10 flex justify-center px-4"
        initial={{ opacity: 0 }}
        animate={entered ? { opacity: 1 } : undefined}
        transition={{ duration: reduced ? 0.01 : DUR.slow, delay: reduced ? 0 : 1.6 }}
      >
        <ul className="glass-soft flex max-w-full items-center overflow-x-auto rounded-full px-1.5 py-1 sm:gap-1 sm:px-2 sm:py-1.5 [scrollbar-width:none]">
          {CHAPTERS.map((c, i) => (
            <motion.li
              key={c.href}
              initial={{ opacity: 0, y: reduced ? 0 : 6 }}
              animate={entered ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: reduced ? 0.01 : DUR.standard, delay: reduced ? 0 : 1.7 + i * STAGGER.standard, ease: EASE_OUT }}
            >
              <a
                href={c.href}
                className="block rounded-full px-2.5 py-2 font-serif text-[0.95rem] whitespace-nowrap sm:px-3.5 sm:text-[1.05rem] text-white/60 italic transition-colors hover:bg-white/10 hover:text-white"
              >
                {c.label}
              </a>
            </motion.li>
          ))}
        </ul>
      </motion.nav>
    </section>
  );
}
