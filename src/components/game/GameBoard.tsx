"use client";

import * as React from "react";
import { ClueCard } from "@/components/game/ClueCard";
import { InputBar } from "@/components/game/InputBar";
import { ScoreCard } from "@/components/game/ScoreCard";
import { Badge } from "@/components/ui/badge";
import { markExpeditionSolved, recordDailyResult } from "@/lib/progress";
import {
  MAX_CLUES,
  liveScorePreview,
  type ScoreBreakdown,
} from "@/lib/scoring";
import type { EventOption, PublicPuzzle, Sport } from "@/lib/types";

interface GameBoardProps {
  puzzle: PublicPuzzle;
  events: EventOption[];
  mode: "daily" | "expedition";
  dateKey?: string;
  expeditionSlug?: string;
  expeditionTitle?: string;
  nextHref?: string;
  nextLabel?: string;
}

interface Answer {
  title: string;
  year: number;
  summary: string;
  sport: Sport;
}

interface ScoreResponse {
  correct: boolean;
  yearDelta: number | null;
  breakdown: ScoreBreakdown | null;
  nearest?: string | null;
  answer?: Answer;
  error?: string;
}

export function GameBoard({
  puzzle,
  events,
  mode,
  dateKey,
  expeditionSlug,
  expeditionTitle,
  nextHref,
  nextLabel,
}: GameBoardProps) {
  const [cluesRevealed, setCluesRevealed] = React.useState(1);
  const [viewingClue, setViewingClue] = React.useState(1);
  const [wrongEventGuesses, setWrongEventGuesses] = React.useState(0);
  const [pending, setPending] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ScoreBreakdown | null>(null);
  const [answer, setAnswer] = React.useState<Answer | undefined>();
  const [scoreOpen, setScoreOpen] = React.useState(false);

  const finished = result !== null;
  const live = liveScorePreview(cluesRevealed, wrongEventGuesses);
  const clue = puzzle.clues[viewingClue - 1];

  async function postScore(body: Record<string, unknown>): Promise<ScoreResponse> {
    const response = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await response.json()) as ScoreResponse;
  }

  function persist(breakdown: ScoreBreakdown) {
    if (mode === "daily" && dateKey) {
      recordDailyResult({
        dateKey,
        puzzleId: puzzle.id,
        score: breakdown.total,
        solved: breakdown.solved,
        cluesRevealed,
      });
    }
    if (mode === "expedition" && expeditionSlug && breakdown.solved) {
      markExpeditionSolved(expeditionSlug, puzzle.id);
    }
  }

  async function onGuess(event: string, year: number) {
    if (finished || pending) return;
    setPending(true);
    setNotice(null);
    try {
      const data = await postScore({
        puzzleId: puzzle.id,
        mode,
        dateKey,
        expeditionSlug,
        guessEvent: event,
        guessYear: year,
        cluesRevealed,
        wrongEventGuesses,
      });
      if (data.error) {
        setNotice(data.error);
        return;
      }
      if (!data.correct) {
        const nextWrong = wrongEventGuesses + 1;
        setWrongEventGuesses(nextWrong);
        setNotice(
          data.nearest
            ? `Not the plate. “${data.nearest}” is in the dictionary — try a closer reading.`
            : "Not the plate. Reveal another clue or try a different name.",
        );
        return;
      }
      if (data.breakdown && data.answer) {
        setResult(data.breakdown);
        setAnswer(data.answer);
        setScoreOpen(true);
        persist(data.breakdown);
      }
    } catch {
      setNotice("The archive desk is busy. Try the guess again.");
    } finally {
      setPending(false);
    }
  }

  async function onGiveUp() {
    if (finished || pending) return;
    setPending(true);
    try {
      const data = await postScore({
        puzzleId: puzzle.id,
        mode,
        dateKey,
        expeditionSlug,
        guessEvent: "closed file",
        guessYear: 1900,
        cluesRevealed,
        wrongEventGuesses,
        giveUp: true,
      });
      if (data.breakdown && data.answer) {
        setResult(data.breakdown);
        setAnswer(data.answer);
        setScoreOpen(true);
        persist(data.breakdown);
      }
    } finally {
      setPending(false);
    }
  }

  function onReveal() {
    if (finished || cluesRevealed >= MAX_CLUES) return;
    const next = cluesRevealed + 1;
    setCluesRevealed(next);
    setViewingClue(next);
    setNotice(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold">
            {mode === "daily" ? "Daily brief" : expeditionTitle}
          </p>
          <h1 className="font-serif text-3xl text-paper sm:text-4xl">Identify the plate</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="paper">{puzzle.era.replace("-", " ")}</Badge>
          <div className="rounded-md border border-gold/30 bg-ink px-3 py-2 text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/50">
              Running score
            </p>
            <p className="font-serif text-2xl tabular-nums text-gold">{live}</p>
          </div>
        </div>
      </div>

      {clue && (
        <ClueCard
          clue={clue}
          clueNumber={viewingClue}
          cluesRevealed={cluesRevealed}
          onSelectClue={setViewingClue}
        />
      )}

      {notice && (
        <p
          role="status"
          className="rounded-md border border-crimson/40 bg-crimson/15 px-4 py-3 text-sm text-paper"
        >
          {notice}
        </p>
      )}

      <InputBar
        events={events}
        cluesRevealed={cluesRevealed}
        canRevealMore={cluesRevealed < MAX_CLUES && !finished}
        disabled={finished}
        pending={pending}
        onGuess={onGuess}
        onReveal={onReveal}
        onGiveUp={onGiveUp}
      />

      {result && (
        <ScoreCard
          open={scoreOpen}
          onOpenChange={setScoreOpen}
          breakdown={result}
          cluesRevealed={cluesRevealed}
          answer={answer}
          dateKey={dateKey}
          expeditionTitle={expeditionTitle}
          nextHref={nextHref}
          nextLabel={nextLabel}
        />
      )}
    </div>
  );
}
