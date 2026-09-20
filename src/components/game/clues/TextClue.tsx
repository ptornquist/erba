"use client";

import { motion } from "framer-motion";

interface TextClueProps {
  body?: string;
}

export function TextClue({ body }: TextClueProps) {
  return (
    <div className="border-t border-gold/15 bg-ink px-6 py-8">
      <motion.p
        className="font-serif text-2xl leading-snug text-paper sm:text-[1.7rem]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12, duration: 0.4 }}
      >
        {body}
      </motion.p>
    </div>
  );
}
