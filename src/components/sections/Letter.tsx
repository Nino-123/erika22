"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { site } from "@/content/site";
import { Bloom } from "@/components/flowers/Bloom";
import { DreamyBackdrop } from "@/components/ui/DreamyBackdrop";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Types the greeting once, then hands over to the (instantly readable) letter. */
function TypedGreeting({ text, start, onDone }: { text: string; start: boolean; onDone: () => void }) {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);
  const shown = reduced ? text.length : count;

  useEffect(() => {
    if (!start || reduced) return;
    let i = 0;
    let timer = 0;
    const step = () => {
      i += 1;
      setCount(i);
      if (i < text.length) timer = window.setTimeout(step, 90 + Math.random() * 70);
      else timer = window.setTimeout(onDone, 350);
    };
    timer = window.setTimeout(step, 500);
    return () => window.clearTimeout(timer);
  }, [start, reduced, text, onDone]);

  return (
    <p className="font-serif text-[2.2rem] leading-tight text-rose-deep italic sm:text-[2.8rem]">
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.slice(0, shown)}
        {shown < text.length && <span className="caret" />}
      </span>
    </p>
  );
}

/** Small floral sprigs tucked into the corners of the letter. */
function CornerSprig({ className, flip = false }: { className: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden style={flip ? { transform: "scale(-1,-1)" } : undefined}>
      <path d="M6 114 C 30 90, 52 64, 70 30" stroke="#9cae8c" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M30 88 C 18 80, 14 68, 16 60 C 26 66, 32 76, 30 88 Z" fill="#b5c4a6" />
      <path d="M44 70 C 58 70, 66 62, 68 54 C 58 54, 48 60, 44 70 Z" fill="#c3d0b5" />
      <path d="M58 46 C 48 38, 46 26, 48 18 C 56 26, 60 36, 58 46 Z" fill="#b5c4a6" />
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} cx="72" cy="20" rx="5.5" ry="9" fill="#f4b6c6" transform={`rotate(${r} 72 28)`} />
      ))}
      <circle cx="72" cy="28" r="3.6" fill="#f1cd86" />
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={`s${r}`} cx="22" cy="44" rx="3.5" ry="6" fill="#f9d2dc" transform={`rotate(${r} 22 50)`} />
      ))}
      <circle cx="22" cy="50" r="2.4" fill="#f1cd86" />
    </svg>
  );
}

export function Letter() {
  const { letter, from, birthday } = site;
  const reduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, amount: 0.3 });
  const [typed, setTyped] = useState(false);
  const finishTyping = useCallback(() => setTyped(true), []);
  const showBody = typed || !!reduced;

  return (
    <section
      id="letter"
      className="relative overflow-hidden bg-night px-4 pt-24 pb-28 sm:px-8 sm:pt-32 sm:pb-36"
    >
      <DreamyBackdrop
        blobs={[
          { color: "rgba(246,199,176,0.13)", top: "20%", left: "40%", size: "55vmax" },
          { color: "rgba(169,70,106,0.2)", top: "50%", left: "-25%", size: "55vmax", dx: "40px", duration: 24 },
        ]}
      />

      <div className="relative z-10">
        <SectionHeading eyebrow={letter.eyebrow} title={letter.title} />

        <motion.div
          ref={cardRef}
          className="relative mx-auto mt-12 max-w-2xl sm:mt-16"
          initial={{ opacity: 0, y: reduced ? 0 : 40, rotate: reduced ? 0 : -1.5 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: reduced ? 0.01 : 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* a flower resting on the letter */}
          <div className="absolute -top-14 -right-3 z-10 w-24 rotate-12 sm:-top-16 sm:-right-10 sm:w-32">
            <Bloom id="letter-bloom" open={inView} palette="rose" size="100%" delay={0.4} className="glow-bloom" />
          </div>

          <article className="paper relative rounded-[6px] px-6 pt-12 pb-12 sm:px-14 sm:pt-16 sm:pb-16">
            <CornerSprig className="absolute top-2 left-2 w-16 opacity-80 sm:w-24" />
            <CornerSprig className="absolute right-2 bottom-2 w-16 opacity-80 sm:w-24" flip />
            {/* hairline inner border */}
            <div aria-hidden className="pointer-events-none absolute inset-3 rounded-[4px] border border-rose/15 sm:inset-5" />

            <p className="eyebrow relative text-right text-ink-soft/80">{birthday.dateLabel}</p>

            <div className="relative mt-6">
              <TypedGreeting text={letter.greeting} start={inView} onDone={finishTyping} />
            </div>

            <div className="relative mt-6 space-y-5 font-serif text-[1.3rem] leading-[1.75] text-ink sm:text-[1.4rem]">
              {letter.paragraphs.map((p, i) => (
                <motion.p
                  key={i}
                  className="text-pretty"
                  initial={{ opacity: 0, y: reduced ? 0 : 8 }}
                  animate={showBody ? { opacity: 1, y: 0 } : undefined}
                  transition={{ duration: reduced ? 0.01 : 1.1, delay: reduced ? 0 : i * 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  {p}
                </motion.p>
              ))}
            </div>

            <motion.div
              className="relative mt-10 text-right"
              initial={{ opacity: 0 }}
              animate={showBody ? { opacity: 1 } : undefined}
              transition={{ duration: reduced ? 0.01 : 1.2, delay: reduced ? 0 : letter.paragraphs.length * 0.35 + 0.3 }}
            >
              <p className="font-serif text-xl text-ink-soft italic">{letter.closing}</p>
              <p className="mt-1 font-hand text-[2.4rem] leading-none text-rose-deep">{from}</p>
            </motion.div>
          </article>
        </motion.div>
      </div>
    </section>
  );
}
