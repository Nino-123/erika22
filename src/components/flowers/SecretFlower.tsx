"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { burstPetals } from "./PetalCanvas";

/**
 * One small glowing flower by the garden path. Hover (mouse) or tap/press it
 * and it blooms brighter and shows a little note. The note closes on a second
 * tap, the × button, Escape, or a tap anywhere else.
 */
export function SecretFlower({ message, label, style }: { message: string; label: string; style?: React.CSSProperties }) {
  const reduced = useReducedMotion();
  const id = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  // opened by a click/tap/keyboard stays open; opened by hovering closes on leave
  const [pinned, setPinned] = useState(false);
  const burstDone = useRef(false);

  const show = () => {
    setOpen(true);
    if (!burstDone.current && !reduced && buttonRef.current) {
      burstDone.current = true;
      const r = buttonRef.current.getBoundingClientRect();
      burstPetals(r.left + r.width / 2, r.top + r.height / 3);
    }
  };
  const close = (refocus = false) => {
    setOpen(false);
    setPinned(false);
    if (refocus) buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-auto absolute -translate-x-1/2"
      style={style}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") show();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse" && !pinned) setOpen(false);
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            id={id}
            role="status"
            initial={{ opacity: 0, y: reduced ? 0 : 8, scale: reduced ? 1 : 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : 4 }}
            transition={{ duration: reduced ? 0.01 : 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="glass absolute bottom-full left-1/2 mb-2 w-[min(16rem,72vw)] -translate-x-1/2 rounded-2xl py-3 pr-9 pl-4 text-left"
            style={{ background: "linear-gradient(180deg, rgba(42,22,32,0.82), rgba(16,9,13,0.88))" }}
          >
            <p className="font-serif text-[1.08rem] leading-snug text-white italic">{message}</p>
            <button
              type="button"
              onClick={() => close(true)}
              aria-label="Close"
              className="absolute top-1.5 right-1.5 grid h-8 w-8 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => {
          if (open && pinned) close();
          else {
            setPinned(true);
            show();
          }
        }}
        className="group relative grid h-12 w-12 place-items-center rounded-full"
      >
        {/* a faint, slow pulse so it can be discovered — brighter once found */}
        <span
          aria-hidden
          className={`absolute inset-0 rounded-full transition-opacity duration-700 ${open ? "opacity-100" : "breathe opacity-60 group-hover:opacity-90"}`}
          style={{ background: "radial-gradient(circle, rgba(255,226,176,0.55) 0, rgba(244,182,198,0.25) 38%, transparent 68%)" }}
        />
        <svg
          viewBox="-20 -22 40 46"
          aria-hidden
          className="relative h-auto w-7 transition-transform duration-700 ease-out"
          style={{ transform: open ? "scale(1.25) translateY(-2px)" : undefined }}
        >
          <path d="M0 24 Q -2 12 0 2" stroke="#6b8460" strokeWidth="1.6" fill="none" />
          <path d="M0 16 C -6 12, -10 13, -12 9 C -6 8, -2 11, 0 16Z" fill="#5d7552" />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-8" rx="5.6" ry="8.4" fill="#fde7ee" stroke="#f2b0c1" strokeWidth="0.6" transform={`translate(0 -2) scale(1 0.8) rotate(${a})`} />
          ))}
          <circle cx="0" cy="-2" r="3.4" fill="#f5cf72" />
          <circle cx="-0.9" cy="-2.8" r="1.3" fill="#fff4cf" />
        </svg>
      </button>
    </div>
  );
}
