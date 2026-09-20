import type { Metadata } from "next";
import { GameBoard } from "@/components/game/GameBoard";
import { eventDictionary, getDailyPuzzle } from "@/lib/catalog";
import { toPublicPuzzle } from "@/lib/types";
import { formatUtcDate, utcDateKey } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Daily Brief",
};

export default function DailyPage() {
  const dateKey = utcDateKey();
  const puzzle = toPublicPuzzle(getDailyPuzzle(dateKey));

  return (
    <div className="space-y-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper/50">
        {formatUtcDate(dateKey)} · UTC
      </p>
      <GameBoard
        puzzle={puzzle}
        events={eventDictionary}
        mode="daily"
        dateKey={dateKey}
        nextHref="/expeditions"
        nextLabel="Travel an expedition"
      />
    </div>
  );
}
