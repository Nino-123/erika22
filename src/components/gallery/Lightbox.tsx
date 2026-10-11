"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Photo } from "@/content/site";

export function Lightbox({
  photos,
  index,
  onClose,
  onChange,
}: {
  photos: Photo[];
  index: number | null;
  onClose: () => void;
  onChange: (index: number) => void;
}) {
  const reduced = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const open = index !== null;
  const photo = open ? photos[index] : null;
  const count = photos.length;

  const prev = () => index !== null && onChange((index - 1 + count) % count);
  const next = () => index !== null && onChange((index + 1) % count);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevOverflow;
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowLeft") prev();
    else if (e.key === "ArrowRight") next();
    else if (e.key === "Tab") {
      // keep focus inside the dialog
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <AnimatePresence>
      {photo && index !== null && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={photo.caption || photo.alt}
          onKeyDown={onKeyDown}
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-[#3a2129]/80 px-4 py-16 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.01 : 0.35 }}
          onClick={onClose}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
          }}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close photo"
            className="absolute top-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>

          <AnimatePresence mode="popLayout" initial={false}>
            <motion.figure
              key={index}
              className="flex max-h-full w-full max-w-4xl flex-col items-center"
              initial={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduced ? 1 : 0.98 }}
              transition={{ duration: reduced ? 0.01 : 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rounded-sm bg-ivory p-2.5 pb-3 shadow-2xl sm:p-4">
                <div className="relative h-[min(68svh,720px)] w-[min(86vw,900px)]">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 768px) 90vw, 900px"
                    className="object-contain"
                    unoptimized={photo.src.endsWith(".svg")}
                    priority
                  />
                </div>
              </div>
              {photo.caption && (
                <figcaption className="mt-4 text-center font-hand text-2xl text-white/95">
                  {photo.caption}
                </figcaption>
              )}
              <p className="eyebrow mt-2 text-white/60" aria-live="polite">
                {index + 1} / {count}
              </p>
            </motion.figure>
          </AnimatePresence>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Previous photo"
                className="absolute top-1/2 left-2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:left-6"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Next photo"
                className="absolute top-1/2 right-2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:right-6"
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
