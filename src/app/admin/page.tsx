import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminReviewTable, type AdminReviewRow } from "@/components/admin-review-table";
import { SiteFrame } from "@/components/site-frame";
import { createAdminDataClient } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { VerificationStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "ERBA Admin Review",
  robots: { index: false, follow: false },
};

const STATUS_RANK: Record<VerificationStatus, number> = {
  evidence_supplied: 0,
  self_reported: 1,
  verified: 2,
};

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/join");
  }

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
    <SiteFrame>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-12">
        <p className="text-[11px] tracking-[0.28em] text-[#c4b38a]">
          CORE REVIEW DESK
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-heading text-4xl text-[#f4efe4]">Admin review</h1>
          <p className="text-xs text-white/40">{user.email}</p>
        </div>
        <p className="mt-3 mb-8 max-w-2xl text-sm leading-6 text-white/55">
          Evidence-supplied submissions are listed first. The review queue
          loads only after profiles.is_admin is confirmed for this session.
        </p>
        {loadError ? (
          <p className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {loadError}
          </p>
        ) : (
          <AdminReviewTable rows={rows} />
        )}
      </main>
    </SiteFrame>
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
      const evidence = documents.filter(
        (file) =>
          file.company_id === submission.company_id &&
          (file.pain_submission_id === null ||
            file.pain_submission_id === submission.id),
      );

      return {
        id: submission.id,
        companyName: company?.name ?? "Unknown company",
        industry: company?.industry ?? "—",
        regulationName: submission.regulation_name,
        estimatedCostEur: Number(submission.estimated_cost_eur),
        verificationStatus: submission.verification_status,
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
