import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Building2, Euro, FileText, Plus } from "lucide-react";
import { BurdenChart } from "@/components/burden-chart";
import { BurdenAlertCard } from "@/components/dashboard/burden-alert-card";
import { ReferralTracker } from "@/components/dashboard/referral-tracker";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardContext } from "@/lib/dashboard";
import { formatEur, toNumber } from "@/lib/utils";
import {
  PLACEHOLDER_INDUSTRY_AVERAGES,
  type IndustryAverage,
} from "@/lib/visualization-placeholders";
import type { Company, PainSubmission } from "@/types/database";

export const metadata: Metadata = {
  title: "Overview",
};

export default async function DashboardOverviewPage() {
  const { supabase, user, profile, companies, company, fullName } =
    await getDashboardContext();

  const referralCode = profile?.referral_code ?? "------";
  const companyIds = companies.map((c) => c.id);

  const [{ data: referralCount }, submissionsResult] = await Promise.all([
    supabase.rpc("referral_count"),
    companyIds.length > 0
      ? supabase
          .from("pain_submissions")
          .select("*")
          .in("company_id", companyIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as PainSubmission[] }),
  ]);

  const submissions: PainSubmission[] = submissionsResult.data ?? [];
  const primaryCompany = company;
  const totalCost = submissions.reduce(
    (sum, s) => sum + toNumber(s.estimated_cost_eur),
    0,
  );

  const liveIndustryAverages = averageCostByIndustry(companies, submissions);
  const industryChartData =
    liveIndustryAverages.length > 0
      ? liveIndustryAverages
      : PLACEHOLDER_INDUSTRY_AVERAGES;

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={primaryCompany ? primaryCompany.name : "Welcome to the Alliance"}
        description={
          <>
            {fullName ? `${fullName} · ` : ""}
            {user.email}
            {primaryCompany?.is_anonymous && (
              <Badge variant="secondary" className="ml-2 align-middle">
                Anonymous
              </Badge>
            )}
          </>
        }
        actions={
          <ButtonLink href="/pain-index" variant="outline">
            Public Pain Index
            <ArrowUpRight />
          </ButtonLink>
        }
      />

      <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-8">
          <section aria-labelledby="war-room-heading" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2
                id="war-room-heading"
                className="text-lg font-bold uppercase tracking-widest"
              >
                The War Room
              </h2>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-2 animate-pulse rounded-full bg-primary" />
                Live campaign
              </span>
            </div>
            <BurdenAlertCard
              letterInput={{
                companyName: primaryCompany?.name ?? "Our company",
                industry: primaryCompany?.industry ?? null,
                turnoverBand: primaryCompany?.turnover_band ?? null,
                estimatedCostEur:
                  toNumber(
                    submissions.find((s) => s.regulation_name === "CSRD")
                      ?.estimated_cost_eur,
                  ) || null,
                signatoryName: fullName,
              }}
            />
            <BurdenChart
              data={industryChartData}
              isPlaceholder={liveIndustryAverages.length === 0}
            />
          </section>

          <section aria-labelledby="submissions-heading" className="space-y-4">
            <h2
              id="submissions-heading"
              className="text-lg font-bold uppercase tracking-widest"
            >
              Your Pain Index Contributions
            </h2>
            <Card>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="size-5 text-primary" aria-hidden="true" />
                    {submissions.length}{" "}
                    {submissions.length === 1 ? "submission" : "submissions"}
                  </CardTitle>
                  <CardDescription className="mt-1.5">
                    Total documented burden:{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {formatEur(totalCost)}
                    </span>{" "}
                    per year
                  </CardDescription>
                </div>
                <ButtonLink href="/join" variant="outline" size="sm">
                  <Plus />
                  Add company
                </ButtonLink>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No regulatory pain recorded yet.{" "}
                    <Link href="/join" className="underline underline-offset-4">
                      Add your first submission
                    </Link>
                    .
                  </p>
                ) : (
                  <ul className="divide-y divide-border">
                    {submissions.map((submission) => {
                      const company = companies.find(
                        (c) => c.id === submission.company_id,
                      );
                      return (
                        <li
                          key={submission.id}
                          className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold">
                              {submission.regulation_name}
                            </p>
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Building2 className="size-3.5" aria-hidden="true" />
                              {company?.name ?? "Unknown company"} ·{" "}
                              {new Date(
                                submission.created_at,
                              ).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                            {submission.description && (
                              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                {submission.description}
                              </p>
                            )}
                          </div>
                          <p className="flex shrink-0 items-center gap-1 font-mono text-lg font-bold tabular-nums">
                            <Euro className="size-4 text-primary" aria-hidden="true" />
                            {formatEur(toNumber(submission.estimated_cost_eur))}
                            <span className="text-xs font-normal text-muted-foreground">
                              /yr
                            </span>
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>
        </div>

        <aside className="space-y-8">
          <section aria-labelledby="referral-heading" className="space-y-4">
            <h2
              id="referral-heading"
              className="text-lg font-bold uppercase tracking-widest"
            >
              Referral Tracker
            </h2>
            <ReferralTracker
              referralCode={referralCode}
              referralCount={referralCount ?? 0}
            />
          </section>

          <Card className="bg-secondary/40">
            <CardHeader>
              <CardTitle className="text-base">Full Membership includes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">▸</span> Quarterly MEP briefing
                  calls with the ERBA policy team
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">▸</span> The Cumulative Burden
                  Report before public release
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">▸</span> A seat in the annual
                  Brussels CEO delegation
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">▸</span> Objection-letter
                  templates for every new Green Deal act
                </li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}

function averageCostByIndustry(
  companies: Company[],
  submissions: PainSubmission[],
): IndustryAverage[] {
  const industryByCompany = new Map(
    companies.map((company) => [company.id, company.industry]),
  );
  const buckets = new Map<string, { total: number; count: number }>();

  for (const submission of submissions) {
    const industry = industryByCompany.get(submission.company_id);
    if (!industry) continue;
    const entry = buckets.get(industry) ?? { total: 0, count: 0 };
    entry.total += toNumber(submission.estimated_cost_eur);
    entry.count += 1;
    buckets.set(industry, entry);
  }

  return Array.from(buckets.entries()).map(([industry, { total, count }]) => ({
    industry,
    averageCostEur: count > 0 ? total / count : 0,
  }));
}
