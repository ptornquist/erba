import { NextResponse } from "next/server";
import { gradeGuess } from "@/lib/grade";
import { loadAnswerSheet } from "@/lib/puzzle-answers";

export async function POST(req: Request) {
  try {
    const { puzzleId, guessedYear, guessedSubject, cluesRevealed } = await req.json();

    if (!puzzleId || guessedYear === undefined || !guessedSubject) {
      return NextResponse.json({ error: "Saknade fält i förfrågan" }, { status: 400 });
    }

    const puzzle = await loadAnswerSheet(String(puzzleId));

    if (!puzzle) {
      return NextResponse.json({ error: "Pusslet hittades inte" }, { status: 404 });
    }

    const extraClues = Math.max(0, Number(cluesRevealed) || 0);
    const result = gradeGuess({
      guessedYear,
      guessedSubject: String(guessedSubject),
      extraClues,
      targetYear: puzzle.target_year,
      targetSubject: puzzle.target_subject,
      acceptedAliases: puzzle.accepted_aliases ?? [],
    });

    return NextResponse.json({
      success: true,
      isFullyCorrect: result.isFullyCorrect,
      isYearCorrect: result.isYearCorrect,
      isSubjectCorrect: result.isSubjectCorrect,
      pointsAwarded: result.pointsAwarded,
      revealedAnswer: result.revealedAnswer,
      revealedYear: result.revealedYear,
    });
  } catch (err) {
    console.error("Valideringsfel:", err);
    return NextResponse.json({ error: "Internt serverfel" }, { status: 500 });
  }
}
