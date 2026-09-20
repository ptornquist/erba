import { describe, expect, it } from "vitest";
import {
  awardPoints,
  extraCluesFromVisible,
  gradeGuess,
  isSubjectCorrect,
  normalizeText,
} from "./grade";

describe("normalizeText", () => {
  it("folds case, trims, and strips combining marks", () => {
    expect(normalizeText("  Nadia Comăneci  ")).toBe("nadia comaneci");
    expect(normalizeText("Pelé")).toBe("pele");
    expect(normalizeText("Señor")).toBe("senor");
  });
});

describe("isSubjectCorrect", () => {
  it("matches the target or an alias after normalizeText", () => {
    expect(isSubjectCorrect("NADIA COMĂNECI", "Nadia Comăneci perfect 10", ["nadia comaneci"])).toBe(
      true,
    );
    expect(isSubjectCorrect("Brandi Chastain penalty", "Brandi Chastain penalty", [])).toBe(true);
  });

  it("rejects a different subject even if close", () => {
    expect(isSubjectCorrect("Miracle on Ice", "Nadia Comăneci perfect 10", ["nadia comaneci"])).toBe(
      false,
    );
  });
});

describe("awardPoints", () => {
  it("starts at 10 000 and deducts 2 000 per extra clue", () => {
    expect(awardPoints(true, 0)).toBe(10_000);
    expect(awardPoints(true, 1)).toBe(8_000);
    expect(awardPoints(true, 2)).toBe(6_000);
    expect(awardPoints(true, 4)).toBe(2_000);
  });

  it("never drops a correct file below 1 000", () => {
    expect(awardPoints(true, 5)).toBe(1_000);
    expect(awardPoints(true, 9)).toBe(1_000);
  });

  it("awards nothing unless both fields are correct", () => {
    expect(awardPoints(false, 0)).toBe(0);
  });
});

describe("gradeGuess", () => {
  const sheet = {
    targetYear: 1999,
    targetSubject: "Brandi Chastain penalty",
    acceptedAliases: ["brandi chastain", "women's world cup 1999"],
  };

  it("requires year and subject together", () => {
    const both = gradeGuess({
      guessedYear: 1999,
      guessedSubject: "Brandi Chastain penalty",
      extraClues: 0,
      ...sheet,
    });
    expect(both.isFullyCorrect).toBe(true);
    expect(both.pointsAwarded).toBe(10_000);
    expect(both.revealedAnswer).toBe("Brandi Chastain penalty");
    expect(both.revealedYear).toBe(1999);

    const yearOnly = gradeGuess({
      guessedYear: 1999,
      guessedSubject: "Miracle on Ice",
      extraClues: 0,
      ...sheet,
    });
    expect(yearOnly.isYearCorrect).toBe(true);
    expect(yearOnly.isSubjectCorrect).toBe(false);
    expect(yearOnly.isFullyCorrect).toBe(false);
    expect(yearOnly.pointsAwarded).toBe(0);
    expect(yearOnly.revealedAnswer).toBeNull();
    expect(yearOnly.revealedYear).toBeNull();
  });
});

describe("extraCluesFromVisible", () => {
  it("treats the first plate as free", () => {
    expect(extraCluesFromVisible(1)).toBe(0);
    expect(extraCluesFromVisible(3)).toBe(2);
  });
});
