import type { Metadata } from "next";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Database,
  Euro,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { REGULATION_LABELS, REGULATIONS } from "@/lib/constants";
import { getPainIndexData } from "@/lib/pain-index";
import { cn, formatEur, formatEurCompact, formatInteger } from "@/lib/utils";

export const metadata: Metadata = {
  title: "The Pain Index – Documented Cost of EU Regulation",
  description:
    "Live, crowd-sourced total of annual compliance costs reported by European mid-cap companies, broken down by regulation.",
};

export const revalidate = 60;

function regulationLabel(name: string): string {
  return (REGULATIONS as readonly string[]).includes(name)
    ? REGULATION_LABELS[name as (typeof REGULATIONS)[number]]
    : name;
}

const RANK_STYLES = [
  "bg-primary text-primary-foreground",
  "bg-eu-yellow text-black",
  "bg-secondary text-foreground",
];

export default async function PainIndexPage() {
  const data = await getPainIndexData();
  const hasData = data.submissionCount > 0;
  const topShare = data.leaderboard[0]?.sharePercent ?? 0;

  return (
    <>
      <section className="relative overflow-hidden bg-grid">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,59,47,0.2),transparent_60%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 text-center sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
          <Badge variant="warning" className="mb-6 px-3 py-1 text-xs uppercase tracking-widest">
            <Database className="size-3.5" aria-hidden="true" />
            Live · Crowd-sourced · Anonymised
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            The Pain Index
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Total annual compliance cost documented by European companies,
            regulation by regulation.
          </p>

          <p className="mt-12 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Documented annual regulatory burden
          </p>
          <p
            className="mt-3 font-mono text-6xl font-black tabular-nums leading-none tracking-tighter text-primary sm:text-7xl md:text-8xl lg:text-9xl"
            aria-live="polite"
          >
            {formatEur(data.totalCostEur)}
          </p>
          <p className="mt-4 text-muted-foreground">
            ≈ {formatEurCompact(data.totalCostEur)} per year, across{" "}
            {formatInteger(data.submissionCount)}{" "}
            {data.submissionCount === 1 ? "submission" : "submissions"} from{" "}
            {formatInteger(data.companyCount)}{" "}
            {data.companyCount === 1 ? "company" : "companies"}
          </p>

          <dl className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
            <MetricCard
              icon={Building2}
              label="Companies reporting"
              value={formatInteger(data.companyCount)}
            />
            <MetricCard
              icon={Euro}
              label="Average cost per submission"
              value={formatEurCompact(data.averageCostEur)}
            />
            <MetricCard
              icon={TrendingUp}
              label="Latest data point"
              value={
                data.latestSubmissionAt
                  ? new Date(data.latestSubmissionAt).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short", year: "numeric" },
                    )
                  : "—"
              }
            />
          </dl>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        {data.error && (
          <Alert variant="warning" className="mb-8">
            <AlertTriangle />
            <AlertTitle>Live data unavailable</AlertTitle>
            <AlertDescription>{data.error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Leaderboard
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Which regulation costs Europe the most?
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Ranked by total documented annual cost
          </p>
        </div>

        <Card className="mt-8 overflow-hidden">
          {hasData ? (
            <ol className="divide-y divide-border">
              {data.leaderboard.map((entry, index) => {
                const barWidth =
                  topShare > 0 ? (entry.sharePercent / topShare) * 100 : 0;
                return (
                  <li
                    key={entry.regulationName}
                    className="relative grid gap-4 p-5 sm:grid-cols-[3rem_1fr_auto] sm:items-center sm:p-6"
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 left-0 bg-primary/5"
                      style={{ width: `${barWidth}%` }}
                    />
                    <span
                      className={cn(
                        "relative flex size-12 items-center justify-center rounded-lg font-mono text-lg font-black",
                        RANK_STYLES[index] ?? "bg-secondary text-muted-foreground",
                      )}
                    >
                      {index === 0 ? (
                        <Trophy className="size-5" aria-label="Rank 1" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <div className="relative min-w-0">
                      <p className="truncate text-lg font-semibold">
                        {regulationLabel(entry.regulationName)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatInteger(entry.submissionCount)}{" "}
                        {entry.submissionCount === 1 ? "submission" : "submissions"}{" "}
                        · {entry.sharePercent.toFixed(1)}% of total
                      </p>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            index === 0 ? "bg-primary" : "bg-muted-foreground/50",
                          )}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                    <p className="relative font-mono text-2xl font-bold tabular-nums sm:text-right sm:text-3xl">
                      {formatEur(entry.totalCostEur)}
                      <span className="block text-xs font-normal text-muted-foreground">
                        per year
                      </span>
                    </p>
                  </li>
                );
              })}
            </ol>
          ) : (
            <CardContent className="py-16 text-center">
              <CardHeader className="p-0">
                <CardTitle className="text-xl">No submissions yet</CardTitle>
              </CardHeader>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                The Pain Index starts with the first company brave enough to
                put a number on it. Be the first data point.
              </p>
              <ButtonLink href="/join" className="mt-6">
                Add your data
                <ArrowRight />
              </ButtonLink>
            </CardContent>
          )}
        </Card>

        <p className="mt-6 text-xs text-muted-foreground">
          Methodology: figures are self-reported annual compliance cost
          estimates submitted by member companies. Company identities are
          never displayed; anonymous submissions are included in aggregates.
          Totals refresh every minute.
        </p>
      </section>

      <div className="sticky bottom-0 z-40 border-t border-primary/40 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-4 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium sm:text-left sm:text-base">
            Is your company facing these costs?{" "}
            <span className="text-muted-foreground">
              Add your data anonymously.
            </span>
          </p>
          <ButtonLink href="/join" size="lg" className="w-full sm:w-auto">
            Add Your Regulatory Pain
            <ArrowRight />
          </ButtonLink>
        </div>
      </div>
    </>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 text-left">
      <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="size-4 text-primary" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-2 font-mono text-2xl font-bold tabular-nums">{value}</dd>
    </div>
  );
}
