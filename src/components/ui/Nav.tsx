"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { site } from "@/content/site";
import { DUR, EASE_OUT, STAGGER } from "@/lib/motion";

export const NAV_LINKS = [
  { id: "garden", label: "Garden" },
  { id: "story", label: "Her Story" },
  { id: "memories", label: "Memories" },
  { id: "letter", label: "Letter" },
  { id: "forever", label: "Always" },
];

function FlowerMark() {
  return (
    <svg viewBox="-20 -20 40 40" className="h-6 w-6 drop-shadow-[0_0_8px_rgba(244,182,198,0.6)]" aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse key={i} cx={0} cy={-9} rx={5.5} ry={9} fill={i % 2 ? "#f2a7bb" : "#f7c6d3"} transform={`rotate(${i * 60})`} />
      ))}
      <circle r={4.5} fill="#f1cd86" />
    </svg>
  );
}

/** Fixed liquid-glass pill navigation. */
export function Nav({ visible }: { visible: boolean }) {
  const [active, setActive] = useState("garden");
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    [...NAV_LINKS.map((l) => l.id), "wishes"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const html = document.documentElement;
    html.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6"
        initial={{ opacity: 0, y: -16 }}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
        transition={{ duration: reduced ? 0.01 : DUR.slow, delay: visible && !reduced ? 1 : 0, ease: EASE_OUT }}
        inert={!visible}
      >
        {/* soft fade so the brand never collides with content scrolling beneath */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-night via-night/70 to-transparent" />
        <nav aria-label="Sections" className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <a href="#garden" className="flex items-center gap-2 font-serif text-[1.35rem] text-white italic">
            <FlowerMark />
            <span>for {site.her.nickname}</span>
          </a>

          <div className="glass hidden items-center gap-1 rounded-full p-1.5 md:flex">
            <ul className="flex items-center">
              {NAV_LINKS.map((l) => (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    aria-current={active === l.id ? "true" : undefined}
                    className={`relative block rounded-full px-4 py-2 text-[0.92rem] font-medium transition-colors duration-200 ${
                      active === l.id ? "text-white" : "text-white/60 hover:text-white"
                    }`}
                  >
                    {active === l.id && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-white/12"
                        transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      />
                    )}
                    <span className="relative">{l.label}</span>
                  </a>
                </li>
              ))}
            </ul>
            <a href="#wishes" className="btn-light ml-1 min-h-0 py-2 pr-4 pl-5 text-[0.92rem]">
              Leave a wish <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          </div>

          {/* keeps the pill centred on desktop */}
          <span aria-hidden className="hidden w-[9.5rem] md:block" />

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="glass grid h-11 w-11 place-items-center rounded-full text-white md:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-[60] flex flex-col bg-night/85 px-6 backdrop-blur-2xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.01 : DUR.standard * 0.7 }}
          >
            <div className="flex h-[4.75rem] items-center justify-end">
              <button
                type="button"
                autoFocus
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="glass grid h-11 w-11 place-items-center rounded-full text-white"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <ul className="mt-4 flex flex-col">
              {[...NAV_LINKS, { id: "wishes", label: "Wishes" }].map((l, i) => (
                <motion.li
                  key={l.id}
                  initial={{ opacity: 0, y: reduced ? 0 : 12, filter: reduced ? "none" : "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: reduced ? 0 : 0.05 + i * STAGGER.standard, duration: reduced ? 0.01 : DUR.standard, ease: EASE_OUT }}
                >
                  <a
                    href={`#${l.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 border-b border-white/10 py-4 font-serif text-[2.6rem] text-white italic"
                  >
                    <span className="eyebrow not-italic text-white/40">0{i + 1}</span>
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <p className="mt-auto mb-10 text-center font-serif text-xl text-white/50 italic">
              {site.birthday.dateLabel}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
