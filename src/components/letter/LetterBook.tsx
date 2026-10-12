"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ArrowLeft, ArrowRight, BookOpen, Flower2 } from "lucide-react";
import { site } from "@/content/site";
import { letterBook, ROMAN, type Lang, type LetterContent } from "@/content/letter";
import { Bloom } from "@/components/flowers/Bloom";
import { burstPetals } from "@/components/flowers/PetalCanvas";
import { PressedFlowers } from "./PressedFlowers";

const TURN_SECONDS = 0.95;
const TURN_EASE = [0.45, 0.05, 0.3, 1] as const;

type Role = "hidden" | "static" | "flip";

/** Small floral sprigs tucked into the page corners. */
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
    </svg>
  );
}

/** A restrained ornament between a page title and its text. */
function Ornament() {
  return (
    <svg viewBox="0 0 120 16" className="mx-auto mt-3 w-24" aria-hidden>
      <path d="M4 8 C 30 2, 44 14, 60 8 S 92 2, 116 8" stroke="#c99aa6" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M38 7 C 40 2, 46 1, 48 3 C 46 7, 42 8, 38 7 Z M78 9 C 80 14, 86 15, 88 13 C 86 9, 82 8, 78 9 Z" fill="#a9bb9c" />
      <circle cx="60" cy="8" r="2.6" fill="#f2a7bb" />
    </svg>
  );
}

/** One leaf of the book: a front face (the page) and a back face (the paper's reverse). */
function Leaf({
  role,
  angle,
  children,
  back = "paper",
  sizer = false,
  turning = false,
}: {
  role: Role;
  turning?: boolean;
  angle: MotionValue<number>;
  children: ReactNode;
  back?: "paper" | "endpaper";
  sizer?: boolean;
}) {
  // the turning page darkens as it bends away from the light…
  const bend = useTransform(angle, (a) => Math.sin((Math.abs(a) / 180) * Math.PI) * 0.32);
  // …and casts a shadow on the page beneath, deepest near the spine
  const cast = useTransform(angle, (a) => 0.38 * (1 - Math.abs(a) / 180));
  const style: CSSProperties = {
    gridArea: "1 / 1",
    transformOrigin: "left center",
    transformStyle: "preserve-3d",
    zIndex: role === "flip" ? 3 : role === "static" ? 1 : 0,
    visibility: role === "hidden" ? "hidden" : "visible",
  };

  return (
    <motion.div
      style={{ ...style, rotateY: role === "flip" ? angle : 0 }}
      aria-hidden={role === "hidden" || sizer || undefined}
      inert={role === "hidden" || sizer || undefined}
    >
      <div className="relative h-full" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
        {children}
        {role === "flip" && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-r-[10px] rounded-l-[3px] bg-gradient-to-l from-[#3a1422]/70 via-[#3a1422]/20 to-transparent"
            style={{ opacity: bend }}
          />
        )}
        {role === "static" && turning && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-r-[10px] rounded-l-[3px] bg-gradient-to-r from-[#2a0c18]/80 via-[#2a0c18]/25 to-transparent"
            style={{ opacity: cast }}
          />
        )}
      </div>
      {/* reverse side, seen while the page is mid-turn */}
      <div
        aria-hidden
        className={`absolute inset-0 rounded-l-[10px] rounded-r-[3px] ${
          back === "endpaper"
            ? "bg-[#f1d3da] bg-[radial-gradient(circle,rgba(201,111,138,0.28)_1.5px,transparent_2px)] bg-[length:22px_22px]"
            : "bg-gradient-to-l from-[#f6ede1] to-[#ece0d0]"
        }`}
        style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
      >
        {role === "flip" && (
          <motion.div
            className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-[#3a1422]/50 to-transparent"
            style={{ opacity: bend }}
          />
        )}
      </div>
    </motion.div>
  );
}

function Cover({ t, onOpen }: { t: LetterContent; onOpen: () => void }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-r-[10px] rounded-l-[3px] bg-[#f7efe3] px-7 py-12 text-center shadow-[inset_8px_0_14px_-8px_rgba(80,40,30,0.35)] sm:px-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[image:var(--grain-dark)] opacity-[0.08]" />
      <div aria-hidden className="pointer-events-none absolute inset-4 rounded-[6px] border border-[#b08a5a]/30 sm:inset-6" />
      <p className="eyebrow relative text-[0.62rem] text-[#a3805a]/80">Nº {site.birthday.dayNumber} · 22</p>
      <h3 className="relative mt-4 font-serif text-[clamp(1.8rem,7vw,2.7rem)] leading-[1.1] tracking-[0.06em] text-[#a8844f] uppercase">
        {t.cover.title}
      </h3>
      <p className="relative mt-3 font-serif text-lg text-ink-soft italic">{t.cover.subtitle}</p>
      <PressedFlowers className="relative my-7 w-[78%] max-w-[19rem]" />
      <button
        type="button"
        onClick={onOpen}
        className="relative inline-flex min-h-12 items-center gap-2 rounded-full bg-rose-deep px-7 font-medium text-ivory shadow-[0_12px_30px_-12px_rgba(169,70,106,0.8)] transition-transform duration-150 hover:bg-[#933a5c] active:scale-[0.97]"
      >
        <BookOpen className="h-4 w-4" aria-hidden />
        {t.cover.open}
      </button>
    </div>
  );
}

function Page({
  t,
  index,
  total,
  revealed,
  uid,
}: {
  uid: string;
  t: LetterContent;
  index: number;
  total: number;
  revealed: boolean;
}) {
  const page = t.pages[index];
  const last = index === total - 1;
  const reduced = useReducedMotion();
  const signature = site.from.startsWith("[") ? null : site.from;

  return (
    <article className="paper relative flex h-full flex-col rounded-r-[10px] rounded-l-[3px] px-5 pt-8 pb-5 shadow-[inset_10px_0_16px_-10px_rgba(80,40,30,0.3)] sm:px-12 sm:pt-14 sm:pb-9">
      <CornerSprig className="absolute top-2 right-2 w-12 -scale-x-100 opacity-75 sm:w-16" />
      <CornerSprig className="absolute bottom-2 left-2 w-12 -scale-x-100 rotate-180 opacity-75 sm:w-16" />
      <div aria-hidden className="pointer-events-none absolute inset-3 rounded-[4px] border border-rose/15 sm:inset-5" />

      <header className="relative text-center">
        <p className="eyebrow text-[0.62rem] text-rose/70">
          {t.pageLabel} {ROMAN[index]}
        </p>
        <h3 className="mt-1.5 font-serif text-[clamp(1.6rem,6vw,2.4rem)] leading-[1.08] text-rose-deep italic text-balance">
          {page.title}
        </h3>
        <Ornament />
      </header>

      <div className="relative mt-4 space-y-3 font-serif text-[1.02rem] leading-[1.6] text-ink sm:mt-6 sm:space-y-4 sm:text-[1.22rem] sm:leading-[1.72]">
        {page.paragraphs.map((p, i) => {
          // a short first line reads as a greeting; the drop cap goes on the first full paragraph
          const greeting = i === 0 && p.length < 60;
          const dropCap = i === (page.paragraphs[0].length < 60 ? 1 : 0);
          return (
            <p
              key={i}
              className={
                greeting
                  ? "text-[1.3em] leading-snug text-rose-deep italic"
                  : dropCap
                    ? "first-letter:float-left first-letter:mt-1 first-letter:mr-2 first-letter:font-serif first-letter:text-[3.2em] first-letter:leading-[0.75] first-letter:text-rose"
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
          className="relative mt-5 flex flex-col items-center text-center sm:mt-8"
          initial={false}
          animate={revealed ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: reduced ? 0 : 10, filter: reduced ? "none" : "blur(6px)" }}
          transition={{ duration: reduced ? 0.01 : 1.4, delay: revealed && !reduced ? 0.4 : 0, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-14" aria-hidden>
            <Bloom id={`letter-end-${uid}`} open={revealed} species="rose" palette="blush" size="100%" squash={0.82} delay={0.6} duration={2.4} />
          </div>
          <p className="mt-2 font-serif text-[1.45rem] text-rose-deep italic">{t.closing}</p>
          {signature && <p className="mt-1 font-hand text-[2.1rem] leading-none text-rose-deep">{signature}</p>}
        </motion.div>
      )}

      <p className="relative mt-auto pt-4 text-center font-serif text-sm text-ink-soft/70 italic sm:pt-7" aria-hidden>
        — {index + 1} —
      </p>
    </article>
  );
}

/**
 * The birthday letter as a little keepsake book: a cover, five pages that
 * turn in 3D, and an English / Bahasa Indonesia toggle that keeps her place.
 */
export function LetterBook() {
  const [lang, setLang] = useState<Lang>("en");
  const [page, setPage] = useState(0); // 0 = cover, 1… = pages
  const [turn, setTurn] = useState<{ from: number; to: number } | null>(null);
  const angle = useMotionValue(0);
  // the turn in progress (if any), so a stalled one can never lock the book
  const active = useRef<{ stop: () => void; finish: () => void; until: number } | null>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const burstDone = useRef(false);
  const reduced = useReducedMotion();

  const t = letterBook[lang];
  const other = letterBook[lang === "en" ? "id" : "en"];
  const pageCount = t.pages.length;
  const total = pageCount + 1;
  const last = total - 1;

  const go = useCallback(
    (to: number) => {
      if (active.current) {
        // ignore rapid repeat clicks while a page is turning…
        if (performance.now() < active.current.until) return;
        // …but if a turn never finished (e.g. the tab was hidden mid-turn), settle it first
        active.current.stop();
        active.current.finish();
      }
      if (to < 1 || to > last || to === page) return; // once opened, the cover stays open
      if (reduced) {
        setPage(to);
        return;
      }
      const forward = to > page;
      const finish = () => {
        setPage(to);
        setTurn(null);
        angle.set(0);
        active.current = null;
      };
      angle.set(forward ? 0 : -180);
      setTurn({ from: page, to });
      const controls = animate(angle, forward ? -180 : 0, { duration: TURN_SECONDS, ease: TURN_EASE, onComplete: finish });
      active.current = { stop: () => controls.stop(), finish, until: performance.now() + (TURN_SECONDS + 0.6) * 1000 };
    },
    [angle, last, page, reduced],
  );

  const next = useCallback(() => go(page + 1), [go, page]);
  const prev = useCallback(() => go(page - 1), [go, page]);

  // ← → turn the pages while the book is in the middle of the screen (never while typing a wish)
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

  const revealed = page === last && !turn;

  // a few petals drift across the last page once it's reached
  useEffect(() => {
    if (!revealed || reduced || burstDone.current) return;
    burstDone.current = true;
    const timer = window.setTimeout(() => {
      const r = bookRef.current?.getBoundingClientRect();
      if (r) burstPetals(r.left + r.width / 2, r.top + r.height * 0.7);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [revealed, reduced]);

  const roleOf = (i: number): Role => {
    if (!turn) return i === page ? "static" : "hidden";
    const forward = turn.to > turn.from;
    if (forward) return i === turn.from ? "flip" : i === turn.to ? "static" : "hidden";
    return i === turn.to ? "flip" : i === turn.from ? "static" : "hidden";
  };

  const pageIndicator = page === 0 ? null : `${String(page).padStart(2, "0")} / ${String(pageCount).padStart(2, "0")}`;

  return (
    <div className="mx-auto flex w-full max-w-[36rem] flex-col items-center">
      {/* language toggle */}
      <div className="mb-5 flex w-full items-center justify-end">
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

      {/* the book */}
      <div
        ref={bookRef}
        className="relative w-full [perspective:2200px]"
        style={{ touchAction: "pan-y" }}
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
        <div aria-hidden className="absolute inset-x-[4%] -bottom-4 h-10 rounded-[50%] bg-black/60 blur-xl" />
        {/* page edges peeking out behind the open page */}
        {page > 0 && (
          <div aria-hidden className="absolute inset-y-[6px] right-[-5px] left-[8px] rounded-r-[10px] bg-[#eadfce] shadow-[2px_2px_0_#e2d5c2,4px_4px_0_#d9cab5]" />
        )}

        <div className="relative grid" lang={lang === "id" ? "id" : "en"} aria-live="polite">
          <Leaf role={roleOf(0)} angle={angle} back="endpaper" turning={!!turn}>
            <Cover t={t} onOpen={() => go(1)} />
          </Leaf>
          {t.pages.map((_, i) => (
            <Leaf key={`${lang}-${i}`} role={roleOf(i + 1)} angle={angle} turning={!!turn}>
              <Page uid={`live-${i}`} t={t} index={i} total={pageCount} revealed={revealed && i === pageCount - 1} />
            </Leaf>
          ))}
          {/* invisible copies in the other language keep the book's size steady when switching */}
          {other.pages.map((_, i) => (
            <Leaf key={`sizer-${i}`} role="hidden" angle={angle} sizer>
              <Page uid={`sizer-${i}`} t={other} index={i} total={pageCount} revealed={false} />
            </Leaf>
          ))}

          {/* the spine */}
          <div aria-hidden className="pointer-events-none z-[4] [grid-area:1/1] w-6 rounded-l-[3px] bg-gradient-to-r from-[#5a2a36]/25 to-transparent" />

          {/* tap the page edges to turn */}
          {page > 1 && (
            <button
              type="button"
              onClick={prev}
              aria-label={t.ui.prev}
              tabIndex={-1}
              className="group z-[5] w-[9%] cursor-w-resize self-stretch justify-self-start [grid-area:1/1]"
            >
              <span className="block h-full w-full rounded-l-[3px] bg-gradient-to-r from-rose/0 to-rose/0 transition-colors group-hover:from-rose/10" />
            </button>
          )}
          {page > 0 && page < last && (
            <button
              type="button"
              onClick={next}
              aria-label={t.ui.next}
              tabIndex={-1}
              className="group z-[5] w-[9%] cursor-e-resize self-stretch justify-self-end [grid-area:1/1]"
            >
              {/* a little curled corner */}
              <span className="absolute right-0 bottom-0 h-10 w-10 rounded-tl-[14px] bg-gradient-to-tl from-[#e9dccb] via-[#f6eee3] to-transparent opacity-70 shadow-[-3px_-3px_8px_-4px_rgba(80,40,30,0.4)] transition-all duration-300 group-hover:h-14 group-hover:w-14 group-hover:opacity-100" />
            </button>
          )}
        </div>
      </div>

      {/* controls */}
      <div className={`mt-8 flex w-full items-center justify-between transition-opacity duration-500 ${page === 0 ? "pointer-events-none opacity-0" : "opacity-100"}`}>
        <button
          type="button"
          onClick={prev}
          disabled={page <= 1}
          aria-label={t.ui.prev}
          className="glass grid h-12 w-12 place-items-center rounded-full text-white transition hover:bg-white/10 disabled:opacity-30"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </button>
        <div className="text-center">
          <p className="font-serif text-xl text-white tabular-nums italic" aria-live="polite">
            {pageIndicator}
          </p>
          <p className="mt-1 hidden text-xs text-white/40 sm:block">{t.ui.hint}</p>
        </div>
        <button
          type="button"
          onClick={next}
          disabled={page >= last}
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
