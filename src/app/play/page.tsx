import { eventDictionary, getRandomPuzzle } from "@/lib/catalog";
import { toPublicPuzzle } from "@/lib/types";
import { PlayPage } from "./play-client";

export const dynamic = "force-dynamic";

export default function Play() {
  const puzzle = toPublicPuzzle(getRandomPuzzle());
  return <PlayPage initialPuzzle={puzzle} initialEvents={eventDictionary} />;
}
