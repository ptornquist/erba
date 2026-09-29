"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { humaniseSupabaseError } from "@/lib/errors";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { formatEurCompact, formatInteger, toNumber } from "@/lib/utils";
import type { ComplianceCost } from "@/types/database";

const PAGE_SIZE = 1000;

const DONUT_COLORS = [
  "#003399",
  "#1a4db3",
  "#4d7cc9",
  "#002266",
  "#7aa0d6",
  "#0055cc",
  "#94b4e0",
];

type CostRow = ComplianceCost & { pain_submission_id?: string | null };

function recordedTotal(row: CostRow): number {
  if (row.erba_normalised_cost !== null && row.erba_normalised_cost !== undefined) {
    return toNumber(row.erba_normalised_cost);
  }
  return toNumber(row.total_reported_cost);
}

function regulationName(row: CostRow): string {
  const name = row.framework_name?.trim();
  return name ? name : "Other";
}

function verificationTier(row: CostRow): number {
  return toNumber(row.verification_tier);
}

async function fetchAllComplianceCosts(): Promise<CostRow[]> {
  const supabase = createClient();
  const rows: CostRow[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("compliance_costs")
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

export function AggregationDashboard() {
  const [rows, setRows] = useState<CostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isSupabaseConfigured) {
        setError(
          "This deployment is not connected to Supabase yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY and try again.",
        );
        setLoading(false);
        return;
      }

      try {
        const data = await fetchAllComplianceCosts();
        if (!cancelled) {
          setRows(data);
          setError(null);
        }
      } catch (cause) {
        if (!cancelled) {
          setError(
            humaniseSupabaseError(
              cause,
              "Could not load compliance cost records.",
            ),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => {
    let burnRate = 0;
    let evidenceBacked = 0;
    const byRegulation = new Map<string, number>();

    for (const row of rows) {
      const total = recordedTotal(row);
      burnRate += total;
      if (verificationTier(row) >= 2) {
        evidenceBacked += total;
      }
      const name = regulationName(row);
      byRegulation.set(name, (byRegulation.get(name) ?? 0) + total);
    }

    const chartData = Array.from(byRegulation.entries())
      .map(([name, value]) => ({ name, value }))
      .filter((entry) => entry.value > 0)
      .sort((a, b) => b.value - a.value);

    return {
      burnRate,
      activeAssessments: rows.length,
      evidenceBacked,
      chartData,
    };
  }, [rows]);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
      <header className="bg-slate-900 px-6 py-8 text-white sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          ERBA
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Aggregation Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
          Ledger totals from the EU Standard Cost Model. Figures are summed from
          every <span className="font-medium text-white">compliance_costs</span>{" "}
          record.
        </p>
      </header>

      <div className="space-y-6 p-6 sm:p-8">
        {error ? (
          <div
            className="rounded-lg border border-red-200 bg-white px-4 py-3 shadow-sm"
            role="alert"
          >
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        ) : null}

        <dl className="grid gap-4 sm:grid-cols-3">
          <KpiCard
            label="Total Regulatory Burn Rate"
            value={loading ? "—" : formatEurCompact(metrics.burnRate)}
            hint="Sum of calculated compliance totals"
            loading={loading}
          />
          <KpiCard
            label="Active Assessments"
            value={loading ? "—" : formatInteger(metrics.activeAssessments)}
            hint="Number of cost submissions"
            loading={loading}
          />
          <KpiCard
            label="Evidence-Backed Totals"
            value={loading ? "—" : formatEurCompact(metrics.evidenceBacked)}
            hint="Sum where verification tier is 2 or 3"
            loading={loading}
          />
        </dl>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold tracking-tight text-slate-900">
              Compliance cost by regulation
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Share of total calculated cost grouped by framework name.
            </p>
          </div>

          <div className="h-[340px] w-full">
            {loading || !mounted ? (
              <div className="h-full w-full animate-pulse rounded-lg bg-slate-100" />
            ) : metrics.chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No compliance cost records to chart yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <PieChart>
                  <Pie
                    data={metrics.chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={78}
                    outerRadius={118}
                    paddingAngle={2}
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {metrics.chartData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      formatEurCompact(Number(value ?? 0)),
                      "Total cost",
                    ]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #c5d4ea",
                      background: "#ffffff",
                      color: "#0a1628",
                      fontSize: 13,
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-sm text-slate-700">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function KpiCard({
  label,
  value,
  hint,
  loading,
}: {
  label: string;
  value: string;
  hint: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd
        className={`mt-2 font-mono text-3xl font-bold tabular-nums tracking-tight text-slate-900 ${
          loading ? "animate-pulse text-slate-300" : ""
        }`}
      >
        {value}
      </dd>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">{hint}</p>
    </div>
  );
}
