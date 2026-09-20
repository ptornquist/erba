/**
 * Point formula for Sport History Clue.
 *
 * A round starts at 10 000. The first clue is free. Each extra clue costs
 * 2 000. A fully correct year + subject scores at least 1 000; anything
 * else scores 0. Year distance and wrong-name misses do not deduct.
 *
 * These helpers are safe to import from client components: they never contain
 * answers. The API route is still the authority because it supplies whether
 * both fields matched.
 */

import {
  MIN_SCORE,
  PENALTY_PER_CLUE,
  STARTING_SCORE,
  awardPoints,
  extraCluesFromVisible,
} from "@/lib/grade";

export { MIN_SCORE, PENALTY_PER_CLUE, STARTING_SCORE };

export const MAX_CLUES = 6;

export interface ScoreInput {
  cluesRevealed: number;
  extraClues?: number;
  guessedYear: number;
  actualYear: number;
  eventCorrect: boolean;
  yearCorrect?: boolean;
  wrongEventGuesses?: number;
}

export interface ScoreBreakdown {
  starting: number;
  clueCost: number;
  wrongGuessCost: number;
  yearCost: number;
  bonus: number;
  total: number;
  yearDelta: number;
  perfect: boolean;
  solved: boolean;
  isYearCorrect: boolean;
  isSubjectCorrect: boolean;
}

export function costForClue(clueNumber: number): number {
  return clueNumber <= 1 ? 0 : PENALTY_PER_CLUE;
}

/** Total spent to have `cluesRevealed` clues visible (1-based). */
export function totalClueCost(cluesRevealed: number): number {
  return extraCluesFromVisible(cluesRevealed) * PENALTY_PER_CLUE;
}

export function liveScorePreview(cluesRevealed: number): number {
  return Math.max(STARTING_SCORE - totalClueCost(cluesRevealed), MIN_SCORE);
}

export function scoreAttempt(input: ScoreInput): ScoreBreakdown {
  const extra =
    input.extraClues ?? extraCluesFromVisible(Math.min(Math.max(input.cluesRevealed, 1), MAX_CLUES));
  const isYearCorrect = input.yearCorrect ?? input.guessedYear === input.actualYear;
  const isSubjectCorrect = input.eventCorrect;
  const solved = isYearCorrect && isSubjectCorrect;
  const clueCost = extra * PENALTY_PER_CLUE;
  const yearDelta = Math.abs(input.guessedYear - input.actualYear);
  const perfect = solved && extra === 0;

  return {
    starting: STARTING_SCORE,
    clueCost,
    wrongGuessCost: 0,
    yearCost: 0,
    bonus: 0,
    total: awardPoints(solved, extra),
    yearDelta,
    perfect,
    solved,
    isYearCorrect,
    isSubjectCorrect,
  };
}

export function shareLine(params: {
  dateKey?: string;
  expeditionTitle?: string;
  breakdown: ScoreBreakdown;
  cluesRevealed: number;
}): string {
  const extra = extraCluesFromVisible(params.cluesRevealed);
  const pips = Array.from({ length: MAX_CLUES }, (_, index) =>
    index < params.cluesRevealed ? "■" : "□",
  ).join("");
  const heading = params.dateKey
    ? `Sport History Clue ${params.dateKey}`
    : `Sport History Clue — ${params.expeditionTitle ?? "Expedition"}`;
  if (!params.breakdown.solved) {
    return `${heading}\n${pips}  did not archive\nsporthistoryclue.com`;
  }
  const perfect = params.breakdown.perfect ? "  perfect brief" : "";
  const clueNote = extra === 0 ? "first clue" : `${extra} extra clue${extra === 1 ? "" : "s"}`;
  return `${heading}\n${pips}  ${params.breakdown.total} pts · ${clueNote}${perfect}\nsporthistoryclue.com`;
}
