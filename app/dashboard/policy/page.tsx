import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { PolicyFeed } from "@/components/dashboard/policy-feed";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getDashboardContext } from "@/lib/dashboard";
import { IMPACT_LEVELS, type ImpactLevel, type PolicyUpdate } from "@/types/database";

export const metadata: Metadata = {
  title: "Policy Dashboard",
};

function normaliseImpact(level: string): ImpactLevel {
  const match = IMPACT_LEVELS.find(
    (l) => l.toLowerCase() === level.trim().toLowerCase(),
  );
  if (match) return match;
  if (level.toLowerCase().startsWith("med")) return "Med";
  return "Low";
}

export default async function PolicyDashboardPage() {
  const { supabase, company } = await getDashboardContext();

  const { data, error } = await supabase
    .from("policy_updates")
    .select("*")
    .order("date_issued", { ascending: false });

  const updates: PolicyUpdate[] = (data ?? []).map((u) => ({
    ...u,
    impact_level: normaliseImpact(u.impact_level),
  }));

  return (
    <>
      <PageHeader
        eyebrow="Dynamic Policy Dashboard"
        title="Regulatory intelligence feed"
        description="Every material shift in EU regulation, translated into what it means for your organisation and what to do next."
      />

      {error && (
        <Alert variant="warning">
          <AlertTriangle />
          <AlertTitle>Could not load policy updates</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <PolicyFeed updates={updates} industry={company?.industry ?? null} />
    </>
  );
}
