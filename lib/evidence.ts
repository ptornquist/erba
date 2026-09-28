export const EVIDENCE_BUCKET = "evidence-vault";

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
