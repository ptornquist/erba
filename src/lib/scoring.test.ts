import { describe, expect, it } from "vitest";
import {
  PERFECT_BONUS,
  STARTING_SCORE,
  YEAR_PENALTY_CAP,
  liveScorePreview,
  scoreAttempt,
  totalClueCost,
  yearPenalty,
} from "./scoring";

describe("totalClueCost", () => {
  it("makes the first clue free", () => {
    expect(totalClueCost(1)).toBe(0);
  });

  it("charges rising costs for later clues", () => {
    expect(totalClueCost(2)).toBe(80);
    expect(totalClueCost(3)).toBe(210);
    expect(totalClueCost(6)).toBe(900);
  });
});

describe("yearPenalty", () => {
  it("is zero on an exact year", () => {
    expect(yearPenalty(1980, 1980)).toBe(0);
  });

  it("charges 6 points per year of distance", () => {
    expect(yearPenalty(1982, 1980)).toBe(12);
  });

  it("caps a wild year guess", () => {
    expect(yearPenalty(1900, 2022)).toBe(YEAR_PENALTY_CAP);
  });
});

describe("scoreAttempt", () => {
  it("awards a first-clue exact brief the perfect bonus", () => {
    const result = scoreAttempt({
      cluesRevealed: 1,
      wrongEventGuesses: 0,
      guessedYear: 1999,
      actualYear: 1999,
      eventCorrect: true,
    });
    expect(result.perfect).toBe(true);
    expect(result.total).toBe(STARTING_SCORE + PERFECT_BONUS);
  });

  it("deducts clues, misses, and year distance", () => {
    const result = scoreAttempt({
      cluesRevealed: 3,
      wrongEventGuesses: 2,
      guessedYear: 2008,
      actualYear: 2005,
      eventCorrect: true,
    });
    expect(result.clueCost).toBe(210);
    expect(result.wrongGuessCost).toBe(120);
    expect(result.yearCost).toBe(18);
    expect(result.total).toBe(652);
  });

  it("scores an unsolved round at zero", () => {
    const result = scoreAttempt({
      cluesRevealed: 6,
      wrongEventGuesses: 4,
      guessedYear: 1970,
      actualYear: 1980,
      eventCorrect: false,
    });
    expect(result.solved).toBe(false);
    expect(result.total).toBe(0);
    expect(result.yearCost).toBe(YEAR_PENALTY_CAP);
  });
});

describe("liveScorePreview", () => {
  it("shows remaining points before the year is scored", () => {
    expect(liveScorePreview(2, 1)).toBe(860);
  });
});
