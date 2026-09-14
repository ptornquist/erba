import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Building2, Euro, FileText, Plus } from "lucide-react";
import { BurdenAlertCard } from "@/components/dashboard/burden-alert-card";
import { ReferralTracker } from "@/components/dashboard/referral-tracker";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { formatEur, generateReferralCode, toNumber } from "@/lib/utils";
import type { Company, PainSubmission, Profile } from "@/types/database";

export const metadata: Metadata = {
  title: "Member Dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isSupabaseConfigured) {
    redirect("/join");
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/join?next=/dashboard");
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  let profile: Profile | null = existingProfile;

  // Self-heal: a profile row can be missing if the sign-up flow was
  // interrupted between auth.signUp() and the profiles insert.
  if (!profile) {
    const { data: created } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email ?? "",
        referral_code: generateReferralCode(),
        referred_by: null,
      })
      .select("*")
      .single();
    profile = created;
  }

  const referralCode = profile?.referral_code ?? "------";

  const [{ data: companiesData }, { count: referralCount }] = await Promise.all([
    supabase
      .from("companies")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: true }),
    profile
      ? supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("referred_by", profile.referral_code)
      : Promise.resolve({ count: 0 }),
  ]);

  const companies: Company[] = companiesData ?? [];
  const companyIds = companies.map((c) => c.id);

  let submissions: PainSubmission[] = [];
  if (companyIds.length > 0) {
    const { data } = await supabase
      .from("pain_submissions")
      .select("*")
      .in("company_id", companyIds)
      .order("created_at", { ascending: false });
    submissions = data ?? [];
  }

  const primaryCompany = companies[0] ?? null;
  const totalCost = submissions.reduce(
    (sum, s) => sum + toNumber(s.estimated_cost_eur),
    0,
  );
  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null;

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Member Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            {primaryCompany ? primaryCompany.name : "Welcome to the Alliance"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {fullName ? `${fullName} · ` : ""}
            {user.email}
            {primaryCompany?.is_anonymous && (
              <Badge variant="secondary" className="ml-2 align-middle">
                Anonymous
              </Badge>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <ButtonLink href="/pain-index" variant="outline">
            Public Pain Index
            <ArrowUpRight />
          </ButtonLink>
        </div>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
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
    </div>
  );
}
