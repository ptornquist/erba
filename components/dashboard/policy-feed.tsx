"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Filter, Radar, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { IMPACT_LEVELS, type ImpactLevel, type PolicyUpdate } from "@/types/database";

interface PolicyFeedProps {
  updates: PolicyUpdate[];
  industry: string | null;
}

type Filter = ImpactLevel | "All";

const IMPACT_META: Record<
  ImpactLevel,
  { label: string; badge: "destructive" | "warning" | "secondary"; bar: string; action: string }
> = {
  High: {
    label: "High impact",
    badge: "destructive",
    bar: "bg-primary",
    action:
      "Brief your board and legal counsel this week. Budget and headcount implications are likely.",
  },
  Med: {
    label: "Medium impact",
    badge: "warning",
    bar: "bg-primary/50",
    action:
      "Assign an owner to assess exposure within 30 days and log findings in your compliance checklist.",
  },
  Low: {
    label: "Low impact",
    badge: "secondary",
    bar: "bg-primary/25",
    action:
      "Monitor only. Revisit at the next quarterly compliance review.",
  },
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatIssued(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? date : dateFormatter.format(parsed);
}

export function PolicyFeed({ updates, industry }: PolicyFeedProps) {
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const base: Record<ImpactLevel, number> = { High: 0, Med: 0, Low: 0 };
    for (const u of updates) base[u.impact_level] += 1;
    return base;
  }, [updates]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return updates.filter(
      (u) =>
        (filter === "All" || u.impact_level === filter) &&
        (q.length === 0 ||
          u.title.toLowerCase().includes(q) ||
          u.summary.toLowerCase().includes(q)),
    );
  }, [updates, filter, query]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {IMPACT_LEVELS.map((level) => {
          const meta = IMPACT_META[level];
          const active = filter === level;
          return (
            <button
              key={level}
              type="button"
              onClick={() => setFilter(active ? "All" : level)}
              aria-pressed={active}
              className={cn(
                "group rounded-xl border bg-card p-5 text-left transition-colors hover:border-muted-foreground/40",
                active ? "border-primary" : "border-border",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {meta.label}
                </span>
                <span className={cn("size-2.5 rounded-full", meta.bar)} />
              </div>
              <p className="mt-2 font-mono text-3xl font-bold tabular-nums">
                {counts[level]}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {active ? "Showing only this level" : "Click to filter"}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search regulations…"
            aria-label="Search policy updates"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="size-4" aria-hidden="true" />
          {visible.length} of {updates.length} updates
          {filter !== "All" && (
            <button
              type="button"
              onClick={() => setFilter("All")}
              className="ml-1 underline underline-offset-4 hover:text-foreground"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Radar}
          title={updates.length === 0 ? "No policy updates yet" : "No matches"}
          description={
            updates.length === 0
              ? "The ERBA policy team publishes updates as EU institutions adopt or amend regulation. Check back soon."
              : "Try a different search term or clear the impact filter."
          }
        />
      ) : (
        <ol className="space-y-4">
          {visible.map((update) => {
            const meta = IMPACT_META[update.impact_level];
            return (
              <li key={update.id}>
                <Card className="overflow-hidden">
                  <div className="flex">
                    <span
                      aria-hidden="true"
                      className={cn("w-1.5 shrink-0", meta.bar)}
                    />
                    <CardContent className="flex-1 space-y-4 p-5 sm:p-6">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant={meta.badge}>{meta.label}</Badge>
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="size-3.5" aria-hidden="true" />
                          Issued {formatIssued(update.date_issued)}
                        </span>
                        {industry && update.impact_level === "High" && (
                          <Badge variant="outline">Relevant to {industry}</Badge>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold leading-snug">
                          {update.title}
                        </h3>
                        <p className="mt-2 leading-relaxed text-muted-foreground">
                          {update.summary}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border bg-background/60 p-3.5 text-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Recommended action
                        </p>
                        <p className="mt-1">{meta.action}</p>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
