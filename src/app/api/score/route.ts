import { z } from "zod";
import {
  getDailyPuzzle,
  getPuzzle,
  eventDictionary,
} from "@/lib/catalog";
import { answersMatch, normalizeAnswer } from "@/lib/normalize";
import { MAX_CLUES, scoreAttempt } from "@/lib/scoring";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicSupabaseClient } from "@/lib/supabase/server";
import { utcDateKey } from "@/lib/utils";

const payloadSchema = z.object({
  puzzleId: z.string().min(1),
  mode: z.enum(["daily", "expedition"]),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  expeditionSlug: z.string().optional(),
  guessEvent: z.string().min(2).max(120),
  guessYear: z.number().int().min(1800).max(2035),
  cluesRevealed: z.number().int().min(1).max(MAX_CLUES),
  wrongEventGuesses: z.number().int().min(0).max(20),
  giveUp: z.boolean().optional(),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const body = parsed.data;
  const puzzle =
    body.mode === "daily"
      ? getDailyPuzzle(body.dateKey ?? utcDateKey())
      : getPuzzle(body.puzzleId);

  if (!puzzle || puzzle.id !== body.puzzleId) {
    return Response.json({ error: "Unknown puzzle" }, { status: 404 });
  }

  if (body.mode === "expedition" && body.expeditionSlug !== puzzle.expedition) {
    return Response.json({ error: "Puzzle is not in that expedition" }, { status: 400 });
  }

  const normalizedGuess = normalizeAnswer(body.guessEvent);
  const eventCorrect =
    normalizedGuess.length >= 3 && answersMatch(body.guessEvent, puzzle.answers);
  const giveUp = Boolean(body.giveUp) && !eventCorrect;
  const solved = eventCorrect && !giveUp;
  const breakdown = scoreAttempt({
    cluesRevealed: body.cluesRevealed,
    wrongEventGuesses: body.wrongEventGuesses,
    guessedYear: body.guessYear,
    actualYear: puzzle.year,
    eventCorrect: solved,
  });

  if ((solved || giveUp) && isSupabaseConfigured) {
    try {
      const supabase = createPublicSupabaseClient();
      await supabase.from("score_submissions").insert({
        puzzle_id: puzzle.id,
        mode: body.mode,
        date_key: body.mode === "daily" ? (body.dateKey ?? utcDateKey()) : null,
        expedition_slug: body.expeditionSlug ?? puzzle.expedition ?? null,
        clues_revealed: body.cluesRevealed,
        wrong_event_guesses: body.wrongEventGuesses,
        year_delta: breakdown.yearDelta,
        score: breakdown.total,
        solved: breakdown.solved,
        perfect: breakdown.perfect,
      });
    } catch {
      // Persistence is optional; never fail a valid round because the board is down.
    }
  }

  if (!solved && !giveUp) {
    return Response.json({
      correct: false,
      yearDelta: null,
      breakdown: null,
      nearest: nearestLabel(body.guessEvent),
    });
  }

  return Response.json({
    correct: solved,
    yearDelta: breakdown.yearDelta,
    breakdown,
    answer: {
      title: puzzle.title,
      year: puzzle.year,
      summary: puzzle.summary,
      sport: puzzle.sport,
    },
  });
}

function nearestLabel(guess: string): string | null {
  const hit = eventDictionary.find((option) => answersMatch(guess, [option.label]));
  return hit?.label ?? null;
}
