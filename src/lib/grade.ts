/**
 * Exact subject matching and the 10 000-point formula.
 *
 * Scoring guesses compare year numerically and the subject after a light
 * accent-stripping normalize. Autocomplete may still be fuzzy; this module
 * is the authority for awarding points.
 */

export const STARTING_SCORE = 10_000;
export const PENALTY_PER_CLUE = 2_000;
export const MIN_SCORE = 1_000;

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function isYearCorrect(guessedYear: unknown, targetYear: number): boolean {
  return Number(guessedYear) === targetYear;
}

export function isSubjectCorrect(
  guessedSubject: string,
  targetSubject: string,
  acceptedAliases: string[] = [],
): boolean {
  const normalizedGuess = normalizeText(guessedSubject);
  if (!normalizedGuess) return false;
  const validAnswers = [targetSubject, ...acceptedAliases].map(normalizeText);
  return validAnswers.some((ans) => ans === normalizedGuess);
}

/** Extra clues beyond the first free plate (0, 1, 2, …). */
export function extraCluesFromVisible(visibleClues: number): number {
  return Math.max(0, visibleClues - 1);
}

export function awardPoints(fullyCorrect: boolean, extraClues: number): number {
  if (!fullyCorrect) return 0;
  return Math.max(STARTING_SCORE - Math.max(0, extraClues) * PENALTY_PER_CLUE, MIN_SCORE);
}

export interface GradeInput {
  guessedYear: unknown;
  guessedSubject: string;
  extraClues: number;
  targetYear: number;
  targetSubject: string;
  acceptedAliases: string[];
}

export interface GradeResult {
  isYearCorrect: boolean;
  isSubjectCorrect: boolean;
  isFullyCorrect: boolean;
  pointsAwarded: number;
  revealedAnswer: string | null;
  revealedYear: number | null;
}

export function gradeGuess(input: GradeInput): GradeResult {
  const yearOk = isYearCorrect(input.guessedYear, input.targetYear);
  const subjectOk = isSubjectCorrect(
    input.guessedSubject,
    input.targetSubject,
    input.acceptedAliases,
  );
  const isFullyCorrect = yearOk && subjectOk;
  return {
    isYearCorrect: yearOk,
    isSubjectCorrect: subjectOk,
    isFullyCorrect,
    pointsAwarded: awardPoints(isFullyCorrect, input.extraClues),
    revealedAnswer: isFullyCorrect ? input.targetSubject : null,
    revealedYear: isFullyCorrect ? input.targetYear : null,
  };
}
