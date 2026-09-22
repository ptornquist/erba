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

async function loadReviewQueue(): Promise<AdminReviewRow[]> {
  const admin = createAdminDataClient();
  const [companiesResult, submissionsResult, vaultResult] = await Promise.all([
    admin.from("companies").select("id, name, industry"),
    admin
      .from("pain_submissions")
      .select(
        "id, company_id, regulation_name, estimated_cost_eur, verification_status",
      ),
    admin
      .from("document_vault")
      .select("id, company_id, pain_submission_id, file_name"),
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
      const evidence = documents.filter(
        (file) =>
          file.company_id === submission.company_id &&
          (file.pain_submission_id == null ||
            file.pain_submission_id === submission.id),
      );

      return {
        id: submission.id,
        companyName: company?.name ?? "Unknown company",
        industry: company?.industry ?? "—",
        regulationName: submission.regulation_name,
        estimatedCostEur: Number(submission.estimated_cost_eur),
        verificationStatus: status,
        evidence: evidence.map((file) => ({
          id: file.id,
          fileName: file.file_name,
        })),
      };
    })
    .sort(
      (left, right) =>
        STATUS_RANK[left.verificationStatus] -
          STATUS_RANK[right.verificationStatus] ||
        right.estimatedCostEur - left.estimatedCostEur,
    );
}
