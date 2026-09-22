import { z } from "zod";

export const forumPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(12, "Share a little more detail — at least 12 characters")
    .max(2000, "Keep posts under 2,000 characters"),
});
export type ForumPostFormValues = z.infer<typeof forumPostSchema>;

export const complianceTaskSchema = z.object({
  task_description: z
    .string()
    .trim()
    .min(6, "Describe the obligation in a few words")
    .max(240, "Keep task descriptions under 240 characters"),
});
export type ComplianceTaskFormValues = z.infer<typeof complianceTaskSchema>;

export const ALLOWED_DOCUMENT_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "csv",
  "png",
  "jpg",
  "jpeg",
  "zip",
] as const;

export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;

export const documentUploadSchema = z.object({
  file_name: z
    .string()
    .trim()
    .min(1, "Choose a file to upload")
    .max(200, "File name is too long")
    .refine((name) => {
      const ext = name.split(".").pop()?.toLowerCase() ?? "";
      return (ALLOWED_DOCUMENT_EXTENSIONS as readonly string[]).includes(ext);
    }, `Allowed types: ${ALLOWED_DOCUMENT_EXTENSIONS.join(", ")}`),
  size_bytes: z
    .number()
    .int()
    .nonnegative()
    .max(MAX_DOCUMENT_BYTES, "Files must be 25 MB or smaller"),
});
export type DocumentUploadValues = z.infer<typeof documentUploadSchema>;
