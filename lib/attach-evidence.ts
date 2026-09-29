import type { SupabaseClient } from "@supabase/supabase-js";
import { uploadEvidenceToVault } from "@/lib/upload-evidence";
import { VERIFICATION_TIER } from "@/lib/scm";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export async function attachComplianceEvidence(
  supabase: Client,
  params: {
    userId: string;
    companyId: string;
    submissionId: string;
    file: File;
  },
): Promise<string> {
  const uploaded = await uploadEvidenceToVault(
    supabase,
    params.userId,
    params.file,
  );

  if (!uploaded.ok) {
    throw new Error(uploaded.message);
  }

  const { error: updateError } = await supabase
    .from("pain_submissions")
    .update({
      evidence_path: uploaded.path,
      evidence_file_name: params.file.name,
      verification_status: "evidence_supplied",
    })
    .eq("id", params.submissionId)
    .eq("verification_status", "self_reported");

  if (updateError) {
    throw updateError;
  }

  const { data: costRow } = await supabase
    .from("compliance_costs")
    .select("id, evidence_documents")
    .eq("pain_submission_id", params.submissionId)
    .eq("verification_tier", VERIFICATION_TIER.self_reported)
    .maybeSingle();

  if (costRow) {
    const documents = Array.isArray(costRow.evidence_documents)
      ? costRow.evidence_documents
      : [];
    const { error: costError } = await supabase
      .from("compliance_costs")
      .update({
        verification_tier: VERIFICATION_TIER.evidence_supplied,
        evidence_documents: [...documents, uploaded.path],
      })
      .eq("id", costRow.id)
      .eq("verification_tier", VERIFICATION_TIER.self_reported);
    if (costError) throw costError;
  }

  const { error: vaultError } = await supabase.from("document_vault").insert({
    company_id: params.companyId,
    pain_submission_id: params.submissionId,
    file_name: params.file.name,
    storage_path: uploaded.path,
    file_url: uploaded.path,
  });

  if (vaultError) {
    throw vaultError;
  }

  return uploaded.path;
}
