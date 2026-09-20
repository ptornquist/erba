import { answersMatch, normalizeAnswer, similarity } from "@/lib/normalize";

export { normalizeAnswer as normalizeEvent, similarity, answersMatch as eventMatches };

export function rankEventOptions<T extends { label: string }>(
  query: string,
  options: T[],
  limit = 8,
): T[] {
  const needle = normalizeAnswer(query);
  if (needle.length < 2) return [];

  return options
    .map((option) => {
      const label = normalizeAnswer(option.label);
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
