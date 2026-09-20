import { describe, expect, it } from "vitest";
import {
  MIN_SCORE,
  STARTING_SCORE,
  liveScorePreview,
  scoreAttempt,
  totalClueCost,
} from "./scoring";

describe("totalClueCost", () => {
  it("makes the first clue free", () => {
    expect(totalClueCost(1)).toBe(0);
  });

  it("charges 2 000 for each extra clue", () => {
    expect(totalClueCost(2)).toBe(2_000);
    expect(totalClueCost(3)).toBe(4_000);
    expect(totalClueCost(6)).toBe(10_000);
  });
});

describe("scoreAttempt", () => {
  it("awards 10 000 for a first-clue exact brief", () => {
    const result = scoreAttempt({
      cluesRevealed: 1,
      extraClues: 0,
      guessedYear: 1999,
      actualYear: 1999,
      eventCorrect: true,
    });
    expect(result.perfect).toBe(true);
    expect(result.solved).toBe(true);
    expect(result.total).toBe(STARTING_SCORE);
  });

  it("deducts only extra clues, not year distance or misses", () => {
    const result = scoreAttempt({
      cluesRevealed: 3,
      extraClues: 2,
      guessedYear: 2008,
      actualYear: 2005,
      eventCorrect: true,
      yearCorrect: true,
      wrongEventGuesses: 4,
    });
    expect(result.clueCost).toBe(4_000);
    expect(result.wrongGuessCost).toBe(0);
    expect(result.yearCost).toBe(0);
    expect(result.total).toBe(6_000);
  });

  it("floors a late correct file at 1 000", () => {
    const result = scoreAttempt({
      cluesRevealed: 6,
      extraClues: 5,
      guessedYear: 1980,
      actualYear: 1980,
      eventCorrect: true,
    });
    expect(result.total).toBe(MIN_SCORE);
  });

  it("scores an unsolved round at zero, even with the right year", () => {
    const result = scoreAttempt({
      cluesRevealed: 2,
      extraClues: 1,
      guessedYear: 1980,
      actualYear: 1980,
      eventCorrect: false,
    });
    expect(result.solved).toBe(false);
    expect(result.isYearCorrect).toBe(true);
    expect(result.total).toBe(0);
  });
});

describe("liveScorePreview", () => {
  it("shows remaining points before the guess is scored", () => {
    expect(liveScorePreview(1)).toBe(10_000);
    expect(liveScorePreview(2)).toBe(8_000);
    expect(liveScorePreview(6)).toBe(1_000);
  });
});
