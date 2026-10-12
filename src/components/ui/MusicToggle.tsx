"use client";

import { useEffect, useRef, useState } from "react";
import { Music2, Pause } from "lucide-react";
import { site } from "@/content/site";
import type { GardenLullaby } from "@/lib/lullaby";

/**
 * Background music. Plays your own song if `site.music.src` is set, otherwise
 * the generated "garden lullaby". It only ever starts when she taps it.
 */
export function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const lullabyRef = useRef<GardenLullaby | null>(null);
  const [playing, setPlaying] = useState(false);
  const [touched, setTouched] = useState(false);
  const { src, lullaby, title } = site.music;

  useEffect(() => () => lullabyRef.current?.dispose(), []);

  if (!src && !lullaby) return null;

  const toggle = async () => {
    setTouched(true);
    if (src) {
      const audio = audioRef.current;
      if (!audio) return;
      if (playing) {
        audio.pause();
        setPlaying(false);
        return;
      }
      audio.volume = 0.5;
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
      return;
    }

    if (playing) {
      lullabyRef.current?.stop();
      setPlaying(false);
      return;
    }
    try {
      if (!lullabyRef.current) {
        const { GardenLullaby } = await import("@/lib/lullaby");
        lullabyRef.current = new GardenLullaby();
      }
      await lullabyRef.current.start();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  return (
    <>
      {src && <audio ref={audioRef} src={src} loop preload="none" onEnded={() => setPlaying(false)} />}
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? `Pause the music` : `Play music: ${title}`}
        className="glass fixed right-4 bottom-4 z-[75] flex h-12 items-center gap-2.5 rounded-full bg-night/60! pr-4 pl-3.5 text-sm text-white transition-colors duration-200 hover:bg-night/80! sm:right-6 sm:bottom-6"
      >
        {!touched && (
          <span aria-hidden className="absolute inset-0 animate-ping rounded-full border border-petal/40 [animation-duration:2.6s]" />
        )}
        {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Music2 className="h-4 w-4" aria-hidden />}
        <span className="font-serif text-base italic">
          {playing ? (
            <span className="hidden sm:inline">{title}</span>
          ) : touched ? (
            "music"
          ) : (
            "play music"
          )}
        </span>
        {playing && (
          <span aria-hidden className="flex h-3.5 items-end gap-[3px]">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="w-[2px] rounded-full bg-petal"
                style={{
                  height: "100%",
                  transformOrigin: "bottom",
                  animation: `eq 1.${4 + i}s ease-in-out ${i * 0.18}s infinite`,
                }}
              />
            ))}
          </span>
        )}
      </button>
    </>
  );
}
