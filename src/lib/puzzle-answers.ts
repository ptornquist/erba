import "server-only";

import { getAnswerSheet } from "@/lib/catalog";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { AnswerSheet } from "@/lib/types";

/**
 * Load the hidden answer sheet. Prefers the `puzzles` table via the
 * service-role client (bypasses RLS). Falls back to the local catalog so
 * the game still scores without Supabase configured.
 */
export async function loadAnswerSheet(puzzleId: string): Promise<AnswerSheet | null> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("puzzles")
      .select("target_year, target_subject, accepted_aliases")
      .eq("id", puzzleId)
      .single();

    if (!error && data) {
      return {
        target_year: Number(data.target_year),
        target_subject: String(data.target_subject),
        accepted_aliases: Array.isArray(data.accepted_aliases)
          ? data.accepted_aliases.map(String)
          : [],
      };
    }
  }

  return getAnswerSheet(puzzleId) ?? null;
}
