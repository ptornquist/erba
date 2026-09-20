export function normalizeEvent(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(the|a|an|of|at|in|vs|versus|fc|and|on|for)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
  const left = normalizeEvent(a);
  const right = normalizeEvent(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  const distance = levenshtein(left, right);
  return 1 - distance / Math.max(left.length, right.length);
}

export function eventMatches(guess: string, aliases: string[]): boolean {
  const needle = normalizeEvent(guess);
  if (needle.length < 3) return false;

  return aliases.some((alias) => {
    const haystack = normalizeEvent(alias);
    if (!haystack) return false;
    if (needle === haystack) return true;
    if (haystack.includes(needle) && needle.length >= 8) return true;
    if (needle.includes(haystack) && haystack.length >= 8) return true;
    return similarity(needle, haystack) >= 0.78;
  });
}

export function rankEventOptions<T extends { label: string }>(
  query: string,
  options: T[],
  limit = 8,
): T[] {
  const needle = normalizeEvent(query);
  if (needle.length < 2) return [];

  return options
    .map((option) => {
      const label = normalizeEvent(option.label);
      let score = similarity(needle, label);
      if (label.startsWith(needle)) score = Math.max(score, 0.92);
      else if (label.includes(needle)) score = Math.max(score, 0.8);
      return { option, score };
    })
    .filter((entry) => entry.score >= 0.35)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.option);
}
