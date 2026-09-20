"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import type { RedactedStat } from "@/lib/types";

interface StatsClueProps {
  stats: RedactedStat[];
  cluesRevealed: number;
}

export function StatsClue({ stats, cluesRevealed }: StatsClueProps) {
  return (
    <div className="bg-ink px-5 py-6">
      <p className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
        <Search className="size-3.5" /> Redacted box score
      </p>
      <dl className="grid gap-3 sm:grid-cols-2">
        {stats.map((stat) => {
          const visible = cluesRevealed >= stat.revealedAtClue;
          return (
            <div
              key={stat.label}
              className="rounded-lg border border-gold/20 bg-card px-4 py-3"
            >
              <dt className="text-[11px] uppercase tracking-[0.16em] text-amber/80">
                {stat.label}
              </dt>
              <dd className="mt-1 font-serif text-xl text-paper">
                <AnimatePresence mode="wait">
                  {visible ? (
                    <motion.span
                      key="value"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-block"
                    >
                      {stat.value}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="redacted"
                      className="inline-block h-6 w-28 rounded-sm bg-gold/25 align-middle"
                      title="Redacted until a later clue"
                      layout
                    />
                  )}
                </AnimatePresence>
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
