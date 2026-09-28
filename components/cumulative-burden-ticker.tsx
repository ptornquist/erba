"use client";

import { useEffect, useState } from "react";
import { PLACEHOLDER_CUMULATIVE_BURDEN_EUR } from "@/lib/visualization-placeholders";

const COMPACT = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  maximumFractionDigits: 1,
});

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/**
 * Homepage momentum ticker. Pass `totalEur` from a live SUM query when ready;
 * until then it animates the isolated placeholder (€4.2B).
 */
export function CumulativeBurdenTicker({
  totalEur,
}: {
  totalEur?: number;
}) {
  const target = totalEur ?? PLACEHOLDER_CUMULATIVE_BURDEN_EUR;
  const isPlaceholder = totalEur === undefined;
  const [value, setValue] = useState(0);

  useEffect(() => {
    const durationMs = 1800;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      setValue(target * easeOutCubic(progress));
      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [target]);

  return (
    <section
      aria-label="Cumulative burden ticker"
      className="relative overflow-hidden border-y border-primary/40 bg-primary text-primary-foreground"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.14),transparent_55%)]"
      />
      <div className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/80">
          Cumulative burden ticker
        </p>
        <p
          className="mt-5 font-mono text-6xl font-black tabular-nums leading-none tracking-tighter whitespace-nowrap sm:text-7xl md:text-8xl"
          aria-live="polite"
        >
          {COMPACT.format(value)}
        </p>
        <p className="mx-auto mt-5 max-w-2xl text-base text-white/85 sm:text-lg">
          Documented regulatory cost across Self-Reported, Evidence Supplied,
          and Independently Verified figures.
        </p>
        {isPlaceholder && (
          <p className="mt-4 text-xs font-medium uppercase tracking-widest text-white/65">
            Placeholder pending live aggregation
          </p>
        )}
      </div>
    </section>
  );
}
