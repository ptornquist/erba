/**
 * Server-side answer normalization.
 *
 * Guesses are compared only after accents are stripped and case is folded.
 * Keep this module as the single source of truth for API validation.
 */

export function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

export function normalizeAnswer(value: string): string {
  return stripAccents(
    value
      .trim()
      .toLowerCase()
      .replace(/ß/g, "ss")
      .replace(/æ/g, "ae")
      .replace(/œ/g, "oe")
      .replace(/ø/g, "o")
      .replace(/ł/g, "l")
      .replace(/đ/g, "d"),
  )
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(the|a|an|of|at|in|vs|versus|fc|and|on|for)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function answerTokens(value: string): string[] {
  return normalizeAnswer(value).split(" ").filter(Boolean);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + cost);
      previous = current;
    }
  }
  return row[b.length];
}

export function similarity(a: string, b: string): number {
  const left = normalizeAnswer(a);
  const right = normalizeAnswer(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  const distance = levenshtein(left, right);
  return 1 - distance / Math.max(left.length, right.length);
}

export function answersMatch(guess: string, aliases: string[]): boolean {
  const needle = normalizeAnswer(guess);
  if (needle.length < 3) return false;
  const guessTokens = answerTokens(guess);

  return aliases.some((alias) => {
    const haystack = normalizeAnswer(alias);
    if (!haystack) return false;
    if (needle === haystack) return true;

    const aliasTokens = answerTokens(alias);
    const aliasSet = new Set(aliasTokens);

    if (guessTokens.length >= 2 && guessTokens.every((token) => aliasSet.has(token))) {
      return true;
    }

    if (
      guessTokens.length === 1 &&
      guessTokens[0].length >= 4 &&
      aliasTokens[0] === guessTokens[0]
    ) {
      return true;
    }

    if (haystack.includes(needle) && needle.length >= 8) return true;
    if (needle.includes(haystack) && haystack.length >= 8) return true;
    return similarity(needle, haystack) >= 0.78;
  });
}
