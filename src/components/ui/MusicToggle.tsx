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
        className="fixed right-4 bottom-4 z-[75] flex h-12 items-center gap-2 rounded-full bg-ivory/85 px-4 text-sm text-rose-deep shadow-[0_10px_30px_-12px_rgba(169,70,106,0.5)] ring-1 ring-blush-deep backdrop-blur transition hover:bg-white sm:right-6 sm:bottom-6"
      >
        {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Music2 className="h-4 w-4" aria-hidden />}
        <span className="hidden font-serif text-base italic sm:inline">{playing ? "pause" : title}</span>
        {playing && (
          <span aria-hidden className="flex h-3 items-end gap-[2px]">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-[2px] animate-pulse rounded bg-rose"
                style={{ height: `${6 + i * 3}px`, animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </span>
        )}
      </button>
    </>
  );
}
