"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useIsPresent, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/content/site";
import { Bloom } from "@/components/flowers/Bloom";
import { burstPetals } from "@/components/flowers/PetalCanvas";
import { BlurText } from "@/components/ui/BlurText";
import { NightSky } from "@/components/ui/NightSky";
import { DUR, EASE_IN, EASE_OUT } from "@/lib/motion";

type Stage = "bud" | "blooming" | "bloomed";

/**
 * The very first thing she sees: one closed bud glowing in a dark garden.
 * Tapping it makes it bloom and reveals the birthday message, then a button
 * opens the rest of the garden.
 */
export function Intro({ onEnter }: { onEnter: () => void }) {
  const [stage, setStage] = useState<Stage>("bud");
  const reduced = useReducedMotion();
  // Once she has entered, never block taps while the fade-out finishes.
  const present = useIsPresent();
  const budRef = useRef<HTMLButtonElement>(null);
  const enterRef = useRef<HTMLButtonElement>(null);
  const { intro } = site;

  useEffect(() => {
    budRef.current?.focus({ preventScroll: true, focusVisible: false } as FocusOptions);
  }, []);

  useEffect(() => {
    // Move focus for keyboard/screen-reader users without drawing a focus ring on touch.
    if (stage === "bloomed") enterRef.current?.focus({ preventScroll: true, focusVisible: false } as FocusOptions);
  }, [stage]);

  const bloom = () => {
    if (stage !== "bud") return;
    setStage("blooming");
    window.setTimeout(() => setStage("bloomed"), reduced ? 0 : 3000);
    if (!reduced) {
      // as the outer petals part, a few loose petals drift away
      window.setTimeout(() => {
        const r = budRef.current?.getBoundingClientRect();
        if (r) burstPetals(r.left + r.width / 2, r.top + r.height * 0.45);
      }, 900);
    }
  };

  const opened = stage !== "bud";

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="A birthday surprise"
      className={`fixed inset-0 z-[70] flex flex-col items-center justify-center overflow-hidden bg-night px-6 ${present ? "" : "pointer-events-none"}`}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: "blur(12px)" }}
      transition={{ duration: reduced ? 0.01 : DUR.slow, ease: EASE_IN }}
    >
      <NightSky glowAt="50% 46%" glow="rgba(244,170,192,0.22)" />

      {/* editorial corner labels */}
      <div className="eyebrow pointer-events-none absolute inset-x-6 top-6 flex justify-between text-white/45 sm:inset-x-10 sm:top-8">
        <span>©Nok {site.birthday.dayNumber}</span>
        <span>{site.birthday.shortLabel}</span>
      </div>

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        <motion.span
          className="glass inline-flex items-center gap-2 rounded-full py-1 pr-4 pl-1 text-sm text-white/80"
          initial={{ opacity: 0, y: reduced ? 0 : -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.01 : DUR.slow, delay: reduced ? 0 : 0.3, ease: EASE_OUT }}
        >
          <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-night">
            {site.birthday.dateLabel}
          </span>
          for you
        </motion.span>

        <button
          ref={budRef}
          type="button"
          onClick={bloom}
          disabled={opened}
          aria-label={opened ? "The flower has bloomed" : "Tap the flower bud to make it bloom"}
          className="group relative mt-4 grid cursor-pointer place-items-center rounded-full disabled:cursor-default"
        >
          {/* halo */}
          <span
            aria-hidden
            className="absolute inset-[4%] rounded-full bg-[radial-gradient(circle,rgba(255,214,226,0.32)_0%,rgba(244,160,186,0.12)_40%,transparent_70%)]"
            style={{ animation: "glow-pulse 4s ease-in-out infinite" }}
          />
          {/* a soft flare of light as it opens */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-[-20%] rounded-full bg-[radial-gradient(circle,rgba(255,228,236,0.55)_0%,rgba(244,170,192,0.22)_35%,transparent_68%)]"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={opened && !reduced ? { opacity: [0, 0.9, 0.35], scale: [0.6, 1.15, 1] } : { opacity: 0, scale: 0.6 }}
            transition={{ duration: 2.8, delay: 0.5, ease: EASE_OUT, times: [0, 0.4, 1] }}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: reduced ? 0.01 : 1.6, ease: EASE_OUT }}
            className={stage === "bud" ? "breathe" : ""}
          >
            {/* the bud only fills the top of the flower's canvas, so enlarge and
                centre it while closed, then let it settle as it opens */}
            <motion.div
              initial={false}
              animate={opened ? { scale: 1, y: "0%" } : { scale: 1.32, y: "16%" }}
              transition={{ duration: reduced ? 0.01 : 2.4, ease: EASE_OUT }}
            >
              <Bloom
                id="intro-bloom"
                open={opened}
                palette="blush"
                species="peony"
                seed={14}
                squash={0.9}
                size="min(72vw, 21rem, 40svh)"
                duration={3.2}
                className="glow-bloom"
              />
            </motion.div>
          </motion.div>
        </button>

        <div className="relative mt-2 min-h-[14rem] w-full">
          <motion.p
            aria-hidden={opened}
            className="pointer-events-none absolute inset-x-0 top-0 font-serif text-2xl text-white/60 italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: opened ? 0 : 1 }}
            transition={{ duration: opened ? DUR.quick : DUR.reveal, delay: opened || reduced ? 0 : 1.2 }}
          >
            {intro.tapHint}
            <span aria-hidden className="ml-2 inline-block animate-bounce not-italic">↑</span>
          </motion.p>

          {opened && (
            <div className="flex flex-col items-center">
              <BlurText
                as="h1"
                trigger="mount"
                text={intro.bloomMessage}
                delay={reduced ? 0 : 1.1}
                className="font-serif text-[clamp(2.8rem,11vw,5.2rem)] leading-[1.02] text-white italic drop-shadow-[0_0_30px_rgba(244,182,198,0.35)]"
              />

              <motion.p
                className="mt-4 max-w-md text-base leading-relaxed font-light text-white/65 sm:text-lg"
                initial={{ opacity: 0, y: reduced ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduced ? 0.01 : DUR.slow, delay: reduced ? 0 : 2.2, ease: EASE_OUT }}
              >
                {intro.subtitle}
              </motion.p>

              <motion.button
                ref={enterRef}
                type="button"
                onClick={onEnter}
                className="btn-light mt-7"
                initial={{ opacity: 0, y: reduced ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduced ? 0.01 : DUR.slow, delay: reduced ? 0 : 2.7, ease: EASE_OUT }}
              >
                {intro.button}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
