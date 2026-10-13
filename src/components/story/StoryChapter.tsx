"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ChevronDown } from "lucide-react";
import { site } from "@/content/site";
import { story } from "@/content/story";
import { Bloom } from "@/components/flowers/Bloom";
import { burstPetals } from "@/components/flowers/PetalCanvas";
import { BlurText } from "@/components/ui/BlurText";
import { NightSky } from "@/components/ui/NightSky";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DUR, EASE_OUT } from "@/lib/motion";
import { STAGE_ART, adult } from "./art";
import { Butterfly, CornerSpray, Flourish, LetterDivider, PressedFlower, SideStem, Sparkle, TinyDaisies, WaxSeal } from "./LetterDecor";
import { SketchArt } from "./SketchArt";

const N = story.stages.length;
const clamp = (v: number) => Math.max(0, Math.min(1, v));

/** Watercolour light on the paper, one mood per stage. */
const PAPER_WASH = [
  "radial-gradient(70% 55% at 75% 18%, rgba(205,196,240,0.45), transparent 70%), radial-gradient(80% 60% at 30% 85%, rgba(246,190,206,0.45), transparent 70%)",
  "radial-gradient(70% 55% at 20% 25%, rgba(250,206,184,0.5), transparent 70%), radial-gradient(80% 60% at 80% 80%, rgba(246,184,204,0.45), transparent 70%)",
  "radial-gradient(70% 55% at 80% 20%, rgba(214,180,210,0.45), transparent 70%), radial-gradient(80% 60% at 20% 85%, rgba(234,170,190,0.4), transparent 70%)",
  "radial-gradient(70% 60% at 50% 30%, rgba(250,200,214,0.55), transparent 72%), radial-gradient(90% 50% at 50% 100%, rgba(170,196,160,0.45), transparent 70%)",
];

const SCENE_GLOW = [
  "rgba(170,160,230,0.22)",
  "rgba(250,190,160,0.22)",
  "rgba(214,150,190,0.22)",
  "rgba(244,170,192,0.3)",
];

/** One stage of the storybook: draws itself, then gives way to the next page. */
function StageLayer({ k, progress, reduced }: { k: number; progress: MotionValue<number>; reduced: boolean }) {
  const stage = story.stages[k];
  const local = useTransform(progress, (v) => (v - k / N) * N);
  const draw = useTransform(local, (v) => (reduced ? 1 : clamp(v / 0.6)));
  const opacity = useTransform(local, (v) => {
    let o = 1;
    if (k > 0) o = Math.min(o, clamp((v + 0.08) / 0.1));
    if (k < N - 1) o = Math.min(o, clamp((1.02 - v) / 0.12));
    return o;
  });
  const y = useTransform(local, [0.9, 1.02], [0, reduced ? 0 : -10]);
  return (
    <motion.div className="absolute inset-0" style={{ opacity, y }} aria-hidden={false}>
      <div className="absolute inset-0 rounded-[inherit]" style={{ background: PAPER_WASH[k] }} />
      <SketchArt
        art={STAGE_ART[k]}
        progress={draw}
        id={`stage-${k}`}
        image={stage.image}
        alt={stage.alt}
        className="absolute inset-[4%] h-[92%] w-[92%]"
      />
    </motion.div>
  );
}

function SceneGlow({ k, progress }: { k: number; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, (v) => {
    const local = (v - k / N) * N;
    return clamp(1 - Math.abs(local - 0.5) * 1.6);
  });
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ opacity, background: `radial-gradient(50% 55% at 38% 50%, ${SCENE_GLOW[k]}, transparent 70%)` }}
    />
  );
}

/** The sketchbook page the illustrations live on. */
function Paper({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`paper relative -rotate-1 rounded-[10px] ${className}`}>
      {/* stitched spine of the sketchbook */}
      <div aria-hidden className="absolute inset-y-6 left-3 border-l border-dashed border-ink/15" />
      {children}
    </div>
  );
}

function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.55", "end end"] });
  const [active, setActive] = useState(0);
  const barWidth = useTransform(scrollYProgress, (v) => `${clamp(v) * 100}%`);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(N - 1, Math.max(0, Math.floor(v * N)));
    setActive((prev) => (prev === i ? prev : i));
  });

  const stage = story.stages[active];

  return (
    <div ref={ref} className="relative" style={{ height: `${N * 150}svh` }}>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        {Array.from({ length: N }, (_, k) => (
          <SceneGlow key={k} k={k} progress={scrollYProgress} />
        ))}

        <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col items-center justify-center gap-3 px-5 pt-[4.5rem] pb-[5.25rem] md:flex-row md:gap-16 md:pt-16 md:pb-5">
          <Paper className="aspect-[400/520] h-[min(46svh,118vw)] shrink-0 md:h-[min(76svh,700px)]">
            <div className="absolute inset-0 overflow-hidden rounded-[10px]">
              {Array.from({ length: N }, (_, k) => (
                <StageLayer key={k} k={k} progress={scrollYProgress} reduced={reduced} />
              ))}
            </div>
            <span className="eyebrow absolute right-4 bottom-3 text-[0.6rem] text-ink/45">{stage.label}</span>
          </Paper>

          <div className="w-full max-w-md md:w-[26rem]">
            {/* which part of her story we're in */}
            <nav aria-label="Her story so far" className="mb-3 md:mb-7">
              <ol className="flex gap-1.5">
                {story.stages.map((s, i) => (
                  <li key={s.label} className="flex-1">
                    <span
                      className={`block text-[0.62rem] font-medium tracking-[0.18em] uppercase transition-colors duration-500 ${
                        i === active ? "text-petal" : i < active ? "text-white/55" : "text-white/25"
                      }`}
                    >
                      {s.label.replace("Chapter ", "")}
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-2 h-px w-full bg-white/10">
                <motion.div className="h-px bg-gradient-to-r from-petal/40 to-petal" style={{ width: barWidth }} />
              </div>
            </nav>

            <div className="relative min-h-[12rem] md:min-h-[17rem]" aria-live="polite">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: reduced ? 0 : 14, filter: reduced ? "none" : "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: reduced ? 0 : -10, filter: reduced ? "none" : "blur(6px)" }}
                  transition={{ duration: reduced ? 0.01 : DUR.slow, ease: EASE_OUT }}
                >
                  <p className="eyebrow text-white/45">
                    {stage.label} · <span className="normal-case tracking-normal italic">{stage.kicker}</span>
                  </p>
                  <h3 className="mt-1.5 font-serif text-[clamp(2rem,6vw,3.6rem)] leading-[1.02] text-white italic">
                    {stage.title}
                  </h3>
                  <p className="mt-2.5 text-[0.95rem] leading-[1.6] font-light text-white/70 text-pretty md:mt-5 md:text-[1.08rem] md:leading-relaxed">
                    {stage.text}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {active < N - 1 && (
              <p className="eyebrow mt-2 hidden items-center gap-2 text-white/35 md:flex">
                {story.scrollHint} <ChevronDown className="h-3.5 w-3.5 animate-bounce" aria-hidden />
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The final page: her portrait at 22 and a birthday message. */
function FinalPage() {
  const full = useMotionValue(1);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const { finale } = story;

  return (
    <div className="relative px-4 py-20 sm:px-8 md:py-28">
      <Reveal>
        <div
          ref={ref}
          className="paper relative mx-auto grid max-w-5xl overflow-hidden rounded-[12px] md:grid-cols-[0.95fr_1.05fr]"
        >
          {/* stationery: soft inner depth, a sage tint low down, and a fine double border */}
          <div aria-hidden className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] shadow-[inset_0_0_70px_rgba(169,70,106,0.09)]" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5"
            style={{ background: "linear-gradient(to top, rgba(170,196,160,0.16), transparent)" }}
          />
          <div aria-hidden className="pointer-events-none absolute inset-[10px] z-20 rounded-[7px] border border-[#c98a9b]/45" />
          <div aria-hidden className="pointer-events-none absolute inset-[15px] z-20 rounded-[5px] border border-[#c98a9b]/25" />

          {/* left: an illustrated garden vignette around her portrait */}
          <div className="relative min-h-[24rem] md:min-h-[36rem]" style={{ background: PAPER_WASH[3] }}>
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: "radial-gradient(60% 45% at 50% 35%, rgba(251,214,224,0.55), transparent 75%)" }}
            />
            <SketchArt
              art={adult}
              progress={full}
              id="final-portrait"
              image={finale.image ?? story.stages[N - 1].image}
              alt={story.stages[N - 1].alt}
              className="absolute inset-x-[6%] top-[3%] h-[90%] w-[88%]"
            />
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <Sparkle className="absolute top-[9%] left-[12%] w-3.5" delay={0} />
              <Sparkle className="absolute top-[15%] right-[14%] w-4" delay={1.4} />
              <Sparkle className="absolute top-[44%] right-[7%] w-2.5" delay={2.3} />
              <Sparkle className="absolute top-[56%] left-[7%] w-3 max-sm:hidden" delay={0.8} />
              <Sparkle className="absolute top-[5%] left-[58%] w-2.5 max-sm:hidden" delay={3} />
              <Butterfly className="absolute top-[20%] right-[8%] w-10 rotate-[14deg]" />
              <Butterfly className="absolute top-[36%] left-[5%] w-7 -rotate-[18deg] max-sm:hidden" tone="#f9d6c4" />
              <span className="letter-petal absolute top-[10%] left-[70%] block w-2.5">
                <svg viewBox="-8 -8 16 16" className="block h-auto w-full">
                  <path d="M0 6 C 5 3, 6 -3, 0 -6 C -6 -3, -5 3, 0 6Z" fill="#f2adc0" transform="scale(1 0.6)" />
                </svg>
              </span>
              <SideStem className="absolute bottom-0 left-[1%] h-[46%] w-auto" />
              <SideStem className="absolute right-[1%] bottom-0 h-[38%] w-auto max-sm:hidden" flip />
            </div>
            {/* the sketchbook gives way to the real garden */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between px-2">
              <Bloom id="final-l" open={inView} species="peony" palette="blush" size="28%" stem={90} tilt={-10} squash={0.72} delay={0.3} />
              <Bloom id="final-m" open={inView} species="anemone" palette="cream" size="17%" stem={30} squash={0.66} delay={0.8} maxOpen={0.85} />
              <Bloom id="final-r" open={inView} species="rose" palette="rose" size="25%" stem={110} tilt={10} squash={0.7} delay={0.55} />
            </div>
            <div aria-hidden className="pointer-events-none absolute bottom-[1%] left-[31%] w-[13%]">
              <span className="letter-glow absolute inset-[-40%] block rounded-full" />
              <TinyDaisies className="relative block h-auto w-full" />
            </div>
          </div>

          {/* right: the letter itself, typeset on the stationery */}
          <div className="relative px-8 py-12 sm:px-12 md:py-16 md:pr-14">
            <CornerSpray className="pointer-events-none absolute top-[14px] right-[14px] w-24 -scale-x-100 sm:w-32" />
            <WaxSeal className="pointer-events-none absolute top-[20px] right-[22px] w-8 -rotate-[10deg] sm:top-[36px] sm:right-[46px] sm:w-12" />
            <CornerSpray
              className="pointer-events-none absolute right-[14px] bottom-[14px] w-20 -scale-100 opacity-80 max-sm:hidden"
              flowers={["#fbe1e6", "#f4bccb", "#f6d0bd"]}
            />

            <div className="relative max-w-[30rem]">
              <p className="eyebrow flex items-center gap-2 pr-10 text-ink-soft/75 sm:pr-0">
                <PressedFlower className="h-5 w-5 shrink-0" />
                {finale.label}
              </p>
              <BlurText
                as="h3"
                text={finale.heading}
                className="mt-4 pr-12 font-serif text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.05] text-rose-deep italic text-balance sm:pr-16"
              />
              <Reveal delay={0.1} y={12}>
                <p className="mt-6 font-serif text-[1.55rem] leading-snug text-rose-deep italic">{finale.paragraphs[0]}</p>
                <LetterDivider className="mt-4 mb-1 w-36" />
              </Reveal>
              <div className="mt-4 space-y-4 font-serif text-[1.15rem] leading-[1.75] text-[#4a2f36] text-pretty sm:text-[1.22rem]">
                {finale.paragraphs.slice(1).map((p, i) => (
                  <Reveal key={i} delay={0.2 + i * 0.12} y={12}>
                    <p>{p}</p>
                  </Reveal>
                ))}
              </div>
              <Reveal delay={0.3}>
                <p className="mt-9 font-hand text-[1.75rem] leading-tight text-ink-soft">{finale.closing}</p>
                <p className="mt-1 font-hand text-[2.5rem] leading-none text-rose-deep">{site.from}</p>
                <Flourish className="mt-1 w-32" />
              </Reveal>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

/** "And somewhere along the way…" — petals drift down into Chapter II. */
function Bridge() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!inView || reduced) return;
    const t = window.setTimeout(() => burstPetals(window.innerWidth / 2, window.innerHeight * 0.45), 700);
    return () => window.clearTimeout(t);
  }, [inView, reduced]);

  return (
    <div ref={ref} className="relative px-6 pt-10 pb-14 text-center md:pb-20">
      <div aria-hidden className="mx-auto mb-6 flex w-fit items-end gap-3">
        <Bloom id="bridge-a" open={inView} species="rose" palette="blush" size="3.2rem" squash={0.7} tilt={-12} />
        <Bloom id="bridge-b" open={inView} species="peony" palette="peach" size="4.2rem" squash={0.75} delay={0.3} />
        <Bloom id="bridge-c" open={inView} species="anemone" palette="cream" size="3rem" squash={0.68} tilt={10} delay={0.6} />
      </div>
      <BlurText
        as="p"
        text={story.bridge}
        className="mx-auto max-w-3xl font-serif text-[clamp(1.9rem,5vw,3.2rem)] leading-[1.1] text-white italic text-balance"
      />
      <motion.div
        aria-hidden
        className="mx-auto mt-8 h-16 w-px bg-gradient-to-b from-petal/60 to-transparent"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={inView ? { scaleY: 1, opacity: 1 } : undefined}
        style={{ transformOrigin: "top" }}
        transition={{ duration: reduced ? 0.01 : 1.6, delay: reduced ? 0 : 1, ease: EASE_OUT }}
      />
    </div>
  );
}

/** Chapter I — the story of her life, from the first page to twenty-two. */
export function StoryChapter() {
  return (
    <section id="story" className="relative bg-night">
      <NightSky glowAt="50% 12%" glow="rgba(244,170,192,0.1)" grass={false} className="fade-edges" />
      <div className="relative z-10 px-5 pt-24 pb-6 sm:pt-32">
        <SectionHeading eyebrow={story.eyebrow} title={story.title} intro={story.intro} />
      </div>
      <Timeline />
      <FinalPage />
      <Bridge />
    </section>
  );
}
