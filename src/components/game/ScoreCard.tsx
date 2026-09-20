"use client";

import Link from "next/link";
import * as React from "react";
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
            : "The file is closed. The plate is below — take another expedition, or come back tomorrow."
        }
        onClose={() => onOpenChange(false)}
      >
        {answer && (
          <div className="rounded-lg border border-ink/10 bg-white/50 p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/50">
              {SPORT_LABEL[answer.sport]} · {answer.year}
            </p>
            <p className="mt-1 font-serif text-2xl leading-tight">{answer.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">{answer.summary}</p>
          </div>
        )}

        <dl className="mt-5 grid grid-cols-2 gap-2 font-mono text-sm">
          <Row label="Opening balance" value={`+${breakdown.starting}`} />
          <Row label="Clues" value={`−${breakdown.clueCost}`} />
          <Row label="Misses" value={`−${breakdown.wrongGuessCost}`} />
          <Row label="Year" value={`−${breakdown.yearCost}`} />
          {breakdown.bonus > 0 && <Row label="Perfect bonus" value={`+${breakdown.bonus}`} />}
        </dl>

        <p className="mt-4 font-serif text-4xl tabular-nums">{breakdown.total} pts</p>
        {breakdown.solved && (
          <p className="text-sm text-ink/60">
            {breakdown.yearDelta === 0
              ? "Exact year."
              : `${breakdown.yearDelta} year${breakdown.yearDelta === 1 ? "" : "s"} off.`}
          </p>
        )}

        <pre className="mt-4 overflow-auto rounded-md bg-ink px-3 py-3 font-mono text-[11px] leading-relaxed text-paper">
          {line}
        </pre>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" className="border-ink/20 text-ink hover:bg-ink/5" onClick={copy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Share"}
          </Button>
          {nextHref ? (
            <Link href={nextHref} className={cn(buttonVariants())}>
              {nextLabel ?? "Continue"}
            </Link>
          ) : (
            <Link href="/" className={cn(buttonVariants())}>
              Back to the desk
            </Link>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-ink/5 px-3 py-2">
      <dt className="text-[11px] uppercase tracking-[0.14em] text-ink/50">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
