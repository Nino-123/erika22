"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CloudOff, Sprout, X } from "lucide-react";
import { site } from "@/content/site";
import { wishesCopy } from "@/content/wishes";
import type { Lang } from "@/content/letter";
import type { PublicWish } from "@/lib/wishes";
import { WishCard } from "@/components/wishes/WishCard";
import { WishForm } from "@/components/wishes/WishForm";
import { DreamyBackdrop } from "@/components/ui/DreamyBackdrop";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

type Status = "loading" | "ready" | "unconfigured" | "error";

export function Wishes() {
  const { her } = site;
  const reduced = useReducedMotion();
  const [lang, setLang] = useState<Lang>("en");
  const copy = wishesCopy[lang];
  const [status, setStatus] = useState<Status>("loading");
  const [wishes, setWishes] = useState<PublicWish[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [planted, setPlanted] = useState<null | "live" | "pending">(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/wishes", { cache: "no-store" });
      const data = await res.json();
      if (data.configured === false) return setStatus("unconfigured");
      if (!res.ok) {
        // Helps the site owner diagnose setup problems from the browser console.
        if (data.reason) console.warn(`[wishes] ${data.reason}: ${data.fix}`);
        return setStatus("error");
      }
      setWishes(data.wishes ?? []);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    // Fetching on mount; state is only set after the network responds.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const onPlanted = (wish: PublicWish, pending: boolean) => {
    if (!pending) setWishes((w) => [wish, ...w.filter((x) => x.id !== wish.id)]);
    setPlanted(pending ? "pending" : "live");
    setFormOpen(false);
  };

  const unconfigured = status === "unconfigured";

  return (
    <section
      id="wishes"
      className="relative overflow-hidden bg-night px-4 pt-24 pb-28 sm:px-8 sm:pt-32"
    >
      <DreamyBackdrop
        blobs={[
          { color: "rgba(169,70,106,0.2)", top: "0%", left: "50%", size: "55vmax" },
          { color: "rgba(100,121,92,0.16)", top: "40%", left: "-20%", size: "50vmax", dx: "40px", duration: 26 },
          { color: "rgba(246,199,176,0.08)", top: "75%", left: "55%", size: "45vmax" },
        ]}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* language toggle */}
        <div className="mb-8 flex justify-center">
          <div role="group" aria-label={copy.language} className="glass flex items-center rounded-full p-1 text-sm">
            {(["en", "id"] as const).map((l) => (
              <button
                key={l}
                type="button"
                lang={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                aria-label={l === "en" ? "English" : "Bahasa Indonesia"}
                className={`min-h-9 min-w-11 rounded-full px-3 font-medium tracking-wider transition-colors duration-200 ${
                  lang === l ? "bg-white text-night" : "text-white/65 hover:text-white"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div lang={lang}>
          <SectionHeading key={lang} eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />
        </div>

        {/* Honest notice when the database isn't connected yet */}
        {unconfigured && (
          <Reveal className="mx-auto mt-10 max-w-xl">
            <div role="status" className="glass-soft flex gap-3 rounded-2xl p-5 text-sm leading-relaxed text-white/70">
              <CloudOff className="mt-0.5 h-5 w-5 shrink-0 text-petal" aria-hidden />
              <p>
                <strong className="font-medium text-white">{copy.unconfiguredTitle}</strong> {copy.unconfiguredBody}
              </p>
            </div>
          </Reveal>
        )}

        <div lang={lang} className="relative mx-auto mt-10 max-w-2xl text-center">
          <AnimatePresence mode="popLayout" initial={false}>
            {formOpen ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: reduced ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -10 }}
                transition={{ duration: reduced ? 0.01 : 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="glass relative rounded-[28px] p-6 text-left sm:p-10"
              >
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  aria-label={copy.form.close}
                  className="absolute top-3 right-3 grid h-11 w-11 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
                <h3 className="pr-10 font-serif text-[2.2rem] leading-tight text-white italic">
                  {copy.form.title(her.name)}
                </h3>
                <p className="mt-2 mb-7 font-light text-white/60">
                  {copy.form.subtitle}
                </p>
                <WishForm copy={copy} disabled={unconfigured} onPlanted={onPlanted} />
              </motion.div>
            ) : (
              <motion.div
                key="cta"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0.01 : 0.4 }}
                className="flex flex-col items-center"
              >
                {planted && (
                  <p role="status" className="glass-soft mb-6 rounded-full px-5 py-2.5 font-serif text-lg text-white/90 italic">
                    {planted === "live" ? copy.plantedLive : copy.plantedPending}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setFormOpen(true)}
                  disabled={unconfigured}
                  className="btn-light"
                >
                  <Sprout className="h-5 w-5" aria-hidden />
                  {planted ? copy.buttonAgain : copy.button}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-16" aria-live="polite">
          {status === "loading" && (
            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3" aria-label={copy.loading}>
              {[0, 1, 2].map((i) => (
                <div key={i} className="mb-6 h-40 animate-pulse rounded-[22px] bg-white/5" />
              ))}
            </div>
          )}

          {status === "error" && (
            <p className="text-center text-white/60">
              {copy.loadError}{" "}
              <button type="button" onClick={load} className="underline decoration-petal underline-offset-4 hover:text-white">
                {copy.retry}
              </button>
            </p>
          )}

          {status === "ready" && wishes.length === 0 && (
            <p className="text-center font-serif text-2xl text-white/55 italic">{copy.empty}</p>
          )}

          {status === "ready" && wishes.length > 0 && (
            <>
              <p className="eyebrow mb-10 text-center text-white/45">
                {copy.count(wishes.length)}
              </p>
              <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 lg:gap-7">
                {wishes.map((w, i) => (
                  <WishCard key={w.id} wish={w} index={i} locale={copy.dateLocale} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
