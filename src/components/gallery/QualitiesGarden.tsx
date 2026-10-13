"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Bloom } from "@/components/flowers/Bloom";
import { Sparkle } from "@/components/story/LetterDecor";
import type { Lang } from "@/content/letter";
import { qualities, qualitiesCopy, type Quality } from "@/content/qualities";

/**
 * "Little Things We Love About You": six flowers, each holding a note about
 * one of Erika's qualities. Tap any of them, in any order — there's nothing
 * to complete. The note opens as a small letter that can be closed with ×,
 * Escape or a tap outside, or stepped through with the arrows.
 */

// gentle up/down offsets so the arrangement isn't a rigid grid
const OFFSET = ["sm:mt-6", "sm:mt-0", "sm:mt-10", "sm:mt-2", "sm:mt-12", "sm:mt-4"];

function Flower({ q, open, selected, idPrefix = "quality" }: { q: Quality; open: boolean; selected: boolean; idPrefix?: string }) {
  const base = `calc(${q.scale} * clamp(5.6rem, 12vw, 8.6rem))`;
  if (q.look.kind === "cluster") {
    const parts = [
      { id: "a", species: "anemone", palette: "cream", tilt: -22, stem: 150, x: "-38%", s: 0.62 },
      { id: "b", species: "anemone", palette: "peach", tilt: 4, stem: 210, x: "0%", s: 0.7 },
      { id: "c", species: "peony", palette: "blush", tilt: 24, stem: 120, x: "38%", s: 0.58 },
    ] as const;
    return (
      <div className="relative flex h-full w-full items-end justify-center">
        {parts.map((p, i) => (
          <div key={p.id} className="absolute bottom-0" style={{ transform: `translateX(${p.x})` }}>
            <div
              className="sway"
              style={{ "--sway": "2.4deg", "--sway-duration": `${6 + i * 1.3}s`, "--sway-delay": `${-i * 1.7}s` } as CSSProperties}
            >
              <Bloom
                id={`${idPrefix}-${q.key}-${p.id}`}
                open={open}
                species={p.species}
                palette={p.palette}
                size={`calc(${base} * ${p.s})`}
                stem={p.stem}
                tilt={p.tilt}
                squash={0.72}
                maxOpen={selected ? 1 : 0.8}
                delay={0.2 + i * 0.25}
                duration={2.2}
                glow={false}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }
  const l = q.look;
  return (
    <div className="relative flex h-full w-full items-end justify-center">
      {l.light && (
        <span
          aria-hidden
          className="absolute top-[6%] right-[8%] block h-20 w-20 rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(255,226,176,0.45), rgba(255,214,190,0.12) 55%, transparent)" }}
        />
      )}
      {l.sparkles && (
        <>
          <Sparkle className="absolute top-[14%] left-[18%] w-3" delay={0} />
          <Sparkle className="absolute top-[26%] right-[16%] w-2.5" delay={1.2} />
          <Sparkle className="absolute top-[48%] left-[10%] w-2" delay={2.1} />
        </>
      )}
      <div className="sway" style={{ "--sway": "1.8deg", "--sway-duration": `${6.5 + q.scale * 2}s` } as CSSProperties}>
        <Bloom
          id={`${idPrefix}-${q.key}`}
          open={open}
          species={l.species}
          palette={l.palette}
          size={base}
          stem={170}
          tilt={l.tilt ?? 0}
          squash={0.74}
          maxOpen={selected ? 1 : (l.open ?? 0.75)}
          delay={0.2}
          duration={2.4}
        />
      </div>
    </div>
  );
}

export function QualitiesGarden() {
  const [lang, setLang] = useState<Lang>("en");
  const [active, setActive] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastOpened = useRef<number | null>(null);
  const titleId = useId();
  const copy = qualitiesCopy[lang];
  // the portal target only exists in the browser (false while server rendering)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const q = active === null ? null : qualities[active];

  const open = (i: number) => {
    lastOpened.current = i;
    setActive(i);
  };
  const close = () => {
    setActive(null);
    // give focus back to the flower that was opened
    const i = lastOpened.current;
    if (i !== null) window.setTimeout(() => buttons.current[i]?.focus(), 0);
  };
  const step = (d: number) => setActive((a) => (a === null ? a : (a + d + qualities.length) % qualities.length));

  useEffect(() => {
    if (active === null) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active === null]);

  useEffect(() => {
    if (active !== null) lastOpened.current = active;
  }, [active]);

  return (
    <div ref={ref} lang={lang} className="relative mx-auto max-w-4xl">
      <div className="flex justify-center">
        <div role="group" aria-label={copy.language} className="glass flex items-center rounded-full p-1 text-sm">
          {(["en", "id"] as const).map((l) => (
            <button
              key={l}
              type="button"
              lang={l}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              aria-label={l === "en" ? "English" : "Bahasa Indonesia"}
              className={`min-h-9 min-w-11 rounded-full px-3 font-medium tracking-wider transition-colors duration-200 ${
                lang === l ? "bg-white text-night" : "text-white/65 hover:text-white"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <h3 className="mt-7 text-center font-serif text-[clamp(1.9rem,4.6vw,2.8rem)] leading-tight text-white italic text-balance">
        {copy.heading}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-center text-white/55">{copy.intro}</p>

      {/* the garden */}
      <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-10">
        {qualities.map((item, i) => {
          const t = item.text[lang];
          const selected = active === i;
          return (
            <li key={item.key} className={OFFSET[i % OFFSET.length]}>
              <button
                ref={(el) => {
                  buttons.current[i] = el;
                }}
                type="button"
                onClick={() => open(i)}
                aria-haspopup="dialog"
                aria-label={`${t.title} — ${t.flower}`}
                className="group relative flex w-full flex-col items-center rounded-3xl px-2 pt-2 pb-3 transition-colors duration-300 hover:bg-white/[0.03] focus-visible:bg-white/[0.04]"
              >
                {/* a soft glow that warms on hover and when opened */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute inset-x-[10%] top-[18%] h-[55%] rounded-full transition-opacity duration-700 ${
                    selected ? "opacity-100" : "opacity-40 group-hover:opacity-80"
                  }`}
                  style={{ background: "radial-gradient(closest-side, rgba(244,182,198,0.28), transparent)" }}
                />
                <span aria-hidden className="relative block h-[12.5rem] w-full sm:h-[15rem]">
                  <Flower q={item} open={inView} selected={selected} />
                </span>
                <span className="relative mt-3 font-serif text-[1.15rem] leading-tight text-white/90 italic sm:text-[1.3rem]">
                  {t.title}
                </span>
                <span className="relative mt-1 text-[0.72rem] tracking-[0.2em] text-petal/55 uppercase transition-colors group-hover:text-petal/80">
                  {copy.hint}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* the closing flower */}
      <div className="mt-14 flex flex-col items-center text-center">
        <div className="sway" style={{ "--sway": "1.4deg", "--sway-duration": "9s" } as CSSProperties}>
          <Bloom
            id="quality-closing"
            open={inView}
            species="peony"
            palette="rose"
            size="clamp(5.2rem, 12vw, 7.4rem)"
            stem={120}
            squash={0.72}
            delay={0.6}
            duration={3}
          />
        </div>
        <p className="mt-5 max-w-xl font-serif text-[clamp(1.4rem,3.4vw,1.9rem)] leading-snug text-white italic text-balance">
          {copy.closingLine}
        </p>
        <p className="mt-3 max-w-lg text-[1.02rem] leading-relaxed text-petal/80 text-pretty">{copy.closingSub}</p>
      </div>

      {/* the note, as a small letter — rendered at the top of the page so it
          sits above the navigation, not inside the gallery's layer */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {q && active !== null && (
              <motion.div
                key="note"
                className="fixed inset-0 z-[80] grid place-items-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0.01 : 0.35 }}
              >
                <button
                  type="button"
                  aria-label={copy.close}
                  tabIndex={-1}
                  onClick={close}
                  className="absolute inset-0 cursor-default bg-night/65 backdrop-blur-[3px]"
                />
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={titleId}
                  lang={lang}
                  initial={{ y: reduced ? 0 : 18, scale: reduced ? 1 : 0.97 }}
                  animate={{ y: 0, scale: 1 }}
                  exit={{ y: reduced ? 0 : 10, scale: reduced ? 1 : 0.98 }}
                  transition={{ duration: reduced ? 0.01 : 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="paper relative w-full max-w-md rounded-[14px] px-7 pt-8 pb-6 text-center sm:px-10"
                >
                  <div aria-hidden className="pointer-events-none absolute inset-[8px] rounded-[9px] border border-[#c98a9b]/40" />
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={close}
                    aria-label={copy.close}
                    className="absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-full text-ink-soft transition hover:bg-[#c98a9b]/15 hover:text-rose-deep"
                  >
                    <X className="h-5 w-5" aria-hidden />
                  </button>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`${q.key}-${lang}`}
                      initial={{ opacity: 0, y: reduced ? 0 : 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: reduced ? 0 : -4 }}
                      transition={{ duration: reduced ? 0.01 : 0.3 }}
                    >
                      <div aria-hidden className="mx-auto h-24 w-24">
                        <Flower q={q} open selected idPrefix="note" />
                      </div>
                      <p className="eyebrow mt-3 text-ink-soft/70">{q.text[lang].flower}</p>
                      <h4 id={titleId} className="mt-2 font-serif text-[2rem] leading-tight text-rose-deep italic">
                        {q.text[lang].title}
                      </h4>
                      <p className="mt-4 font-serif text-[1.12rem] leading-[1.7] text-[#4a2f36] text-pretty">{q.text[lang].message}</p>
                    </motion.div>
                  </AnimatePresence>
                  <div className="mt-6 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      aria-label={copy.prev}
                      className="grid h-10 w-10 place-items-center rounded-full text-ink-soft transition hover:bg-[#c98a9b]/15 hover:text-rose-deep"
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label={copy.next}
                      className="grid h-10 w-10 place-items-center rounded-full text-ink-soft transition hover:bg-[#c98a9b]/15 hover:text-rose-deep"
                    >
                      <ChevronRight className="h-5 w-5" aria-hidden />
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
