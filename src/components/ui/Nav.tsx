"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";
import { site } from "@/content/site";

export const NAV_LINKS = [
  { id: "garden", label: "Garden" },
  { id: "memories", label: "Memories" },
  { id: "letter", label: "Letter" },
  { id: "wishes", label: "Wishes" },
  { id: "forever", label: "Always" },
];

function FlowerMark() {
  return (
    <svg viewBox="-20 -20 40 40" className="h-6 w-6" aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse key={i} cx={0} cy={-9} rx={5.5} ry={9} fill={i % 2 ? "#f2a7bb" : "#f7c6d3"} transform={`rotate(${i * 60})`} />
      ))}
      <circle r={4.5} fill="#f1cd86" />
    </svg>
  );
}

export function Nav({ visible }: { visible: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("garden");
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    NAV_LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
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
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
          scrolled ? "bg-ivory/70 shadow-[0_8px_30px_-20px_rgba(122,64,84,0.35)] backdrop-blur-md" : "bg-transparent"
        }`}
        initial={{ opacity: 0, y: -16 }}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
        transition={{ duration: reduced ? 0.01 : 0.9, delay: visible && !reduced ? 1.2 : 0 }}
        inert={!visible}
      >
        <nav aria-label="Sections" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <a href="#garden" className="flex items-center gap-2 font-serif text-xl text-rose-deep italic">
            <FlowerMark />
            <span>for {site.her.nickname}</span>
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  aria-current={active === l.id ? "true" : undefined}
                  className={`eyebrow relative rounded-full px-4 py-2 transition-colors ${
                    active === l.id ? "text-rose-deep" : "text-ink-soft hover:text-rose-deep"
                  }`}
                >
                  {l.label}
                  {active === l.id && (
                    <motion.span layoutId="nav-dot" className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-rose" />
                  )}
                </a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="grid h-11 w-11 place-items-center rounded-full text-rose-deep transition hover:bg-white/50 md:hidden"
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
            className="fixed inset-0 z-[60] flex flex-col bg-gradient-to-b from-[#fbe3e8] to-[#fdeee6] px-6 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.35 }}
          >
            <div className="flex h-16 items-center justify-end">
              <button
                type="button"
                autoFocus
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid h-11 w-11 place-items-center rounded-full text-rose-deep hover:bg-white/50"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <ul className="mt-6 flex flex-col gap-2">
              {NAV_LINKS.map((l, i) => (
                <motion.li
                  key={l.id}
                  initial={{ opacity: 0, x: reduced ? 0 : -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduced ? 0 : 0.05 + i * 0.06, duration: reduced ? 0.01 : 0.5 }}
                >
                  <a
                    href={`#${l.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 border-b border-rose/10 py-4 font-serif text-4xl font-light text-ink"
                  >
                    <span className="eyebrow text-rose-deep/70">0{i + 1}</span>
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <p className="mt-auto mb-10 text-center font-hand text-2xl text-rose-deep/80">
              {site.birthday.dateLabel}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
