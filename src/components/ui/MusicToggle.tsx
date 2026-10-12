"use client";

import { useRef, useState } from "react";
import { Music2, Pause } from "lucide-react";
import { site } from "@/content/site";

/**
 * Optional background music. Hidden entirely unless `site.music.src` is set,
 * and it only ever starts after she taps it.
 */
export function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const { src, title } = site.music;
  if (!src) return null;

  const toggle = async () => {
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
  };

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="none" onEnded={() => setPlaying(false)} />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? `Pause ${title}` : `Play ${title}`}
        className="glass fixed right-4 bottom-4 z-[75] flex h-12 items-center gap-2 rounded-full px-4 text-sm text-white transition hover:bg-white/10 sm:right-6 sm:bottom-6"
      >
        {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Music2 className="h-4 w-4" aria-hidden />}
        <span className="hidden font-serif text-base italic sm:inline">{playing ? "pause" : title}</span>
        {playing && (
          <span aria-hidden className="flex h-3 items-end gap-[2px]">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-[2px] animate-pulse rounded bg-petal"
                style={{ height: `${6 + i * 3}px`, animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </span>
        )}
      </button>
    </>
  );
}
