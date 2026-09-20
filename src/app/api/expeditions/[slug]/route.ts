import { getExpedition, getExpeditionPuzzles } from "@/lib/catalog";
import { toPublicPuzzle } from "@/lib/types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const expedition = getExpedition(slug);
  if (!expedition) {
    return Response.json({ error: "Unknown expedition" }, { status: 404 });
  }

  const puzzles = getExpeditionPuzzles(slug).map(toPublicPuzzle);
  return Response.json({ expedition, puzzles });
}
