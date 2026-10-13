"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { site } from "@/content/site";
import { Polaroid } from "@/components/gallery/Polaroid";
import { Lightbox } from "@/components/gallery/Lightbox";
import { QualitiesGarden } from "@/components/gallery/QualitiesGarden";
import { DreamyBackdrop } from "@/components/ui/DreamyBackdrop";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Gallery() {
  const { gallery } = site;
  const albums = gallery.albums.filter((a) => a.photos.length > 0 || a.garden);
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
      className="relative overflow-hidden bg-night px-5 pt-16 pb-16 sm:px-8 sm:pt-24 sm:pb-24"
    >
      <DreamyBackdrop
        blobs={[
          { color: "rgba(169,70,106,0.22)", top: "5%", left: "-20%", size: "50vmax" },
          { color: "rgba(246,199,176,0.10)", top: "45%", left: "60%", size: "50vmax", dx: "-30px", duration: 26 },
        ]}
      />

      <div className="relative z-10">
        <SectionHeading eyebrow={gallery.eyebrow} title={gallery.title} intro={gallery.intro} />

        {albums.length > 1 && (
          <div
            role="tablist"
            aria-label="Photo albums"
            className="glass mx-auto mt-10 flex w-fit max-w-full snap-x gap-1 overflow-x-auto rounded-full p-1.5 [scrollbar-width:none]"
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
                  className={`relative min-h-10 shrink-0 snap-start rounded-full px-4 py-2 text-[0.92rem] font-medium whitespace-nowrap transition-colors duration-200 ${
                    selected ? "text-night" : "text-white/65 hover:text-white"
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="album-pill"
                      className="absolute inset-0 rounded-full bg-white shadow-[0_8px_30px_-10px_rgba(244,182,198,0.6)]"
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
              {album.garden ? (
                <QualitiesGarden />
              ) : (
                <>
                  {album.description && (
                    <p className="mx-auto mb-12 max-w-lg text-center font-serif text-2xl text-white/60 italic">
                      {album.description}
                    </p>
                  )}
                  {/* phones: one column, gently zig-zagging like a scrapbook page */}
                  <div className="columns-1 gap-8 sm:columns-2 lg:columns-3 lg:gap-10 [&>*:nth-child(odd)]:mr-[10%] [&>*:nth-child(even)]:ml-[10%] sm:[&>*]:mx-0!">
                    {album.photos.map((photo, i) => (
                      <Polaroid key={`${active}-${i}`} photo={photo} index={i} onOpen={() => setLightbox(i)} />
                    ))}
                  </div>
                </>
              )}
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
