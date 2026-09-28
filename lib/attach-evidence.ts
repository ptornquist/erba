import type { SupabaseClient } from "@supabase/supabase-js";
import {
  EVIDENCE_BUCKET,
  evidenceObjectPath,
  isAllowedEvidenceFile,
} from "@/lib/evidence";
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
  if (!isAllowedEvidenceFile(params.file)) {
    throw new Error(
      "Upload a PDF or image (PNG, JPG, WEBP, GIF) of up to 10 MB.",
    );
  }

  const path = evidenceObjectPath(params.userId, params.file.name);
  const { error: uploadError } = await supabase.storage
    .from(EVIDENCE_BUCKET)
    .upload(path, params.file, {
      cacheControl: "3600",
      upsert: false,
      contentType: params.file.type || undefined,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { error: updateError } = await supabase
    .from("pain_submissions")
    .update({
      evidence_path: path,
      evidence_file_name: params.file.name,
      verification_status: "evidence_supplied",
    })
    .eq("id", params.submissionId)
    .eq("verification_status", "self_reported");

  if (updateError) {
    throw updateError;
  }

  const { error: vaultError } = await supabase.from("document_vault").insert({
    company_id: params.companyId,
    pain_submission_id: params.submissionId,
    file_name: params.file.name,
    storage_path: path,
    file_url: path,
  });

  if (vaultError) {
    console.warn("document_vault insert skipped", vaultError.message);
  }

  return path;
}
