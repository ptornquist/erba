import type { SupabaseClient } from "@supabase/supabase-js";
import { getErrorMessage } from "@/lib/errors";
import { EVIDENCE_BUCKET, evidenceObjectPath } from "@/lib/evidence";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export type EvidenceUploadResult =
  | { ok: true; path: string }
  | { ok: false; message: string };

function isUploadFile(value: unknown): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "size" in value &&
    "name" in value &&
    "arrayBuffer" in value &&
    typeof (value as File).arrayBuffer === "function" &&
    typeof (value as File).size === "number" &&
    typeof (value as File).name === "string"
  );
}

function storageFailureMessage(err: unknown): string {
  const raw = getErrorMessage(err, "Storage upload failed.");
  if (/bucket not found/i.test(raw)) {
    return "The evidence-vault bucket is missing. Create it in Supabase Storage and try again.";
  }
  if (/row-level security|not allowed|unauthorized|403/i.test(raw)) {
    return "You do not have permission to upload to the evidence-vault. Sign in and try again.";
  }
  if (/payload too large|exceeded|entity too large|413/i.test(raw)) {
    return "That file is too large for the evidence-vault. Use a smaller PDF or image.";
  }
  return `Could not upload to evidence-vault: ${raw}`;
}

/**
 * Uploads bytes to evidence-vault and refuses to continue unless Storage
 * returns an object path. Callers must not write Postgres metadata until this
 * returns `{ ok: true }`.
 */
export async function uploadEvidenceToVault(
  client: Client,
  userId: string,
  file: File,
): Promise<EvidenceUploadResult> {
  if (!isUploadFile(file) || file.size <= 0) {
    return { ok: false, message: "Choose a file to upload." };
  }

  const path = evidenceObjectPath(userId, file.name);
  const bytes = await file.arrayBuffer();
  const body = new Blob([bytes], {
    type: file.type || "application/octet-stream",
  });

  const upload = await client.storage.from(EVIDENCE_BUCKET).upload(path, body, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "application/octet-stream",
  });

  if (upload.error) {
    return { ok: false, message: storageFailureMessage(upload.error) };
  }

  const storedPath = upload.data?.path;
  if (!storedPath) {
    return {
      ok: false,
      message:
        "Storage did not return a file path. The evidence-vault upload failed.",
    };
  }

  const verify = await client.storage
    .from(EVIDENCE_BUCKET)
    .createSignedUrl(storedPath, 30);

  if (verify.error || !verify.data?.signedUrl) {
    return {
      ok: false,
      message:
        "The file did not land in the evidence-vault. No database record was saved.",
    };
  }

  return { ok: true, path: storedPath };
}
