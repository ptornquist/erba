import type { SupabaseClient } from "@supabase/supabase-js";
import {
  EVIDENCE_BUCKET,
  EVIDENCE_SIGNED_URL_TTL_SECONDS,
  LEGACY_EVIDENCE_BUCKET,
  evidenceStoragePath,
  isHttpUrl,
} from "@/lib/evidence";
import type { Database } from "@/types/database";

type StorageClient = Pick<SupabaseClient<Database>, "storage">;

export async function createEvidenceViewUrl(
  client: StorageClient,
  pathOrUrl: string,
  expiresIn = EVIDENCE_SIGNED_URL_TTL_SECONDS,
): Promise<string | null> {
  if (isHttpUrl(pathOrUrl)) {
    return pathOrUrl;
  }

  const objectPath = evidenceStoragePath(pathOrUrl);
  if (!objectPath) {
    return null;
  }

  const primary = await client.storage
    .from(EVIDENCE_BUCKET)
    .createSignedUrl(objectPath, expiresIn);

  if (!primary.error && primary.data?.signedUrl) {
    return primary.data.signedUrl;
  }

  const legacy = await client.storage
    .from(LEGACY_EVIDENCE_BUCKET)
    .createSignedUrl(objectPath, expiresIn);

  if (!legacy.error && legacy.data?.signedUrl) {
    return legacy.data.signedUrl;
  }

  return null;
}
