import { createPublicSupabaseClient } from "@/lib/supabase-server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { toNumber } from "@/lib/utils";
import type { PainSubmission } from "@/types/database";

export interface RegulationTotal {
  regulationName: string;
  totalCostEur: number;
  submissionCount: number;
  sharePercent: number;
}

export interface PainIndexData {
  totalCostEur: number;
  submissionCount: number;
  companyCount: number;
  averageCostEur: number;
  leaderboard: RegulationTotal[];
  latestSubmissionAt: string | null;
  error: string | null;
}

const PAGE_SIZE = 1000;

/** Fetches every pain_submissions row, paging past PostgREST's default row cap. */
async function fetchAllSubmissions(): Promise<PainSubmission[]> {
  const supabase = createPublicSupabaseClient();
  const rows: PainSubmission[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("pain_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
  }

  return rows;
}

export function aggregateSubmissions(rows: PainSubmission[]): Omit<PainIndexData, "error"> {
  const totals = new Map<string, { total: number; count: number }>();
  const companies = new Set<string>();
  let totalCostEur = 0;
  let latestSubmissionAt: string | null = null;

  for (const row of rows) {
    const cost = toNumber(row.estimated_cost_eur);
    const name = row.regulation_name?.trim() || "Other";
    totalCostEur += cost;
    companies.add(row.company_id);

    const entry = totals.get(name) ?? { total: 0, count: 0 };
    entry.total += cost;
    entry.count += 1;
    totals.set(name, entry);

    if (!latestSubmissionAt || row.created_at > latestSubmissionAt) {
      latestSubmissionAt = row.created_at;
    }
  }

  const leaderboard: RegulationTotal[] = Array.from(totals.entries())
    .map(([regulationName, { total, count }]) => ({
      regulationName,
      totalCostEur: total,
      submissionCount: count,
      sharePercent: totalCostEur > 0 ? (total / totalCostEur) * 100 : 0,
    }))
    .sort((a, b) => b.totalCostEur - a.totalCostEur);

  return {
    totalCostEur,
    submissionCount: rows.length,
    companyCount: companies.size,
    averageCostEur: rows.length > 0 ? totalCostEur / rows.length : 0,
    leaderboard,
    latestSubmissionAt,
  };
}

export async function getPainIndexData(): Promise<PainIndexData> {
  const empty = aggregateSubmissions([]);

  if (!isSupabaseConfigured) {
    return {
      ...empty,
      error:
        "Supabase is not configured for this deployment, so live data cannot be loaded.",
    };
  }

  try {
    const rows = await fetchAllSubmissions();
    return { ...aggregateSubmissions(rows), error: null };
  } catch (err) {
    console.error("Failed to load pain index", err);
    return {
      ...empty,
      error:
        err instanceof Error && err.message
          ? err.message
          : "Failed to load the Pain Index. Please try again shortly.",
    };
  }
}
