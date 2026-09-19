import type { Metadata } from "next";
import { AlertTriangle, Building2 } from "lucide-react";
import { ChecklistBoard } from "@/components/dashboard/checklist-board";
import { PageHeader } from "@/components/dashboard/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getTranslations } from "next-intl/server";
import { getDashboardContext } from "@/lib/dashboard";
import { getChecklistTemplate } from "@/lib/compliance-templates";
import { loadLocale } from "@/i18n/load-locale";
import type { ComplianceTask } from "@/types/database";

export const metadata: Metadata = {
  title: "Compliance Checklists",
};

export default async function ChecklistsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await loadLocale(params);
  const t = await getTranslations({ locale, namespace: "dashboard" });
  const { supabase, company } = await getDashboardContext();

  if (!company) {
    return (
      <>
        <PageHeader
          eyebrow="Automated Compliance Checklists"
          title="Compliance checklist"
        />
        <EmptyState
          icon={Building2}
          title="Register a company first"
          description="Checklists are generated per company and industry. Complete onboarding to provision yours."
          action={<ButtonLink href="/join">{t("completeOnboarding")}</ButtonLink>}
        />
      </>
    );
  }

  let { data: tasks, error } = await supabase
    .from("compliance_tasks")
    .select("*")
    .eq("company_id", company.id);

  // First visit: provision the industry template so managers start from a
  // populated checklist rather than a blank page.
  if (!error && (tasks ?? []).length === 0) {
    const template = getChecklistTemplate(company.industry).map(
      (task_description) => ({
        company_id: company.id,
        industry: company.industry,
        task_description,
        is_completed: false,
      }),
    );
    const provisioned = await supabase
      .from("compliance_tasks")
      .insert(template)
      .select("*");
    tasks = provisioned.data;
    error = provisioned.error;
  }

  const sorted: ComplianceTask[] = [...(tasks ?? [])].sort((a, b) => {
    if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
    return a.task_description.localeCompare(b.task_description);
  });

  return (
    <>
      <PageHeader
        eyebrow="Automated Compliance Checklists"
        title="Compliance checklist"
        description={`Obligations generated for ${company.industry} mid-caps plus EU-wide baseline requirements. Tick items as evidence is filed.`}
      />

      {error && (
        <Alert variant="warning">
          <AlertTriangle />
          <AlertTitle>Could not load checklist</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <ChecklistBoard
        companyId={company.id}
        industry={company.industry}
        initialTasks={sorted}
      />
    </>
  );
}
