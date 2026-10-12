"use client";

import { useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Flower2, Loader2 } from "lucide-react";
import { LIMITS, validateWish, type PublicWish, type WishField } from "@/lib/wishes";

type Errors = Partial<Record<WishField, string>>;

const inputBase =
  "w-full rounded-2xl border bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-white/30 transition focus:border-petal/70 focus:bg-white/[0.07] focus:outline-none focus:ring-4 focus:ring-petal/15";

function Field({
  id,
  label,
  optional,
  error,
  count,
  max,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  count?: number;
  max?: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-serif text-xl text-white italic">
          {label}
          {optional && <span className="ml-2 font-sans text-xs text-white/40 not-italic">optional</span>}
        </label>
        {max !== undefined && count !== undefined && (
          <span className={`text-xs tabular-nums ${count > max ? "text-petal" : "text-white/35"}`} aria-hidden>
            {count}/{max}
          </span>
        )}
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-petal" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function WishForm({
  disabled,
  onPlanted,
}: {
  disabled: boolean;
  onPlanted: (wish: PublicWish, pending: boolean) => void;
}) {
  const uid = useId();
  const reduced = useReducedMotion();
  const startedAt = useRef<number | null>(null);
  const [values, setValues] = useState({ name: "", relationship: "", message: "", memory: "", website: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (field: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    if (field in errors) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || disabled) return;
    setFormError(null);

    const check = validateWish(values);
    if (!check.ok) {
      setErrors(check.errors);
      const first = (Object.keys(check.errors) as WishField[])[0];
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          elapsedMs: startedAt.current ? Date.now() - startedAt.current : 0,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        setFormError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setValues({ name: "", relationship: "", message: "", memory: "", website: "" });
      setErrors({});
      startedAt.current = null;
      onPlanted(data.wish, Boolean(data.pending));
    } catch {
      setFormError("We couldn't reach the garden. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const describedBy = (field: WishField) => (errors[field] ? `${uid}-${field}-error` : undefined);

  return (
    <form
      onSubmit={onSubmit}
      onFocus={() => {
        if (startedAt.current === null) startedAt.current = Date.now();
      }}
      noValidate
      className="space-y-5"
      aria-busy={submitting}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${uid}-name`} label="Your name" error={errors.name}>
          <input
            id={`${uid}-name`}
            name="name"
            autoComplete="name"
            maxLength={LIMITS.name + 10}
            value={values.name}
            onChange={set("name")}
            aria-invalid={!!errors.name}
            aria-describedby={describedBy("name")}
            className={`${inputBase} ${errors.name ? "border-rose" : "border-white/12"}`}
            placeholder="e.g. Aunt Maria"
            disabled={disabled}
          />
        </Field>
        <Field id={`${uid}-relationship`} label="How you know her" optional error={errors.relationship}>
          <input
            id={`${uid}-relationship`}
            name="relationship"
            maxLength={LIMITS.relationship + 10}
            value={values.relationship}
            onChange={set("relationship")}
            aria-invalid={!!errors.relationship}
            aria-describedby={describedBy("relationship")}
            className={`${inputBase} ${errors.relationship ? "border-rose" : "border-white/12"}`}
            placeholder="best friend, sister, colleague…"
            disabled={disabled}
          />
        </Field>
      </div>

      <Field
        id={`${uid}-message`}
        label="Your birthday wish"
        error={errors.message}
        count={values.message.length}
        max={LIMITS.message}
      >
        <textarea
          id={`${uid}-message`}
          name="message"
          rows={5}
          maxLength={LIMITS.message + 50}
          value={values.message}
          onChange={set("message")}
          aria-invalid={!!errors.message}
          aria-describedby={describedBy("message")}
          className={`${inputBase} resize-y leading-relaxed ${errors.message ? "border-rose" : "border-white/12"}`}
          placeholder="Write her something warm…"
          disabled={disabled}
        />
      </Field>

      <Field
        id={`${uid}-memory`}
        label="A small memory with her"
        optional
        error={errors.memory}
        count={values.memory.length}
        max={LIMITS.memory}
      >
        <textarea
          id={`${uid}-memory`}
          name="memory"
          rows={2}
          maxLength={LIMITS.memory + 30}
          value={values.memory}
          onChange={set("memory")}
          aria-invalid={!!errors.memory}
          aria-describedby={describedBy("memory")}
          className={`${inputBase} resize-y leading-relaxed ${errors.memory ? "border-rose" : "border-white/12"}`}
          placeholder="That time we…"
          disabled={disabled}
        />
      </Field>

      {/* Honeypot — hidden from people and screen readers; bots tend to fill it. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${uid}-website`}>Leave this empty</label>
        <input
          id={`${uid}-website`}
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={set("website")}
        />
      </div>

      {formError && (
        <p role="alert" className="rounded-2xl bg-rose/15 px-4 py-3 text-sm text-petal">
          {formError}
        </p>
      )}

      <motion.button
        type="submit"
        disabled={submitting || disabled}
        whileTap={reduced ? undefined : { scale: 0.97 }}
        className="btn-light w-full sm:w-auto"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Planting your wish…
          </>
        ) : (
          <>
            <Flower2 className="h-5 w-5" aria-hidden /> Plant this wish
          </>
        )}
      </motion.button>
    </form>
  );
}
