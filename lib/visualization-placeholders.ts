/**
 * Isolated stand-ins until live Supabase aggregations are wired.
 *
 * Swap `PLACEHOLDER_CUMULATIVE_BURDEN_EUR` for
 * `sum(pain_submissions.estimated_cost_eur)` across all verification tiers.
 * Swap `PLACEHOLDER_INDUSTRY_AVERAGES` for average cost grouped by
 * `companies.industry`.
 */

export const PLACEHOLDER_CUMULATIVE_BURDEN_EUR = 4_200_000_000;

export type IndustryAverage = {
  industry: string;
  averageCostEur: number;
};

export const PLACEHOLDER_INDUSTRY_AVERAGES: IndustryAverage[] = [
  { industry: "Manufacturing", averageCostEur: 820_000 },
  { industry: "Agriculture & Food", averageCostEur: 410_000 },
  { industry: "Automotive", averageCostEur: 960_000 },
  { industry: "Chemicals", averageCostEur: 1_120_000 },
  { industry: "Energy & Utilities", averageCostEur: 740_000 },
  { industry: "Logistics & Transport", averageCostEur: 530_000 },
  { industry: "Pharma & Medical Devices", averageCostEur: 1_250_000 },
  { industry: "Financial Services", averageCostEur: 680_000 },
];
