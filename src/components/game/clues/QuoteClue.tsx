"use client";

import { motion } from "framer-motion";

interface QuoteClueProps {
  quote?: string;
  attribution?: string;
}

export function QuoteClue({ quote, attribution }: QuoteClueProps) {
  return (
    <div className="border-l-2 border-gold bg-ink px-6 py-8">
      <motion.blockquote
        className="font-serif text-2xl leading-snug italic text-paper sm:text-[1.75rem]"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        “{quote}”
      </motion.blockquote>
      {attribution && (
        <motion.p
          className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-gold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          — {attribution}
        </motion.p>
      )}
    </div>
  );
}
