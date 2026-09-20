"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut } from "lucide-react";
import { ArchivePlate } from "@/components/game/ArchivePlate";
import { Button } from "@/components/ui/button";
import type { ImageFocus } from "@/lib/types";

interface ImageClueProps {
  image: ImageFocus;
}

export function ImageClue({ image }: ImageClueProps) {
  const [zoomed, setZoomed] = React.useState(false);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const drag = React.useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const scale = zoomed ? image.scale + 0.7 : image.scale;

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
        <motion.div
          className="absolute inset-0"
          animate={{ scale }}
          transition={{ type: "spring", stiffness: 220, damping: 28 }}
          style={{
            x: offset.x,
            y: offset.y,
            originX: image.x / 100,
            originY: image.y / 100,
          }}
        >
          <ArchivePlate plateId={image.plateId} />
        </motion.div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(10,8,4,0.55))] mix-blend-multiply" />
        <FilmSprockets />
      </div>
      <div className="absolute bottom-3 right-3">
        <Button
          size="icon"
          variant="gold"
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
        <span key={i} className="mx-auto block h-3 w-3 rounded-[2px] bg-gold/80" />
      ))}
    </div>
  );
}
