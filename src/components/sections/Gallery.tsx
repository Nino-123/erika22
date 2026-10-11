"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { site } from "@/content/site";
import { Polaroid } from "@/components/gallery/Polaroid";
import { Lightbox } from "@/components/gallery/Lightbox";
import { DreamyBackdrop } from "@/components/ui/DreamyBackdrop";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Gallery() {
  const { gallery } = site;
  const albums = gallery.albums.filter((a) => a.photos.length > 0);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = useReducedMotion();
  const album = albums[active];

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    let nextIndex: number | null = null;
    if (e.key === "ArrowRight") nextIndex = (i + 1) % albums.length;
    if (e.key === "ArrowLeft") nextIndex = (i - 1 + albums.length) % albums.length;
    if (nextIndex !== null) {
      e.preventDefault();
      setActive(nextIndex);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  if (!album) return null;

  return (
    <section
      id="memories"
      className="relative overflow-hidden bg-gradient-to-b from-[#fcece9] via-[#fdf4ee] to-[#fbf1e8] px-5 pt-24 pb-24 sm:px-8 sm:pt-32"
    >
      <DreamyBackdrop
        blobs={[
          { color: "rgba(247,205,215,0.55)", top: "5%", left: "-20%", size: "50vmax" },
          { color: "rgba(253,226,210,0.6)", top: "45%", left: "60%", size: "50vmax", dx: "-30px", duration: 26 },
        ]}
      />

      <div className="relative z-10">
        <SectionHeading eyebrow={gallery.eyebrow} title={gallery.title} intro={gallery.intro} />

        {albums.length > 1 && (
          <div
            role="tablist"
            aria-label="Photo albums"
            className="mx-auto mt-10 flex max-w-4xl snap-x gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:overflow-visible"
          >
            {albums.map((a, i) => {
              const selected = i === active;
              return (
                <button
                  key={a.title}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`album-tab-${i}`}
                  aria-selected={selected}
                  aria-controls="album-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => onTabKey(e, i)}
                  className={`relative min-h-11 shrink-0 snap-start rounded-full px-5 py-2 font-serif text-[1.05rem] whitespace-nowrap transition-colors ${
                    selected ? "text-ivory" : "text-rose-deep hover:bg-white/60"
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="album-pill"
                      className="absolute inset-0 rounded-full bg-rose shadow-[0_8px_20px_-10px_rgba(169,70,106,0.6)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{a.title}</span>
                </button>
              );
            })}
          </div>
        )}

        <div
          id="album-panel"
          role="tabpanel"
          aria-labelledby={`album-tab-${active}`}
          className="relative mx-auto mt-8 max-w-6xl"
        >
          <AnimatePresence mode="popLayout">
            <motion.div
              key={active}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.01 : 0.45 }}
            >
              {album.description && (
                <p className="mx-auto mb-10 max-w-lg text-center font-hand text-2xl text-rose-deep/90">
                  {album.description}
                </p>
              )}
              {/* phones: one column, gently zig-zagging like a scrapbook page */}
              <div className="columns-1 gap-8 sm:columns-2 lg:columns-3 lg:gap-10 [&>*:nth-child(odd)]:mr-[10%] [&>*:nth-child(even)]:ml-[10%] sm:[&>*]:mx-0!">
                {album.photos.map((photo, i) => (
                  <Polaroid key={`${active}-${i}`} photo={photo} index={i} onOpen={() => setLightbox(i)} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <Lightbox
        photos={album.photos}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onChange={setLightbox}
      />
    </section>
  );
}
