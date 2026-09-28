"use server";

import { revalidatePath } from "next/cache";
import { createAdminDataClient, requireAdmin } from "@/lib/admin";
import { signedEvidenceViewUrl } from "@/lib/admin-evidence";

export async function verifyPainSubmission(submissionId: string) {
  await requireAdmin();

  const admin = createAdminDataClient();
  const { data, error } = await admin
    .from("pain_submissions")
    .update({ verification_status: "verified" })
    .eq("id", submissionId)
    .eq("verification_status", "evidence_supplied")
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false as const, message: error.message };
  }

  if (!data) {
    return {
      ok: false as const,
      message: "Only evidence-supplied submissions can be verified.",
    };
  }

  revalidatePath("/admin");
  return { ok: true as const };
}

export async function getEvidenceSignedUrl(evidenceId: string) {
  await requireAdmin();

  const admin = createAdminDataClient();
  const url = await signedEvidenceViewUrl(admin, evidenceId);

  if (!url) {
    return {
      ok: false as const,
      message: "Evidence file is unavailable in the evidence-vault.",
    };
  }

  return { ok: true as const, url };
}
