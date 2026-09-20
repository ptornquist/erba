import { getDailyPuzzle } from "@/lib/catalog";
import { toPublicPuzzle } from "@/lib/types";
import { utcDateKey } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const dateKey = utcDateKey();
  const puzzle = getDailyPuzzle(dateKey);
  return Response.json({
    dateKey,
    puzzle: toPublicPuzzle(puzzle),
  });
}
