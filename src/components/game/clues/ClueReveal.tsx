"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface ClueRevealProps {
  clueNumber: number;
  children: ReactNode;
}

const ease = [0.22, 1, 0.36, 1] as const;

export function ClueReveal({ clueNumber, children }: ClueRevealProps) {
  const reduce = useReducedMotion();
  const enter = reduce ? false : { opacity: 0, y: 28, filter: "blur(8px)" };

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={clueNumber}
          initial={enter}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -18, filter: "blur(8px)" }}
          transition={{ duration: reduce ? 0.12 : 0.42, ease }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
