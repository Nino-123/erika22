"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useIsPresent, useReducedMotion } from "motion/react";
import { site } from "@/content/site";
import { Bloom } from "@/components/flowers/Bloom";
import { DreamyBackdrop } from "@/components/ui/DreamyBackdrop";

type Stage = "bud" | "blooming" | "bloomed";

/**
 * The very first thing she sees: one closed bud on a soft pink field.
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
    window.setTimeout(() => setStage("bloomed"), reduced ? 0 : 2600);
  };

  const opened = stage !== "bud";
  const words = intro.bloomMessage.split(" ");

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="A birthday surprise"
      className={`fixed inset-0 z-[70] flex ${present ? "" : "pointer-events-none"} flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#fbd9e1] via-[#fbe3e8] to-[#fdeee6] px-6`}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: "blur(10px)" }}
      transition={{ duration: reduced ? 0.01 : 1.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <DreamyBackdrop
        blobs={[
          { color: "rgba(244,160,186,0.55)", top: "-12%", left: "-20%", size: "70vmax", duration: 22 },
          { color: "rgba(253,214,190,0.65)", top: "45%", left: "40%", size: "65vmax", dx: "-40px", duration: 26 },
          { color: "rgba(255,247,240,0.9)", top: "15%", left: "25%", size: "50vmax", dx: "20px", dy: "30px" },
          { color: "rgba(222,120,150,0.25)", top: "60%", left: "-25%", size: "55vmax", duration: 30 },
        ]}
      />

      {/* editorial corner labels */}
      <div className="eyebrow pointer-events-none absolute inset-x-6 top-6 flex justify-between text-rose-deep/70 sm:inset-x-10 sm:top-8">
        <span>Nº {site.birthday.dayNumber}</span>
        <span className="hidden sm:inline">{intro.eyebrow}</span>
        <span>{site.birthday.shortLabel}</span>
      </div>

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center text-center">
        <motion.p
          className="eyebrow mb-2 text-rose-deep/80 sm:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        >
          {intro.eyebrow}
        </motion.p>

        <button
          ref={budRef}
          type="button"
          onClick={bloom}
          disabled={opened}
          aria-label={opened ? "The flower has bloomed" : "Tap the flower bud to make it bloom"}
          className="group relative grid cursor-pointer place-items-center rounded-full disabled:cursor-default"
        >
          {/* halo */}
          <span
            aria-hidden
            className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(255,250,244,0.95)_0%,rgba(255,240,236,0.4)_45%,transparent_70%)]"
            style={{ animation: "glow-pulse 4s ease-in-out infinite" }}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: reduced ? 0.01 : 1.6, ease: [0.22, 1, 0.36, 1] }}
            className={stage === "bud" ? "breathe" : ""}
          >
            {/* the bud only fills the top of the flower's canvas, so enlarge and
                centre it while closed, then let it settle as it opens */}
            <motion.div
              initial={false}
              animate={opened ? { scale: 1, y: "0%" } : { scale: 1.7, y: "22%" }}
              transition={{ duration: reduced ? 0.01 : 2.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Bloom
                id="intro-bloom"
                open={opened}
                palette="blush"
                size="min(72vw, 21rem, 42svh)"
                duration={2.6}
              />
            </motion.div>
          </motion.div>
        </button>

        <div className="relative mt-2 min-h-[13rem] w-full sm:min-h-[12rem]">
          <motion.p
            aria-hidden={opened}
            className="pointer-events-none absolute inset-x-0 top-0 font-hand text-2xl text-rose-deep/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: opened ? 0 : 1 }}
            transition={{ duration: opened ? 0.4 : 1.2, delay: opened || reduced ? 0 : 1.2 }}
          >
            {intro.tapHint}
            <span aria-hidden className="ml-2 inline-block animate-bounce">↑</span>
          </motion.p>
          {opened && (
              <motion.div key="message" className="flex flex-col items-center">
                <h1 className="font-script text-[2.9rem] leading-[1.15] text-rose-deep sm:text-[4.2rem]">
                  {words.map((word, i) => (
                    <motion.span
                      key={i}
                      className="inline-block whitespace-pre"
                      initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{
                        duration: reduced ? 0.01 : 1.2,
                        delay: reduced ? 0 : 1.1 + i * 0.28,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      {word}
                      {i < words.length - 1 ? " " : ""}
                    </motion.span>
                  ))}
                </h1>

                <motion.p
                  className="mt-4 max-w-sm font-serif text-lg leading-relaxed text-ink-soft italic sm:text-xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduced ? 0.01 : 1.2, delay: reduced ? 0 : 2.4 }}
                >
                  {intro.subtitle}
                </motion.p>

                <motion.button
                  ref={enterRef}
                  type="button"
                  onClick={onEnter}
                  className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-full border border-rose/30 bg-ivory/80 px-8 py-3 font-serif text-lg tracking-wide text-rose-deep shadow-[0_10px_30px_-12px_rgba(169,70,106,0.45)] backdrop-blur transition-colors hover:bg-white"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduced ? 0.01 : 1, delay: reduced ? 0 : 3.1 }}
                  whileHover={reduced ? undefined : { scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span aria-hidden>❀</span>
                  {intro.button}
                </motion.button>
              </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
