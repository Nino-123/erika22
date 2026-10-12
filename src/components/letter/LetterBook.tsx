"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { ArrowLeft, ArrowRight, BookOpen, Flower2 } from "lucide-react";
import { site } from "@/content/site";
import { letterBook, ROMAN, type Lang, type LetterContent } from "@/content/letter";
import { Bloom } from "@/components/flowers/Bloom";
import { burstPetals } from "@/components/flowers/PetalCanvas";
import { BotanicalStudy, CornerSprig } from "./Botanical";
import { PressedFlowers } from "./PressedFlowers";

/*
 * How the book works
 * ──────────────────
 * The book is a stack of sheets. Sheet 0 is the cover; sheet n (1–5) carries
 * letter page n on its front. Every sheet's back is an illustrated page.
 *
 * `current` = how many sheets have been turned. The right-hand page shows the
 * front of sheet `current`; the left-hand page shows the back of sheet
 * `current - 1`. A turning sheet rotates around the spine (its left edge) from
 * 0° to -180°, showing its back as it goes, and lands as the new left page —
 * so a turned page never disappears. On phones the book shows one page with
 * the spine along its left edge.
 *
 * The book has a fixed size (from the viewport, never from the text); long
 * pages shrink their type slightly to fit, so nothing shifts between pages or
 * languages.
 */

const TURN_SECONDS = 1.05;
const TURN_EASE = [0.42, 0.04, 0.26, 1] as const;

type Turn = { from: number; to: number; dir: 1 | -1 };
type Dims = { pw: number; ph: number; single: boolean };

/** Shrinks a page's body text until it fits the fixed page. */
function useFitText(rootRef: React.RefObject<HTMLDivElement | null>, deps: unknown[]) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    const body = root?.querySelector<HTMLElement>("[data-fit]");
    if (!root || !body) return;
    let scale = 1;
    root.style.setProperty("--fit", "1");
    while (scale > 0.62 && body.scrollHeight > body.clientHeight + 1) {
      scale -= 0.03;
      root.style.setProperty("--fit", scale.toFixed(2));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ── page faces ──────────────────────────────────────────────────────────────

/** The fold: shading near the spine on the inner edge of a page. */
function SpineShade({ side }: { side: "left" | "right" }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 w-[14%]"
      style={{
        [side === "right" ? "left" : "right"]: 0,
        background:
          side === "right"
            ? "linear-gradient(to right, rgba(90,45,55,0.28), rgba(90,45,55,0.08) 35%, transparent)"
            : "linear-gradient(to left, rgba(90,45,55,0.3), rgba(90,45,55,0.08) 35%, transparent)",
      }}
    />
  );
}

function Cover({ t, onOpen, interactive }: { t: LetterContent; onOpen: () => void; interactive: boolean }) {
  return (
    <div className="@container relative h-full overflow-hidden rounded-r-[6px] rounded-l-[2px] bg-[#f6eee2]">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[image:var(--grain-dark)] opacity-[0.09]" />
      <SpineShade side="right" />
      <div aria-hidden className="pointer-events-none absolute inset-[4%] rounded-[4px] border border-[#b08a5a]/35" />
      <div className="relative flex h-full flex-col items-center justify-center px-[10cqw] text-center">
        <p className="eyebrow text-[#a3805a]/80" style={{ fontSize: "2.4cqw" }}>
          Nº {site.birthday.dayNumber} · 22
        </p>
        <h3 className="mt-[4cqw] font-serif leading-[1.1] tracking-[0.06em] text-[#a8844f] uppercase" style={{ fontSize: "8.4cqw" }}>
          {t.cover.title}
        </h3>
        <p className="mt-[3cqw] font-serif text-ink-soft italic" style={{ fontSize: "4.4cqw" }}>
          {t.cover.subtitle}
        </p>
        <PressedFlowers className="my-[7cqw] w-[78%]" />
        <button
          type="button"
          onClick={onOpen}
          tabIndex={interactive ? 0 : -1}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-rose-deep px-6 font-medium text-ivory shadow-[0_12px_30px_-12px_rgba(169,70,106,0.8)] transition-transform duration-150 hover:bg-[#933a5c] active:scale-[0.97]"
          style={{ fontSize: "max(0.9rem, 3.6cqw)" }}
        >
          <BookOpen className="h-4 w-4" aria-hidden />
          {t.cover.open}
        </button>
      </div>
    </div>
  );
}

/** Inside the cover: a blush endpaper with a small dedication. */
function Dedication({ t }: { t: LetterContent }) {
  return (
    <div className="@container relative h-full overflow-hidden rounded-l-[6px] rounded-r-[2px] bg-[#f3dbe0] bg-[radial-gradient(circle,rgba(201,111,138,0.22)_1.4px,transparent_2px)] bg-[length:22px_22px]">
      <SpineShade side="left" />
      <div className="relative flex h-full items-center justify-center p-[10cqw]">
        <div className="leaf-paper relative flex w-full flex-col items-center rounded-[50%/40%] px-[8cqw] py-[12cqw] text-center shadow-[0_10px_30px_-18px_rgba(90,40,50,0.5)]">
          <PressedFlowers className="w-[70%]" />
          <p className="mt-[3cqw] font-hand leading-none text-rose-deep" style={{ fontSize: "9cqw" }}>
            {t.dedication.to}
          </p>
          <p className="mt-[3cqw] font-serif text-ink-soft italic" style={{ fontSize: "4.2cqw" }}>
            {t.dedication.note}
          </p>
          <p className="eyebrow mt-[4cqw] text-rose/70" style={{ fontSize: "2.4cqw" }}>
            {t.dedication.date}
          </p>
        </div>
      </div>
    </div>
  );
}

/** The back of a letter page: a botanical study and a line from the page just read. */
function Verso({ t, index }: { t: LetterContent; index: number }) {
  return (
    <div className="leaf-paper @container relative h-full overflow-hidden rounded-l-[6px] rounded-r-[2px]">
      <SpineShade side="left" />
      <div aria-hidden className="pointer-events-none absolute inset-[4%] rounded-[3px] border border-rose/12" />
      <div className="relative flex h-full flex-col items-center justify-center px-[13cqw] text-center">
        <p className="eyebrow text-rose/60" style={{ fontSize: "2.3cqw" }}>
          — {ROMAN[index]} —
        </p>
        <BotanicalStudy variant={index} className="mt-[4cqw] w-[56%]" />
        <p className="mt-[5cqw] font-serif leading-snug text-rose-deep/90 italic text-balance" style={{ fontSize: "5.2cqw" }}>
          “{t.pages[index].quote}”
        </p>
      </div>
    </div>
  );
}

function ReadingPage({
  t,
  index,
  total,
  revealed,
  lang,
  pw,
  uid,
}: {
  t: LetterContent;
  index: number;
  total: number;
  revealed: boolean;
  lang: Lang;
  pw: number;
  uid: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const page = t.pages[index];
  const last = index === total - 1;
  const reduced = useReducedMotion();
  const signature = site.from.startsWith("[") ? null : site.from;
  useFitText(ref, [lang, pw, index]);
  const body: CSSProperties = { fontSize: "calc(var(--fit, 1) * var(--base, 3.4) * 1cqw)" };

  return (
    <div ref={ref} className="leaf-paper @container relative h-full overflow-hidden rounded-r-[6px] rounded-l-[2px]">
      <SpineShade side="right" />
      <div aria-hidden className="pointer-events-none absolute inset-[4%] rounded-[3px] border border-rose/12" />
      {/* corners vary from page to page so they never feel stamped */}
      <CornerSprig variant={index} className="absolute top-[1.5%] right-[1.5%] w-[13%] -scale-x-100 opacity-75" />
      {index % 2 === 0 && <CornerSprig variant={index + 1} className="absolute bottom-[1.5%] left-[6%] w-[11%] rotate-90 opacity-60" />}

      <div className="relative flex h-full flex-col pt-[9cqw] pr-[9cqw] pb-[5cqw] pl-[11cqw]">
        <header className="text-center">
          <p className="eyebrow text-rose/70" style={{ fontSize: "calc(var(--base, 3.4) * 0.66cqw)" }}>
            {t.pageLabel} {ROMAN[index]}
          </p>
          <h3
            className="mt-[1.5cqw] font-serif leading-[1.08] text-rose-deep italic text-balance"
            style={{ fontSize: "calc(var(--base, 3.4) * 1.95cqw)" }}
          >
            {page.title}
          </h3>
          <svg viewBox="0 0 120 16" className="mx-auto mt-[2cqw] w-[22%]" aria-hidden>
            <path d="M4 8 C 30 2, 44 14, 60 8 S 92 2, 116 8" stroke="#c99aa6" strokeWidth="1" fill="none" strokeLinecap="round" />
            <path d="M38 7 C 40 2, 46 1, 48 3 C 46 7, 42 8, 38 7 Z M78 9 C 80 14, 86 15, 88 13 C 86 9, 82 8, 78 9 Z" fill="#a9bb9c" />
            <circle cx="60" cy="8" r="2.6" fill="#f2a7bb" />
          </svg>
        </header>

        <div data-fit className="mt-[4cqw] min-h-0 flex-1 overflow-hidden font-serif leading-[1.62] text-ink" style={body}>
          <div className="space-y-[0.65em]">
            {page.paragraphs.map((p, i) => {
              // a short first line reads as a greeting; the drop cap goes on the first full paragraph
              const greeting = i === 0 && p.length < 60;
              const dropCap = i === (page.paragraphs[0].length < 60 ? 1 : 0);
              return (
                <p
                  key={i}
                  className={
                    greeting
                      ? "text-[1.22em] leading-snug text-rose-deep italic"
                      : dropCap
                        ? "first-letter:float-left first-letter:mt-[0.08em] first-letter:mr-[0.12em] first-letter:font-serif first-letter:text-[3.1em] first-letter:leading-[0.78] first-letter:text-rose"
                        : undefined
                  }
                >
                  {p}
                </p>
              );
            })}
          </div>

          {last && (
            <motion.div
              className="mt-[1.1em] flex flex-col items-center text-center"
              initial={false}
              animate={revealed ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: reduced ? 0 : 8, filter: reduced ? "none" : "blur(5px)" }}
              transition={{ duration: reduced ? 0.01 : 1.4, delay: revealed && !reduced ? 0.4 : 0, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-[3.2em]" aria-hidden>
                <Bloom id={`letter-end-${uid}`} open={revealed} species="rose" palette="blush" size="100%" squash={0.82} delay={0.6} duration={2.4} />
              </div>
              <p className="mt-[0.2em] text-[1.25em] text-rose-deep italic">{t.closing}</p>
              {signature && <p className="font-hand text-[1.8em] leading-none text-rose-deep">{signature}</p>}
            </motion.div>
          )}
        </div>

        <p className="mt-[3cqw] text-center font-serif text-ink-soft/65 italic" style={{ fontSize: "2.6cqw" }} aria-hidden>
          — {index + 1} —
        </p>
      </div>
    </div>
  );
}

// ── turning sheet ───────────────────────────────────────────────────────────

function TurningSheet({
  angle,
  left,
  width,
  height,
  front,
  back,
}: {
  angle: MotionValue<number>;
  left: number;
  width: number;
  height: number;
  front: ReactNode;
  back: ReactNode;
}) {
  // the sheet darkens as it bends away from the light, most at 90°
  const bend = useTransform(angle, (a) => Math.sin((Math.abs(a) / 180) * Math.PI) * 0.34);
  return (
    <motion.div
      aria-hidden
      className="absolute top-0"
      style={{ left, width, height, transformOrigin: "left center", transformStyle: "preserve-3d", rotateY: angle, zIndex: 30 }}
    >
      <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
        {front}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-r-[6px] bg-gradient-to-l from-[#3a1422]/70 via-[#3a1422]/20 to-transparent"
          style={{ opacity: bend }}
        />
      </div>
      <div
        className="absolute inset-0"
        style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
      >
        {back}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-l-[6px] bg-gradient-to-r from-[#3a1422]/60 via-[#3a1422]/15 to-transparent"
          style={{ opacity: bend }}
        />
      </div>
    </motion.div>
  );
}

/** Shadow the turning sheet casts across the page beneath it. */
function CastShadow({ angle, side }: { angle: MotionValue<number>; side: "left" | "right" }) {
  const opacity = useTransform(angle, (a) => {
    const deg = Math.abs(a);
    return side === "right" ? (deg < 90 ? 0.45 * (1 - deg / 90) : 0) : deg > 90 ? 0.45 * ((deg - 90) / 90) : 0;
  });
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20"
      style={{
        opacity,
        background:
          side === "right"
            ? "linear-gradient(to right, rgba(40,10,20,0.75), rgba(40,10,20,0.15) 45%, transparent 80%)"
            : "linear-gradient(to left, rgba(40,10,20,0.75), rgba(40,10,20,0.15) 45%, transparent 80%)",
      }}
    />
  );
}

// ── the book ────────────────────────────────────────────────────────────────

export function LetterBook() {
  const [lang, setLang] = useState<Lang>("en");
  const [current, setCurrent] = useState(0); // sheets turned; 0 = closed
  const [turn, setTurn] = useState<Turn | null>(null);
  const [fading, setFading] = useState(false);
  const [dims, setDims] = useState<Dims>({ pw: 440, ph: 630, single: false });
  const angle = useMotionValue(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const burstDone = useRef(false);
  const active = useRef<{ stop: () => void; finish: () => void; until: number } | null>(null);
  const reduced = useReducedMotion();

  const t = letterBook[lang];
  const pageCount = t.pages.length;
  const MAX = pageCount; // sheets 0…pageCount; `current` runs 0…pageCount

  // size the book from the space available — never from its content
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const avail = el.clientWidth;
      const vh = window.innerHeight;
      const single = avail < 720;
      let pw: number;
      let ph: number;
      if (single) {
        pw = Math.min(avail, 440);
        ph = pw / 0.6;
        if (ph > vh * 0.74) {
          ph = vh * 0.74;
          pw = ph * 0.6;
        }
      } else {
        pw = Math.min((avail - 24) / 2, 470);
        ph = pw / 0.7;
        if (ph > vh * 0.78) {
          ph = vh * 0.78;
          pw = ph * 0.7;
        }
      }
      const next = { pw: Math.round(pw), ph: Math.round(ph), single };
      setDims((prev) => (prev.pw === next.pw && prev.ph === next.ph && prev.single === next.single ? prev : next));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const go = useCallback(
    (to: number) => {
      if (active.current) {
        if (performance.now() < active.current.until) return; // ignore rapid repeat clicks
        active.current.stop(); // a turn that never finished (tab hidden mid-turn) is settled first
        active.current.finish();
      }
      if (to < 1 || to > MAX || to === current) return; // once opened, the cover stays open

      // jumping several pages (e.g. "read from the beginning"): a soft fade, not a flurry of turns
      if (reduced || Math.abs(to - current) > 1) {
        if (reduced) {
          setCurrent(to);
          return;
        }
        setFading(true);
        const timer = window.setTimeout(() => {
          setCurrent(to);
          setFading(false);
          active.current = null;
        }, 320);
        active.current = {
          stop: () => window.clearTimeout(timer),
          finish: () => {
            setCurrent(to);
            setFading(false);
            active.current = null;
          },
          until: performance.now() + 400,
        };
        return;
      }

      const dir: 1 | -1 = to > current ? 1 : -1;
      const finish = () => {
        setCurrent(to);
        setTurn(null);
        angle.set(0);
        active.current = null;
      };
      angle.set(dir === 1 ? 0 : -180);
      setTurn({ from: current, to, dir });
      const controls = animate(angle, dir === 1 ? -180 : 0, { duration: TURN_SECONDS, ease: TURN_EASE, onComplete: finish });
      active.current = { stop: () => controls.stop(), finish, until: performance.now() + (TURN_SECONDS + 0.5) * 1000 };
    },
    [MAX, angle, current, reduced],
  );

  const next = useCallback(() => go(current + 1), [go, current]);
  const prev = useCallback(() => go(current - 1), [go, current]);

  // ← → turn pages while the book is in the middle of the screen (never while typing a wish)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target instanceof Element ? e.target : null;
      if (e.altKey || e.ctrlKey || e.metaKey || el?.closest("input, textarea, select, [contenteditable='true']")) return;
      const r = bookRef.current?.getBoundingClientRect();
      if (!r || r.top > window.innerHeight * 0.6 || r.bottom < window.innerHeight * 0.4) return;
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const revealed = current === MAX && !turn;

  useEffect(() => {
    if (!revealed || reduced || burstDone.current) return;
    burstDone.current = true;
    const timer = window.setTimeout(() => {
      const r = bookRef.current?.getBoundingClientRect();
      if (r) burstPetals(r.left + r.width * (dims.single ? 0.5 : 0.75), r.top + r.height * 0.7);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [revealed, reduced, dims.single]);

  // which sheet shows where
  const turning = turn ? (turn.dir === 1 ? turn.from : turn.to) : null;
  const rightSheet = turn ? (turn.dir === 1 ? turn.to : turn.from) : current;
  const leftSheet = turn ? (turn.dir === 1 ? turn.from - 1 : turn.to - 1) : current - 1;
  const { pw, ph, single } = dims;
  const closedLook = current === 0 && !(turn && turn.to === 1);
  const bookWidth = single ? pw : pw * 2;
  const rightLeft = single ? 0 : pw;

  const front = (i: number, interactive: boolean, uid: string) =>
    i === 0 ? (
      <Cover t={t} onOpen={() => go(1)} interactive={interactive} />
    ) : (
      <ReadingPage t={t} index={i - 1} total={pageCount} revealed={revealed && i === MAX && interactive} lang={lang} pw={pw} uid={uid} />
    );
  const back = (i: number) => (i === 0 ? <Dedication t={t} /> : <Verso t={t} index={i - 1} />);

  const underRight = MAX - rightSheet; // sheets still to read, stacked under the right page
  const underLeft = Math.max(0, leftSheet); // sheets already turned, under the left page
  const indicator = current === 0 ? null : `${String(current).padStart(2, "0")} / ${String(pageCount).padStart(2, "0")}`;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
      {/* language toggle */}
      <div className="mb-6 flex items-center justify-center">
        <div role="group" aria-label={t.ui.language} className="glass flex items-center rounded-full p-1 text-sm">
          {(["en", "id"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              aria-label={letterBook[l].langName}
              className={`min-h-9 min-w-11 rounded-full px-3 font-medium tracking-wider transition-colors duration-200 ${
                lang === l ? "bg-white text-night" : "text-white/65 hover:text-white"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* the stage: a fixed-size area the book always sits centred in */}
      <div ref={wrapRef} className="flex w-full justify-center" style={{ height: ph + 24 }}>
        <div
          ref={bookRef}
          lang={lang}
          className="relative [perspective:2600px]"
          style={
            {
              width: bookWidth,
              height: ph,
              "--base": single ? 4.5 : 3.45,
              transform: !single && closedLook ? `translateX(${-pw / 2}px)` : "translateX(0px)",
              transition: reduced ? undefined : `transform ${TURN_SECONDS}s cubic-bezier(0.42,0.04,0.26,1), opacity 0.3s ease`,
              opacity: fading ? 0 : 1,
              touchAction: "pan-y",
            } as CSSProperties
          }
          onPointerDown={(e) => {
            if (e.pointerType === "touch") touch.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={(e) => {
            const start = touch.current;
            touch.current = null;
            if (!start || e.pointerType !== "touch") return;
            const dx = e.clientX - start.x;
            const dy = e.clientY - start.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) (dx < 0 ? next : prev)();
          }}
        >
          {/* soft shadow the book rests on */}
          <div aria-hidden className="pointer-events-none absolute inset-x-[3%] -bottom-5 h-12 rounded-[50%] bg-black/70 blur-2xl" />

          {/* hardcover boards peeking around the pages */}
          <div
            aria-hidden
            className="absolute top-[-1.4%] bottom-[-1.4%] rounded-r-[10px] bg-[#7e4658] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]"
            style={{ left: rightLeft - 2, width: pw + 10 }}
          />
          {!single && (
            <div
              aria-hidden
              className="absolute top-[-1.4%] bottom-[-1.4%] rounded-l-[10px] bg-[#7e4658] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] transition-opacity duration-500"
              style={{ left: -8, width: pw + 10, opacity: closedLook ? 0 : 1 }}
            />
          )}

          {/* page edges: a thin stack under each side */}
          {underRight > 0 && (
            <div
              aria-hidden
              className="absolute top-[0.8%] bottom-[0.8%] rounded-r-[5px] bg-[repeating-linear-gradient(to_right,#efe5d6_0,#efe5d6_1px,#d9ccb8_1px,#d9ccb8_2px)]"
              style={{ left: rightLeft + 4, width: pw - 4 + Math.min(6, underRight * 1.4) }}
            />
          )}
          {!single && underLeft > 0 && (
            <div
              aria-hidden
              className="absolute top-[0.8%] bottom-[0.8%] rounded-l-[5px] bg-[repeating-linear-gradient(to_left,#efe5d6_0,#efe5d6_1px,#d9ccb8_1px,#d9ccb8_2px)]"
              style={{ left: -Math.min(6, underLeft * 1.4), width: pw - 4 + Math.min(6, underLeft * 1.4) }}
            />
          )}

          {/* left page: the back of the last turned sheet */}
          {!single && leftSheet >= 0 && (
            <div className="absolute top-0 left-0 z-10" style={{ width: pw, height: ph }} aria-hidden>
              {back(leftSheet)}
              {turn && <CastShadow angle={angle} side="left" />}
            </div>
          )}

          {/* right page: the sheet she's reading */}
          <div className="absolute top-0 z-10" style={{ left: rightLeft, width: pw, height: ph }} aria-live="polite">
            {front(rightSheet, !turn, "live")}
            {turn && <CastShadow angle={angle} side="right" />}
          </div>

          {/* the turning sheet, above everything, front and back */}
          {turning !== null && (
            <TurningSheet angle={angle} left={rightLeft} width={pw} height={ph} front={front(turning, false, "turning")} back={back(turning)} />
          )}

          {/* the spine's centre crease */}
          {!single && !closedLook && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 z-[25] w-3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#5a2a36]/30 to-transparent"
              style={{ left: pw }}
            />
          )}

          {/* tap the page edges to turn */}
          {current > 1 && (
            <button
              type="button"
              onClick={prev}
              aria-label={t.ui.prev}
              tabIndex={-1}
              className="absolute inset-y-0 left-0 z-[35] cursor-w-resize rounded-l-[6px] transition-colors hover:bg-rose/[0.04]"
              style={{ width: single ? pw * 0.12 : pw * 0.35 }}
            />
          )}
          {current > 0 && current < MAX && (
            <button
              type="button"
              onClick={next}
              aria-label={t.ui.next}
              tabIndex={-1}
              className="group absolute inset-y-0 right-0 z-[35] cursor-e-resize"
              style={{ width: pw * 0.12 }}
            >
              {/* a little curled corner */}
              <span className="absolute right-0 bottom-0 h-9 w-9 rounded-tl-[14px] bg-gradient-to-tl from-[#e9dccb] via-[#f6eee3] to-transparent opacity-70 shadow-[-3px_-3px_8px_-4px_rgba(80,40,30,0.4)] transition-all duration-300 group-hover:h-12 group-hover:w-12 group-hover:opacity-100" />
            </button>
          )}
        </div>
      </div>

      {/* controls */}
      <div
        className={`mt-6 flex items-center justify-between transition-opacity duration-500 ${current === 0 ? "pointer-events-none opacity-0" : "opacity-100"}`}
        style={{ width: Math.max(bookWidth, 280) }}
      >
        <button
          type="button"
          onClick={prev}
          disabled={current <= 1}
          aria-label={t.ui.prev}
          className="glass grid h-12 w-12 place-items-center rounded-full text-white transition hover:bg-white/10 disabled:opacity-30"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </button>
        <div className="text-center">
          <p className="font-serif text-xl text-white tabular-nums italic" aria-live="polite">
            {indicator}
          </p>
          <p className="mt-1 hidden text-xs text-white/40 sm:block">{t.ui.hint}</p>
        </div>
        <button
          type="button"
          onClick={next}
          disabled={current >= MAX}
          aria-label={t.ui.next}
          className="glass grid h-12 w-12 place-items-center rounded-full text-white transition hover:bg-white/10 disabled:opacity-30"
        >
          <ArrowRight className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {/* the ending: back to the garden, or read it again */}
      <motion.div
        className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:gap-5"
        initial={false}
        animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: reduced ? 0 : 8 }}
        transition={{ duration: reduced ? 0.01 : 0.9, delay: revealed && !reduced ? 1.6 : 0, ease: [0.16, 1, 0.3, 1] }}
        style={{ pointerEvents: revealed ? "auto" : "none" }}
        aria-hidden={!revealed}
      >
        <a href="#garden" tabIndex={revealed ? 0 : -1} className="btn-light">
          <Flower2 className="h-4 w-4" aria-hidden /> {t.ui.returnToGarden}
        </a>
        <button
          type="button"
          tabIndex={revealed ? 0 : -1}
          onClick={() => go(1)}
          className="min-h-11 px-3 text-sm text-white/60 underline decoration-petal/40 underline-offset-4 hover:text-white"
        >
          {t.ui.readAgain}
        </button>
      </motion.div>
    </div>
  );
}
