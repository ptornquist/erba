"use client";

import Link from "next/link";
import { GameBoard } from "@/components/game/GameBoard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { EventOption, Expedition, PublicPuzzle } from "@/lib/types";

interface ExpeditionDeskProps {
  expedition: Expedition;
  puzzles: PublicPuzzle[];
  current: PublicPuzzle;
  currentIndex: number;
  events: EventOption[];
  nextHref: string;
  nextLabel: string;
}

export function ExpeditionDesk({
  expedition,
  puzzles,
  current,
  currentIndex,
  events,
  nextHref,
  nextLabel,
}: ExpeditionDeskProps) {
  const percent = ((currentIndex + 1) / puzzles.length) * 100;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gold/20 bg-card p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Badge variant="gold">{expedition.period}</Badge>
            <h1 className="mt-2 font-serif text-3xl text-paper">{expedition.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-paper/65">{expedition.blurb}</p>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper/50">
            Plate {currentIndex + 1} / {puzzles.length}
          </p>
        </div>
        <Progress className="mt-4" value={percent} />
        <ol className="mt-4 flex flex-wrap gap-2">
          {puzzles.map((puzzle, index) => (
            <li key={puzzle.id}>
              <Link
                href={`/expeditions/${expedition.slug}?plate=${puzzle.id}`}
                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 font-mono text-xs ${
                  puzzle.id === current.id
                    ? "bg-gold text-ink"
                    : "bg-paper/10 text-paper/80 hover:bg-paper/20"
                }`}
              >
                {index + 1}
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <GameBoard
        key={current.id}
        puzzle={current}
        events={events}
        mode="expedition"
        expeditionSlug={expedition.slug}
        expeditionTitle={expedition.title}
        nextHref={nextHref}
        nextLabel={nextLabel}
      />
    </div>
  );
}
