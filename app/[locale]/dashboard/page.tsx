import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight, Building2, Euro, FileText, Plus } from "lucide-react";
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
import { Link } from "@/i18n/navigation";
import { getDashboardContext } from "@/lib/dashboard";
import { formatEur, toNumber } from "@/lib/utils";
import type { PainSubmission } from "@/types/database";

export const metadata: Metadata = {
  title: "Overview",
};

export default async function DashboardOverviewPage() {
  const t = await getTranslations("dashboard");
  const tn = await getTranslations("dashboardNav");
  const dateLocale = await getLocale();
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

  return (
    <>
      <PageHeader
        eyebrow={t("overview")}
        title={primaryCompany ? primaryCompany.name : t("welcome")}
        description={
          <>
            {fullName ? `${fullName} · ` : ""}
            {user.email}
            {primaryCompany?.is_anonymous && (
              <Badge variant="secondary" className="ml-2 align-middle">
                {tn("anonymous")}
              </Badge>
            )}
          </>
        }
        actions={
          <ButtonLink href="/pain-index" variant="outline">
            {t("publicPain")}
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
                {t("warRoom")}
              </h2>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-2 animate-pulse rounded-full bg-primary" />
                {t("liveCampaign")}
              </span>
            </div>
            <BurdenAlertCard
              letterInput={{
                companyName: primaryCompany?.name ?? t("ourCompany"),
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
          </section>

          <section aria-labelledby="submissions-heading" className="space-y-4">
            <h2
              id="submissions-heading"
              className="text-lg font-bold uppercase tracking-widest"
            >
              {t("contributions")}
            </h2>
            <Card>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="size-5 text-primary" aria-hidden="true" />
                    {submissions.length}{" "}
                    {submissions.length === 1 ? t("submission") : t("submissions")}
                  </CardTitle>
                  <CardDescription className="mt-1.5">
                    {t("totalBurden")}{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {formatEur(totalCost, dateLocale)}
                    </span>{" "}
                    {t("perYear")}
                  </CardDescription>
                </div>
                <ButtonLink href="/join" variant="outline" size="sm">
                  <Plus />
                  {t("addCompany")}
                </ButtonLink>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("noSubmissions")}{" "}
                    <Link href="/join" className="underline underline-offset-4">
                      {t("addFirst")}
                    </Link>
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
                              {company?.name ?? t("unknownCompany")} ·{" "}
                              {new Date(
                                submission.created_at,
                              ).toLocaleDateString(dateLocale, {
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
                            {formatEur(toNumber(submission.estimated_cost_eur), dateLocale)}
                            <span className="text-xs font-normal text-muted-foreground">
                              {t("perYearShort")}
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
              {t("referral")}
            </h2>
            <ReferralTracker
              referralCode={referralCode}
              referralCount={referralCount ?? 0}
            />
          </section>

          <Card className="bg-secondary/40">
            <CardHeader>
              <CardTitle className="text-base">{t("membershipIncludes")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">▸</span> {t("perk1")}
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">▸</span> {t("perk2")}
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">▸</span> {t("perk3")}
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">▸</span> {t("perk4")}
                </li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
