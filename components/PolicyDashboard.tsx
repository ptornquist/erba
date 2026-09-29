"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Radar } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { humaniseSupabaseError } from "@/lib/errors";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { RegulatoryPolicy } from "@/types/database";

const deadlineFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDeadline(value: string): string {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? value
    : deadlineFormatter.format(parsed);
}

function impactBadgeClass(level: string): string {
  const normalised = level.trim().toLowerCase();
  if (normalised === "high") return "bg-red-100 text-red-800";
  if (normalised === "med" || normalised === "medium") {
    return "bg-amber-100 text-amber-800";
  }
  if (normalised === "low") return "bg-emerald-100 text-emerald-800";
  return "bg-slate-100 text-slate-700";
}

function tagsOf(policy: RegulatoryPolicy): string[] {
  return Array.isArray(policy.industry_tags) ? policy.industry_tags : [];
}

export function PolicyDashboard() {
  const [policies, setPolicies] = useState<RegulatoryPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from("regulatory_policies")
          .select("*")
          .order("deadline", { ascending: true });
        if (fetchError) throw fetchError;

        if (!cancelled) {
          setPolicies(data ?? []);
          setError(null);
        }
      } catch (cause) {
        if (!cancelled) {
          setError(
            humaniseSupabaseError(
              cause,
              "Could not load the regulatory intelligence feed.",
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

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
      <header className="bg-slate-900 px-6 py-8 text-white sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          ERBA
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Regulatory Intelligence Feed
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
          Upcoming compliance deadlines, ordered by date, with impact and
          industry exposure.
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

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="h-48 animate-pulse rounded-lg border border-slate-200 bg-white shadow-sm"
              />
            ))}
          </div>
        ) : policies.length === 0 ? (
          <EmptyState
            icon={Radar}
            title="No policies published yet"
            description="The ERBA policy team will add frameworks here as deadlines land."
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {policies.map((policy) => (
              <li key={policy.id}>
                <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <h2 className="text-lg font-bold leading-snug text-slate-900">
                      {policy.framework_name}
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-500">
                      {policy.description}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-1.5">
                      {tagsOf(policy).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <footer className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3">
                    <p className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
                      <CalendarDays
                        className="size-3.5 text-slate-400"
                        aria-hidden="true"
                      />
                      <time dateTime={policy.deadline}>
                        {formatDeadline(policy.deadline)}
                      </time>
                    </p>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        impactBadgeClass(policy.impact_level),
                      )}
                    >
                      {policy.impact_level}
                    </span>
                  </footer>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
