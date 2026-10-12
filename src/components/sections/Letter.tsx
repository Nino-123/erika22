"use client";

import { site } from "@/content/site";
import { LetterBook } from "@/components/letter/LetterBook";
import { DreamyBackdrop } from "@/components/ui/DreamyBackdrop";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Chapter III — the birthday letter, as a little keepsake book. */
export function Letter() {
  const { letter } = site;

  return (
    <section id="letter" className="relative overflow-hidden bg-night px-4 pt-24 pb-28 sm:px-8 sm:pt-32 sm:pb-36">
      <DreamyBackdrop
        blobs={[
          { color: "rgba(246,199,176,0.13)", top: "20%", left: "40%", size: "55vmax" },
          { color: "rgba(169,70,106,0.2)", top: "50%", left: "-25%", size: "55vmax", dx: "40px", duration: 24 },
        ]}
      />

      <div className="relative z-10">
        <SectionHeading eyebrow={letter.eyebrow} title={letter.title} />
        <Reveal className="mt-10 sm:mt-14" y={30}>
          <LetterBook />
        </Reveal>
      </div>
    </section>
  );
}
