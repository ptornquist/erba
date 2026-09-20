import { z } from "zod";
import { getPuzzle } from "@/lib/catalog";
import { extraCluesFromVisible, gradeGuess } from "@/lib/grade";
import { loadAnswerSheet } from "@/lib/puzzle-answers";
import { MAX_CLUES, scoreAttempt } from "@/lib/scoring";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicSupabaseClient } from "@/lib/supabase/server";
import { utcDateKey } from "@/lib/utils";

const payloadSchema = z
  .object({
    puzzleId: z.string().min(1),
    mode: z.enum(["daily", "expedition", "play"]).optional(),
    dateKey: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    expeditionSlug: z.string().optional(),
    guessedSubject: z.string().min(1).max(120).optional(),
    guessEvent: z.string().min(1).max(120).optional(),
    guessedYear: z.number().int().optional(),
    guessYear: z.number().int().optional(),
    cluesRevealed: z.number().int().min(0).max(MAX_CLUES).optional(),
    giveUp: z.boolean().optional(),
  })
  .refine((body) => Boolean(body.guessedSubject ?? body.guessEvent) || body.giveUp, {
    message: "missing subject",
  })
  .refine((body) => body.guessedYear !== undefined || body.guessYear !== undefined || body.giveUp, {
    message: "missing year",
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
    return Response.json({ error: "Missing fields in request" }, { status: 400 });
  }

  const body = parsed.data;
  const guessedSubject = (body.guessedSubject ?? body.guessEvent ?? "").trim();
  const guessedYear = body.guessedYear ?? body.guessYear ?? 0;
  const extraClues = body.cluesRevealed ?? 0;

  const catalogPuzzle = getPuzzle(body.puzzleId);
  if (body.mode === "expedition" && catalogPuzzle && body.expeditionSlug !== catalogPuzzle.expedition) {
    return Response.json({ error: "Puzzle is not in that expedition" }, { status: 400 });
  }

  const sheet = await loadAnswerSheet(body.puzzleId);
  if (!sheet) {
    return Response.json({ error: "Puzzle not found" }, { status: 404 });
  }

  if (body.giveUp) {
    return Response.json({
      success: true,
      isFullyCorrect: false,
      isYearCorrect: false,
      isSubjectCorrect: false,
      pointsAwarded: 0,
      revealedAnswer: null,
      revealedYear: null,
      correct: false,
      breakdown: scoreAttempt({
        cluesRevealed: extraClues + 1,
        extraClues,
        guessedYear: 0,
        actualYear: 0,
        eventCorrect: false,
        yearCorrect: false,
      }),
    });
  }

  const result = gradeGuess({
    guessedYear,
    guessedSubject,
    extraClues,
    targetYear: sheet.target_year,
    targetSubject: sheet.target_subject,
    acceptedAliases: sheet.accepted_aliases ?? [],
  });

  const breakdown = scoreAttempt({
    cluesRevealed: extraClues + 1,
    extraClues,
    guessedYear,
    actualYear: sheet.target_year,
    eventCorrect: result.isSubjectCorrect,
    yearCorrect: result.isYearCorrect,
  });

  if (result.isFullyCorrect && isSupabaseConfigured && body.mode !== "play") {
    try {
      const supabase = createPublicSupabaseClient();
      await supabase.from("score_submissions").insert({
        puzzle_id: body.puzzleId,
        mode: body.mode ?? "daily",
        date_key: body.mode === "daily" ? (body.dateKey ?? utcDateKey()) : null,
        expedition_slug: body.expeditionSlug ?? catalogPuzzle?.expedition ?? null,
        clues_revealed: extraCluesFromVisible(extraClues + 1),
        wrong_event_guesses: 0,
        year_delta: 0,
        score: result.pointsAwarded,
        solved: true,
        perfect: extraClues === 0,
      });
    } catch {
      // Persistence is optional; never fail a valid round because the board is down.
    }
  }

  return Response.json({
    success: true,
    isFullyCorrect: result.isFullyCorrect,
    isYearCorrect: result.isYearCorrect,
    isSubjectCorrect: result.isSubjectCorrect,
    pointsAwarded: result.pointsAwarded,
    revealedAnswer: result.revealedAnswer,
    revealedYear: result.revealedYear,
    correct: result.isFullyCorrect,
    breakdown: result.isFullyCorrect ? breakdown : null,
    answer: result.isFullyCorrect
      ? {
          title: catalogPuzzle?.title ?? sheet.target_subject,
          year: sheet.target_year,
          summary: catalogPuzzle?.summary ?? "",
          sport: catalogPuzzle?.sport ?? "olympics",
        }
      : null,
  });
}
