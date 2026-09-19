import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
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
import { PainIndexScale } from "@/components/pain-index-scale";
import { REGULATIONS } from "@/lib/constants";
import { getPainIndexData } from "@/lib/pain-index";
import { cn, formatEur, formatEurCompact, formatInteger } from "@/lib/utils";
import { loadLocale } from "@/i18n/load-locale";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await loadLocale(params);
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("painIndexTitle"),
    description: t("painIndexDescription"),
  };
}

const RANK_STYLES = [
  "bg-primary text-primary-foreground",
  "bg-primary/80 text-primary-foreground",
  "bg-secondary text-foreground",
];

export default async function PainIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await loadLocale(params);
  const t = await getTranslations("painIndex");
  const tr = await getTranslations("regulations");
  const dateLocale = locale;
  const data = await getPainIndexData();
  const hasData = data.submissionCount > 0;
  const topShare = data.leaderboard[0]?.sharePercent ?? 0;

  function regulationLabel(name: string): string {
    return (REGULATIONS as readonly string[]).includes(name)
      ? tr(name as (typeof REGULATIONS)[number])
      : name;
  }

  return (
    <>
      <section className="relative overflow-hidden bg-grid">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,51,153,0.12),transparent_60%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 text-center sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
          <Badge variant="warning" className="mb-6 px-3 py-1 text-xs uppercase tracking-widest">
            <Database className="size-3.5" aria-hidden="true" />
            {t("badge")}
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t("lead")}
          </p>

          <p className="mt-12 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {t("documented")}
          </p>
          <p
            className="mt-3 font-mono text-6xl font-black tabular-nums leading-none tracking-tighter text-primary sm:text-7xl md:text-8xl lg:text-9xl"
            aria-live="polite"
          >
            {formatEur(data.totalCostEur, dateLocale)}
          </p>
          <PainIndexScale
            totalEur={data.totalCostEur}
            locale={dateLocale}
            label={t("scaleLabel")}
            minLabel={t("scaleMin")}
            maxLabel={t("scaleMax")}
            hint={t("scaleHint")}
            overflowLabel={t("scaleOverflow")}
          />
          <p className="mt-4 text-muted-foreground">
            {t("approx", {
              compact: formatEurCompact(data.totalCostEur, dateLocale),
              submissions: formatInteger(data.submissionCount, dateLocale),
              submissionLabel:
                data.submissionCount === 1 ? t("submission") : t("submissions"),
              companies: formatInteger(data.companyCount, dateLocale),
              companyLabel: data.companyCount === 1 ? t("company") : t("companies"),
            })}
          </p>

          <dl className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
            <MetricCard
              icon={Building2}
              label={t("companiesReporting")}
              value={formatInteger(data.companyCount, dateLocale)}
            />
            <MetricCard
              icon={Euro}
              label={t("averageCost")}
              value={formatEurCompact(data.averageCostEur, dateLocale)}
            />
            <MetricCard
              icon={TrendingUp}
              label={t("latest")}
              value={
                data.latestSubmissionAt
                  ? new Date(data.latestSubmissionAt).toLocaleDateString(dateLocale, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
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
            <AlertTitle>{t("unavailableTitle")}</AlertTitle>
            <AlertDescription>{data.error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              {t("leaderboard")}
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("leaderboardTitle")}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">{t("ranked")}</p>
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
                        {formatInteger(entry.submissionCount, dateLocale)}{" "}
                        {entry.submissionCount === 1 ? t("submission") : t("submissions")}{" "}
                        · {t("ofTotal", { percent: entry.sharePercent.toFixed(1) })}
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
                      {formatEur(entry.totalCostEur, dateLocale)}
                      <span className="block text-xs font-normal text-muted-foreground">
                        {t("perYear")}
                      </span>
                    </p>
                  </li>
                );
              })}
            </ol>
          ) : (
            <CardContent className="py-16 text-center">
              <CardHeader className="p-0">
                <CardTitle className="text-xl">{t("emptyTitle")}</CardTitle>
              </CardHeader>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                {t("emptyBody")}
              </p>
              <ButtonLink href="/join" className="mt-6">
                {t("addData")}
                <ArrowRight />
              </ButtonLink>
            </CardContent>
          )}
        </Card>

        <p className="mt-6 text-xs text-muted-foreground">{t("method")}</p>
      </section>

      <div className="sticky bottom-0 z-40 border-t border-primary/40 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-4 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium sm:text-left sm:text-base">
            {t("cta")}{" "}
            <span className="text-muted-foreground">{t("ctaAnon")}</span>
          </p>
          <ButtonLink href="/join" size="lg" className="w-full sm:w-auto">
            {t("ctaButton")}
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
