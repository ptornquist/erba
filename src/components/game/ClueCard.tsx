"use client";

import * as React from "react";
import { Search, ZoomIn, ZoomOut } from "lucide-react";
import { ArchivePlate } from "@/components/game/ArchivePlate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Clue, PlateId } from "@/lib/types";

interface ClueCardProps {
  clue: Clue;
  clueNumber: number;
  cluesRevealed: number;
  onSelectClue: (clueNumber: number) => void;
}

export function ClueCard({
  clue,
  clueNumber,
  cluesRevealed,
  onSelectClue,
}: ClueCardProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-gold/25 bg-card shadow-[0_24px_80px_-32px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between gap-3 border-b border-gold/20 bg-ink px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge variant="gold">Clue {clueNumber}</Badge>
          {clue.kicker && (
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/70">
              {clue.kicker}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 6 }, (_, index) => {
            const number = index + 1;
            const unlocked = number <= cluesRevealed;
            return (
              <button
                key={number}
                type="button"
                disabled={!unlocked}
                onClick={() => onSelectClue(number)}
                className={cn(
                  "h-7 w-7 rounded-sm font-mono text-xs",
                  number === clueNumber
                    ? "bg-gold text-ink"
                    : unlocked
                      ? "bg-paper/10 text-paper hover:bg-paper/20"
                      : "bg-paper/5 text-paper/25",
                )}
                aria-label={`Clue ${number}`}
              >
                {number}
              </button>
            );
          })}
        </div>
      </div>

      {clue.kind === "image" && clue.image && (
        <ZoomablePlate
          key={`${clueNumber}-${clue.image.plateId}-${clue.image.scale}`}
          plateId={clue.image.plateId}
          baseScale={clue.image.scale}
          originX={clue.image.x}
          originY={clue.image.y}
        />
      )}

      {clue.kind === "stats" && clue.stats && (
        <div className="bg-paper px-5 py-6 text-ink">
          <p className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
            <Search className="size-3.5" /> Redacted box score
          </p>
          <dl className="grid gap-3 sm:grid-cols-2">
            {clue.stats.map((stat) => {
              const visible = cluesRevealed >= stat.revealedAtClue;
              return (
                <div
                  key={stat.label}
                  className="rounded-lg border border-ink/10 bg-white/40 px-4 py-3"
                >
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-ink/50">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 font-serif text-xl">
                    {visible ? (
                      stat.value
                    ) : (
                      <span
                        className="inline-block h-6 w-28 rounded-sm bg-ink align-middle"
                        title="Redacted until a later clue"
                      />
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      )}

      {clue.kind === "text" && (
        <div className="bg-paper px-6 py-8 text-ink">
          <p className="font-serif text-2xl leading-snug sm:text-[1.7rem]">{clue.body}</p>
        </div>
      )}

      {clue.kind === "quote" && (
        <div className="bg-paper px-6 py-8 text-ink">
          <blockquote className="font-serif text-2xl leading-snug italic sm:text-[1.75rem]">
            “{clue.quote}”
          </blockquote>
          {clue.attribution && (
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink/50">
              — {clue.attribution}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function ZoomablePlate({
  plateId,
  baseScale,
  originX,
  originY,
}: {
  plateId: PlateId;
  baseScale: number;
  originX: number;
  originY: number;
}) {
  const [zoomed, setZoomed] = React.useState(false);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const drag = React.useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const scale = zoomed ? baseScale + 0.7 : baseScale;

  return (
    <div className="relative">
      <div
        className="relative aspect-[16/10] cursor-grab overflow-hidden bg-ink active:cursor-grabbing"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
        }}
        onPointerMove={(event) => {
          if (!drag.current) return;
          setOffset({
            x: drag.current.ox + (event.clientX - drag.current.x),
            y: drag.current.oy + (event.clientY - drag.current.y),
          });
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onDoubleClick={() => setZoomed((value) => !value)}
      >
        <div
          className="absolute inset-0 transition-transform duration-500 ease-out"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: `${originX}% ${originY}%`,
          }}
        >
          <ArchivePlate plateId={plateId} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(10,8,4,0.55))] mix-blend-multiply" />
        <FilmSprockets />
      </div>
      <div className="absolute bottom-3 right-3">
        <Button
          size="icon"
          variant="paper"
          className="h-9 w-9"
          onClick={() => setZoomed((value) => !value)}
          aria-label={zoomed ? "Zoom out" : "Zoom in"}
        >
          {zoomed ? <ZoomOut /> : <ZoomIn />}
        </Button>
      </div>
    </div>
  );
}

function FilmSprockets() {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 flex w-6 flex-col justify-between py-2">
      {Array.from({ length: 8 }, (_, i) => (
        <span key={i} className="mx-auto block h-3 w-3 rounded-[2px] bg-paper/80" />
      ))}
    </div>
  );
}
