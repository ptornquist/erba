"use client";

import React, { useEffect, useState } from "react";
import { GameBoard } from "@/components/game/GameBoard";
import { Button } from "@/components/ui/button";
import type { EventOption, PublicPuzzle } from "@/lib/types";

interface PuzzlePayload {
  puzzle?: PublicPuzzle;
  events?: EventOption[];
  error?: string;
}

export default function PlayPage() {
  const [puzzle, setPuzzle] = useState<PublicPuzzle | null>(null);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [round, setRound] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadNewPuzzle = async () => {
    setLoading(true);
    setError(null);

    try {
      const exclude = puzzle?.id ? `?exclude=${encodeURIComponent(puzzle.id)}` : "";
      const res = await fetch(`/api/puzzle/random${exclude}`);
      const data = (await res.json()) as PuzzlePayload;
      if (data.puzzle) {
        setPuzzle(data.puzzle);
        setEvents(data.events ?? []);
        setRound((value) => value + 1);
      } else {
        setPuzzle(null);
        setError(data.error ?? "Kunde inte hitta några gåtor i databasen.");
      }
    } catch (err) {
      console.error("Fel vid laddning av gåta:", err);
      setPuzzle(null);
      setError("Kunde inte hitta några gåtor i databasen.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNewPuzzle();
    // First plate only — later rounds are loaded by Nästa historiska gåta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !puzzle) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="animate-pulse font-mono text-sm uppercase tracking-[0.18em] text-paper/50">
          Laddar historisk gåta...
        </p>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-paper/70">{error ?? "Kunde inte hitta några gåtor i databasen."}</p>
        <Button variant="gold" onClick={() => void loadNewPuzzle()}>
          Försök igen
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold">Play</p>
        <p className="max-w-xl text-sm text-paper/65">
          Identifiera händelsen och rätt årtal med så få ledtrådar som möjligt.
        </p>
      </header>

      <GameBoard
        key={`${puzzle.id}-${round}`}
        puzzle={puzzle}
        events={events}
        mode="play"
        nextLabel="Nästa historiska gåta"
        onNext={() => void loadNewPuzzle()}
      />
    </div>
  );
}
