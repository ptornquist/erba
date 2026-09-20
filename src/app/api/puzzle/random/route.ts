import { NextResponse } from "next/server";
import { eventDictionary, getPuzzle, getRandomPuzzle } from "@/lib/catalog";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { toPublicPuzzle } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const excludeId = new URL(request.url).searchParams.get("exclude") ?? undefined;

    if (supabaseAdmin) {
      const { data: rows, error } = await supabaseAdmin.from("puzzles").select("id").limit(50);

      if (!error && rows && rows.length > 0) {
        const ids = rows.map((row) => String(row.id)).filter((id) => id !== excludeId);
        const pick = ids[Math.floor(Math.random() * Math.max(ids.length, 1))] ?? String(rows[0].id);
        const fromCatalog = getPuzzle(pick);
        if (fromCatalog) {
          return NextResponse.json({
            puzzle: toPublicPuzzle(fromCatalog),
            events: eventDictionary,
          });
        }
      }
    }

    const puzzle = getRandomPuzzle(excludeId);
    return NextResponse.json({
      puzzle: toPublicPuzzle(puzzle),
      events: eventDictionary,
    });
  } catch (err) {
    console.error("Kunde inte hämta pussel:", err);
    return NextResponse.json({ error: "Serverfel vid hämtning" }, { status: 500 });
  }
}
