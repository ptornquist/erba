import type { Metadata } from "next";
import { AlertTriangle, Building2, ShieldCheck } from "lucide-react";
import { DocumentVault } from "@/components/dashboard/document-vault";
import { PageHeader } from "@/components/dashboard/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getTranslations } from "next-intl/server";
import { getDashboardContext } from "@/lib/dashboard";

export const metadata: Metadata = {
  title: "Document Vault",
};

export default async function VaultPage() {
  const t = await getTranslations("dashboard");
  const { supabase, company } = await getDashboardContext();

  if (!company) {
    return (
      <>
        <PageHeader eyebrow="Secure Document Vault" title="Document vault" />
        <EmptyState
          icon={Building2}
          title="Register a company first"
          description="The vault is scoped to your organisation. Complete onboarding to start storing compliance evidence."
          action={<ButtonLink href="/join">{t("completeOnboarding")}</ButtonLink>}
        />
      </>
    );
  }

  const { data, error } = await supabase
    .from("document_vault")
    .select("*")
    .eq("company_id", company.id)
    .order("uploaded_at", { ascending: false });

  return (
    <>
      <PageHeader
        eyebrow="Secure Document Vault"
        title="Document vault"
        description="Compliance certificates, audit reports and evidence for your organisation, ready for instant export when regulators or customers ask."
        actions={
          <Badge variant="success" className="h-8 px-3">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Row-level security enforced
          </Badge>
        }
      />

      {error && (
        <Alert variant="warning">
          <AlertTriangle />
          <AlertTitle>Could not load documents</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <DocumentVault
        companyId={company.id}
        companyName={company.name}
        initialDocuments={data ?? []}
      />
    </>
  );
}
