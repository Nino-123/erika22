import type { CSSProperties } from "react";

type Blob = {
  color: string;
  top: string;
  left: string;
  size: string;
  dx?: string;
  dy?: string;
  duration?: number;
};

/**
 * Soft, out-of-focus colour fields — the "blurred flowers through a lens"
 * feeling from the reference photography, built from radial gradients so it
 * costs almost nothing to render.
 */
export function DreamyBackdrop({ blobs, className = "" }: { blobs: Blob[]; className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {blobs.map((b, i) => (
        <span
          key={i}
          className="blob"
          style={
            {
              top: b.top,
              left: b.left,
              width: b.size,
              height: b.size,
              background: `radial-gradient(circle at 50% 50%, ${b.color} 0%, transparent 68%)`,
              animation: `drift ${b.duration ?? 18}s ease-in-out ${-i * 3}s infinite`,
              "--dx": b.dx ?? "30px",
              "--dy": b.dy ?? "-24px",
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
