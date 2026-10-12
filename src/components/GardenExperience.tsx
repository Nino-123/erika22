"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { PetalCanvas } from "@/components/flowers/PetalCanvas";
import { Intro } from "@/components/sections/Intro";
import { GardenHero } from "@/components/sections/GardenHero";
import { Gallery } from "@/components/sections/Gallery";
import { StoryChapter } from "@/components/story/StoryChapter";
import { Letter } from "@/components/sections/Letter";
import { Wishes } from "@/components/sections/Wishes";
import { Finale } from "@/components/sections/Finale";
import { Nav } from "@/components/ui/Nav";
import { MusicToggle } from "@/components/ui/MusicToggle";
import { FloralSeam } from "@/components/ui/FloralSeam";

export function GardenExperience() {
  const [entered, setEntered] = useState(false);

  // Keep the page still while the opening gift is showing.
  useEffect(() => {
    const html = document.documentElement;
    html.style.overflow = entered ? "" : "hidden";
    return () => {
      html.style.overflow = "";
    };
  }, [entered]);

  const replay = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setEntered(false);
  };

  return (
    <>
      <PetalCanvas count={entered ? 16 : 8} fireflies={entered ? 16 : 10} above={!entered} />

      <AnimatePresence>{!entered && <Intro key="intro" onEnter={() => setEntered(true)} />}</AnimatePresence>

      <Nav visible={entered} />

      <main inert={!entered} aria-hidden={!entered}>
        <GardenHero entered={entered} />
        <StoryChapter />
        <FloralSeam variant="foliage" />
        <Gallery />
        <FloralSeam variant="petals" />
        <Letter />
        <FloralSeam variant="roses" />
        <Wishes />
        <FloralSeam variant="glow" glow="rgba(240,160,180,0.16)" />
        <Finale onReplay={replay} />
      </main>

      <MusicToggle />
    </>
  );
}
