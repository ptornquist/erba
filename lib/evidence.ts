export const EVIDENCE_BUCKET = "evidence-vault";
export const LEGACY_EVIDENCE_BUCKET = "document-vault";
export const EVIDENCE_SIGNED_URL_TTL_SECONDS = 60 * 5;

export const EVIDENCE_ACCEPT =
  "application/pdf,image/png,image/jpeg,image/webp,image/gif";

export const EVIDENCE_MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

const ALLOWED_EXTENSIONS = new Set(["pdf", "png", "jpg", "jpeg", "webp", "gif"]);

export function evidenceExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export function isAllowedEvidenceFile(file: File): boolean {
  const ext = evidenceExtension(file.name);
  const typeOk = file.type.length === 0 || ALLOWED_TYPES.has(file.type);
  const extOk = ALLOWED_EXTENSIONS.has(ext);
  return typeOk && extOk && file.size > 0 && file.size <= EVIDENCE_MAX_BYTES;
}

export function evidenceObjectPath(userId: string, fileName: string): string {
  const ext = evidenceExtension(fileName) || "bin";
  const safe = fileName.replace(/[^\w.\-]+/g, "_").slice(0, 80);
  return `${userId}/${crypto.randomUUID()}-${safe || `evidence.${ext}`}`;
}

export function isHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

/** Object key in evidence-vault, or null when the value is not a Storage path. */
export function evidenceStoragePath(
  ...candidates: Array<string | null | undefined>
): string | null {
  for (const value of candidates) {
    if (!value) continue;
    if (isHttpUrl(value)) continue;
    if (value.startsWith("vault://")) continue;
    return value;
  }
  return null;
}
