export const STORAGE_KEYS = {
  streak: "shc.streak",
  lastDaily: "shc.lastDaily",
  dailyResult: "shc.dailyResult",
  expeditions: "shc.expeditions",
} as const;

export interface DailyRecord {
  dateKey: string;
  puzzleId: string;
  score: number;
  solved: boolean;
  cluesRevealed: number;
}

export interface StreakState {
  count: number;
  lastDateKey: string | null;
}

export function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function previousUtcDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const previous = new Date(Date.UTC(year, month - 1, day - 1));
  return previous.toISOString().slice(0, 10);
}

export function recordDailyResult(record: DailyRecord): StreakState {
  saveJson(STORAGE_KEYS.dailyResult, record);
  saveJson(STORAGE_KEYS.lastDaily, record.dateKey);

  const streak = loadJson<StreakState>(STORAGE_KEYS.streak, {
    count: 0,
    lastDateKey: null,
  });

  if (!record.solved) {
    return streak;
  }

  let count = 1;
  if (streak.lastDateKey === previousUtcDateKey(record.dateKey)) {
    count = streak.count + 1;
  } else if (streak.lastDateKey === record.dateKey) {
    count = streak.count;
  }

  const next = { count, lastDateKey: record.dateKey };
  saveJson(STORAGE_KEYS.streak, next);
  return next;
}

export function markExpeditionSolved(slug: string, puzzleId: string) {
  const progress = loadJson<Record<string, string[]>>(STORAGE_KEYS.expeditions, {});
  const solved = new Set(progress[slug] ?? []);
  solved.add(puzzleId);
  progress[slug] = [...solved];
  saveJson(STORAGE_KEYS.expeditions, progress);
  return progress[slug];
}
