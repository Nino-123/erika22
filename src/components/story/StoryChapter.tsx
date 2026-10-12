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
        <div ref={ref} className="paper relative mx-auto grid max-w-5xl overflow-hidden rounded-[12px] md:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-[24rem] md:min-h-[36rem]" style={{ background: PAPER_WASH[3] }}>
            <SketchArt
              art={adult}
              progress={full}
              id="final-portrait"
              image={finale.image ?? story.stages[N - 1].image}
              alt={story.stages[N - 1].alt}
              className="absolute inset-x-[6%] top-[3%] h-[90%] w-[88%]"
            />
            {/* the sketchbook gives way to the real garden */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between px-2">
              <Bloom id="final-l" open={inView} species="peony" palette="blush" size="28%" stem={90} tilt={-10} squash={0.72} delay={0.3} />
              <Bloom id="final-m" open={inView} species="anemone" palette="cream" size="17%" stem={30} squash={0.66} delay={0.8} maxOpen={0.85} />
              <Bloom id="final-r" open={inView} species="rose" palette="rose" size="25%" stem={110} tilt={10} squash={0.7} delay={0.55} />
            </div>
          </div>

          <div className="relative px-7 py-10 sm:px-12 md:py-16">
            <p className="eyebrow text-ink-soft/70">{finale.label}</p>
            <BlurText
              as="h3"
              text={finale.heading}
              className="mt-4 font-serif text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.05] text-rose-deep italic"
            />
            <div className="mt-7 space-y-4 font-serif text-[1.22rem] leading-[1.7] text-ink sm:text-[1.3rem]">
              {finale.paragraphs.map((p, i) => (
                <Reveal key={i} delay={0.1 + i * 0.12} y={12}>
                  <p className={i === 0 ? "text-[1.45rem] text-rose-deep italic" : ""}>{p}</p>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.3}>
              <p className="mt-8 font-serif text-xl text-ink-soft italic">{finale.closing}</p>
              <p className="mt-1 font-hand text-[2.2rem] leading-none text-rose-deep">{site.from}</p>
            </Reveal>
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
    <div ref={ref} className="relative px-6 pt-10 pb-24 text-center md:pb-32">
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
        className="mx-auto mt-10 h-24 w-px bg-gradient-to-b from-petal/60 to-transparent"
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
      <NightSky glowAt="50% 0%" glow="rgba(244,170,192,0.12)" grass={false} />
      <div className="relative z-10 px-5 pt-24 pb-6 sm:pt-32">
        <SectionHeading eyebrow={story.eyebrow} title={story.title} intro={story.intro} />
      </div>
      <Timeline />
      <FinalPage />
      <Bridge />
    </section>
  );
}
