"use client";

import Link from "next/link";
import * as React from "react";
import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { shareLine, type ScoreBreakdown } from "@/lib/scoring";
import { SPORT_LABEL, type Sport } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ScoreCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  breakdown: ScoreBreakdown;
  cluesRevealed: number;
  answer?: {
    title: string;
    year: number;
    summary: string;
    sport: Sport;
  };
  dateKey?: string;
  expeditionTitle?: string;
  nextHref?: string;
  nextLabel?: string;
}

export function ScoreCard({
  open,
  onOpenChange,
  breakdown,
  cluesRevealed,
  answer,
  dateKey,
  expeditionTitle,
  nextHref,
  nextLabel,
}: ScoreCardProps) {
  const [copied, setCopied] = React.useState(false);
  const line = shareLine({ dateKey, expeditionTitle, breakdown, cluesRevealed });

  async function copy() {
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={breakdown.solved ? (breakdown.perfect ? "Perfect brief" : "Filed.") : "Unsolved"}
        description={
          breakdown.solved
            ? "The archive accepts your identification."
            : answer
              ? "The file is closed. The plate is below — take another expedition, or come back tomorrow."
              : "The file is closed. The answer stays in the archive unless both year and subject are logged."
        }
        onClose={() => onOpenChange(false)}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {answer && (
            <div className="rounded-lg border border-gold/25 bg-ink p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-gold">
                {SPORT_LABEL[answer.sport]} · {answer.year}
              </p>
              <p className="mt-1 font-serif text-2xl leading-tight text-paper">{answer.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-paper/70">{answer.summary}</p>
            </div>
          )}

          <dl className="mt-5 grid grid-cols-2 gap-2 font-mono text-sm">
            <Row label="Opening balance" value={`+${breakdown.starting}`} />
            <Row label="Extra clues" value={`−${breakdown.clueCost}`} />
          </dl>

          <p className="mt-4 font-serif text-4xl tabular-nums text-gold">{breakdown.total} pts</p>
          {breakdown.solved && (
            <p className="text-sm text-paper/60">
              {breakdown.perfect
                ? "First clue, exact year and subject."
                : "Year and subject both logged."}
            </p>
          )}

          <pre className="mt-4 overflow-auto rounded-md border border-gold/20 bg-ink px-3 py-3 font-mono text-[11px] leading-relaxed text-amber">
            {line}
          </pre>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={copy}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Share"}
            </Button>
            {nextHref ? (
              <Link href={nextHref} className={cn(buttonVariants({ variant: "gold" }))}>
                {nextLabel ?? "Continue"}
              </Link>
            ) : (
              <Link href="/" className={cn(buttonVariants({ variant: "gold" }))}>
                Back to the desk
              </Link>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-gold/15 bg-ink/60 px-3 py-2">
      <dt className="text-[11px] uppercase tracking-[0.14em] text-amber/80">{label}</dt>
      <dd className="tabular-nums text-paper">{value}</dd>
    </div>
  );
}
