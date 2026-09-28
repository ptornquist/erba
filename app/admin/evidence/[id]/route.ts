import { NextResponse } from "next/server";
import { createAdminDataClient, requireAdmin } from "@/lib/admin";
import { EVIDENCE_BUCKET } from "@/lib/evidence";

const LEGACY_BUCKET = "document-vault";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await requireAdmin();

  const { id } = await context.params;
  const admin = createAdminDataClient();
  const evidence = await resolveEvidence(admin, id);

  if (!evidence) {
    return new NextResponse("Evidence not found", { status: 404 });
  }

  if (evidence.path.startsWith("http://") || evidence.path.startsWith("https://")) {
    return NextResponse.redirect(evidence.path);
  }

  const signedUrl = await signEvidenceUrl(
    admin,
    evidence.path,
    evidence.fileName,
  );

  if (!signedUrl) {
    return new NextResponse("Evidence file is unavailable", { status: 404 });
  }

  return NextResponse.redirect(signedUrl);
}

async function resolveEvidence(
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

async function signEvidenceUrl(
  admin: ReturnType<typeof createAdminDataClient>,
  path: string,
  fileName: string,
): Promise<string | null> {
  const primary = await admin.storage
    .from(EVIDENCE_BUCKET)
    .createSignedUrl(path, 60, { download: fileName });

  if (!primary.error && primary.data?.signedUrl) {
    return primary.data.signedUrl;
  }

  const legacy = await admin.storage
    .from(LEGACY_BUCKET)
    .createSignedUrl(path, 60, { download: fileName });

  if (!legacy.error && legacy.data?.signedUrl) {
    return legacy.data.signedUrl;
  }

  return null;
}
