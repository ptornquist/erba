/**
 * Point deduction formulas for Sport History Clue.
 *
 * A round starts at STARTING_SCORE. Revealing extra clues, missing the event,
 * and missing the year all subtract. The result is clamped at 0.
 *
 * These helpers are safe to import from client components: they never contain
 * answers. The API route is still the authority because it supplies the true
 * year and whether the event matched.
 */

export const STARTING_SCORE = 1000;

/** Cost to reveal the clue at this 1-based index. Clue 1 is free. */
export const CLUE_REVEAL_COST = [0, 0, 80, 130, 180, 230, 280] as const;

export const WRONG_EVENT_PENALTY = 60;
export const YEAR_PENALTY_PER_YEAR = 6;
export const YEAR_PENALTY_CAP = 300;
export const PERFECT_BONUS = 150;

export const MAX_CLUES = 6;

export interface ScoreInput {
  cluesRevealed: number;
  wrongEventGuesses: number;
  guessedYear: number;
  actualYear: number;
  eventCorrect: boolean;
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
}

export function clampScore(value: number): number {
  return Math.max(0, Math.round(value));
}

export function costForClue(clueNumber: number): number {
  if (clueNumber < 1) return 0;
  if (clueNumber >= CLUE_REVEAL_COST.length) {
    return CLUE_REVEAL_COST[CLUE_REVEAL_COST.length - 1];
  }
  return CLUE_REVEAL_COST[clueNumber];
}

/** Total spent to have `cluesRevealed` clues visible. */
export function totalClueCost(cluesRevealed: number): number {
  const revealed = Math.min(Math.max(cluesRevealed, 1), MAX_CLUES);
  let total = 0;
  for (let clue = 1; clue <= revealed; clue += 1) {
    total += costForClue(clue);
  }
  return total;
}

export function yearPenalty(guessedYear: number, actualYear: number): number {
  const delta = Math.abs(guessedYear - actualYear);
  return Math.min(YEAR_PENALTY_CAP, delta * YEAR_PENALTY_PER_YEAR);
}

export function liveScorePreview(
  cluesRevealed: number,
  wrongEventGuesses: number,
): number {
  return clampScore(
    STARTING_SCORE -
      totalClueCost(cluesRevealed) -
      wrongEventGuesses * WRONG_EVENT_PENALTY,
  );
}

export function scoreAttempt(input: ScoreInput): ScoreBreakdown {
  const cluesRevealed = Math.min(Math.max(input.cluesRevealed, 1), MAX_CLUES);
  const wrongEventGuesses = Math.max(0, input.wrongEventGuesses);
  const yearDelta = Math.abs(input.guessedYear - input.actualYear);
  const clueCost = totalClueCost(cluesRevealed);
  const wrongGuessCost = wrongEventGuesses * WRONG_EVENT_PENALTY;
  const yearCost = input.eventCorrect
    ? yearPenalty(input.guessedYear, input.actualYear)
    : YEAR_PENALTY_CAP;
  const perfect =
    input.eventCorrect &&
    yearDelta === 0 &&
    cluesRevealed === 1 &&
    wrongEventGuesses === 0;
  const bonus = perfect ? PERFECT_BONUS : 0;
  const solved = input.eventCorrect;
  const total = solved
    ? clampScore(STARTING_SCORE - clueCost - wrongGuessCost - yearCost + bonus)
    : 0;

  return {
    starting: STARTING_SCORE,
    clueCost,
    wrongGuessCost,
    yearCost,
    bonus,
    total,
    yearDelta,
    perfect,
    solved,
  };
}

export function shareLine(params: {
  dateKey?: string;
  expeditionTitle?: string;
  breakdown: ScoreBreakdown;
  cluesRevealed: number;
}): string {
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
  return `${heading}\n${pips}  ${params.breakdown.total} pts · ${params.breakdown.yearDelta === 0 ? "exact year" : `${params.breakdown.yearDelta}y off`}${perfect}\nsporthistoryclue.com`;
}
