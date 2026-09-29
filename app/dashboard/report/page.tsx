import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { CostReportingForm } from "@/components/CostReportingForm";
import { PageHeader } from "@/components/dashboard/page-header";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getDashboardContext } from "@/lib/dashboard";

export const metadata: Metadata = {
  title: "Cost reporting",
};

export default async function CostReportingPage() {
  const { company } = await getDashboardContext();

  if (!company) {
    return (
      <>
        <PageHeader
          eyebrow="EU Standard Cost Model"
          title="Report compliance costs"
        />
        <EmptyState
          icon={Building2}
          title="Register a company first"
          description="Cost reports are scoped to your organisation. Complete onboarding to add a Standard Cost Model figure."
          action={<ButtonLink href="/join">Complete onboarding</ButtonLink>}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="EU Standard Cost Model"
        title="Report compliance costs"
        description="Enter internal labour, external advice, systems and equipment. ERBA calculates the reported total from Tool #58 line items."
      />
      <div className="mt-8">
        <CostReportingForm companyId={company.id} />
      </div>
    </>
  );
}
