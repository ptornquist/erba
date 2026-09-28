import { createAdminDataClient } from "@/lib/admin";
import { createEvidenceViewUrl } from "@/lib/create-evidence-view-url";

export async function resolveAdminEvidence(
  admin: ReturnType<typeof createAdminDataClient>,
  id: string,
): Promise<{ path: string; fileName: string } | null> {
  const vaultById = await admin
    .from("document_vault")
    .select("storage_path, file_name, file_url, pain_submission_id")
    .eq("id", id)
    .maybeSingle();

  if (vaultById.data) {
    const path = vaultById.data.storage_path || vaultById.data.file_url;
    if (path) {
      return { path, fileName: vaultById.data.file_name };
    }
  }

  const vaultBySubmission = await admin
    .from("document_vault")
    .select("storage_path, file_name, file_url")
    .eq("pain_submission_id", id)
    .maybeSingle();

  if (vaultBySubmission.data) {
    const path =
      vaultBySubmission.data.storage_path || vaultBySubmission.data.file_url;
    if (path) {
      return { path, fileName: vaultBySubmission.data.file_name };
    }
  }

  const submission = await admin
    .from("pain_submissions")
    .select("evidence_path, evidence_file_name")
    .eq("id", id)
    .maybeSingle();

  if (submission.data?.evidence_path) {
    return {
      path: submission.data.evidence_path,
      fileName: submission.data.evidence_file_name ?? "compliance-evidence",
    };
  }

  return null;
}

export async function signedEvidenceViewUrl(
  admin: ReturnType<typeof createAdminDataClient>,
  id: string,
): Promise<string | null> {
  const evidence = await resolveAdminEvidence(admin, id);
  if (!evidence) {
    return null;
  }

  return createEvidenceViewUrl(admin, evidence.path);
}
