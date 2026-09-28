import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  AdminReviewTable,
  type AdminReviewRow,
} from "@/components/admin-review-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { createAdminDataClient } from "@/lib/admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { VerificationStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Admin review",
  robots: { index: false, follow: false },
};

const STATUS_RANK: Record<VerificationStatus, number> = {
  evidence_supplied: 0,
  self_reported: 1,
  verified: 2,
};

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/join");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_admin !== true) {
    redirect("/dashboard");
  }

  let rows: AdminReviewRow[] = [];
  let loadError: string | null = null;

  try {
    rows = await loadReviewQueue();
  } catch (caught) {
    loadError =
      caught instanceof Error
        ? caught.message
        : "Unable to load the review queue.";
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Core review desk"
        title="Admin review"
        description="Evidence-supplied submissions are listed first. The queue loads only after profiles.is_admin is confirmed for this session."
        actions={
          <p className="text-sm text-muted-foreground">{user.email}</p>
        }
      />
      <div className="mt-8">
        {loadError ? (
          <p className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-primary">
            {loadError}
          </p>
        ) : (
          <AdminReviewTable rows={rows} />
        )}
      </div>
    </div>
  );
}

async function loadSubmissions(admin: ReturnType<typeof createAdminDataClient>) {
  const withEvidence = await admin
    .from("pain_submissions")
    .select(
      "id, company_id, regulation_name, estimated_cost_eur, verification_status, evidence_path, evidence_file_name",
    );

  if (!withEvidence.error) {
    return withEvidence;
  }

  return admin
    .from("pain_submissions")
    .select(
      "id, company_id, regulation_name, estimated_cost_eur, verification_status",
    );
}

async function loadVault(admin: ReturnType<typeof createAdminDataClient>) {
  const withLink = await admin
    .from("document_vault")
    .select("id, company_id, pain_submission_id, file_name");

  if (!withLink.error) {
    return withLink;
  }

  return admin.from("document_vault").select("id, company_id, file_name");
}

async function loadReviewQueue(): Promise<AdminReviewRow[]> {
  const admin = createAdminDataClient();
  const [companiesResult, submissionsResult, vaultResult] = await Promise.all([
    admin.from("companies").select("id, name, industry"),
    loadSubmissions(admin),
    loadVault(admin),
  ]);

  const failure =
    companiesResult.error ?? submissionsResult.error ?? vaultResult.error;
  if (failure) {
    throw new Error(failure.message);
  }

  const companies = new Map(
    (companiesResult.data ?? []).map((company) => [company.id, company]),
  );
  const documents = vaultResult.data ?? [];

  return (submissionsResult.data ?? [])
    .map((submission) => {
      const company = companies.get(submission.company_id);
      const status = submission.verification_status ?? "self_reported";
      const vaultFiles = documents.filter((file) => {
        const linkedId =
          "pain_submission_id" in file ? file.pain_submission_id : null;
        return (
          file.company_id === submission.company_id &&
          (linkedId == null || linkedId === submission.id)
        );
      });
      const evidencePath =
        "evidence_path" in submission &&
        typeof submission.evidence_path === "string"
          ? submission.evidence_path
          : null;
      const evidenceFileName =
        "evidence_file_name" in submission &&
        typeof submission.evidence_file_name === "string"
          ? submission.evidence_file_name
          : "View Evidence";
      const evidence: AdminReviewRow["evidence"] =
        vaultFiles.length > 0
          ? vaultFiles.map((file) => ({
              id: file.id,
              fileName: file.file_name,
            }))
          : evidencePath
            ? [
                {
                  id: submission.id,
                  fileName: evidenceFileName,
                },
              ]
            : [];

      return {
        id: submission.id,
        companyName: company?.name ?? "Unknown company",
        industry: company?.industry ?? "—",
        regulationName: submission.regulation_name,
        estimatedCostEur: Number(submission.estimated_cost_eur),
        verificationStatus: status,
        evidence,
      };
    })
    .sort(
      (left, right) =>
        STATUS_RANK[left.verificationStatus] -
          STATUS_RANK[right.verificationStatus] ||
        right.estimatedCostEur - left.estimatedCostEur,
    );
}
