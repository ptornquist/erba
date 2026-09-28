"use server";

import { revalidatePath } from "next/cache";
import { documentUploadSchema } from "@/lib/validations/dashboard";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { uploadEvidenceToVault } from "@/lib/upload-evidence";
import type { DocumentVaultItem } from "@/types/database";

export async function uploadVaultDocument(formData: FormData): Promise<
  | { ok: true; document: DocumentVaultItem }
  | { ok: false; message: string }
> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Sign in again to upload documents." };
  }

  const companyId = String(formData.get("companyId") ?? "");
  const file = formData.get("file");

  if (!companyId) {
    return { ok: false, message: "Missing company for this upload." };
  }

  if (!(file instanceof Blob)) {
    return { ok: false, message: "Choose a file to upload." };
  }

  const uploadFile = file as File;
  const parsed = documentUploadSchema.safeParse({
    file_name: uploadFile.name || "document",
    size_bytes: uploadFile.size,
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid file",
    };
  }

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("id", companyId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!company) {
    return {
      ok: false,
      message: "You can only upload documents for your own company.",
    };
  }

  const uploaded = await uploadEvidenceToVault(supabase, user.id, uploadFile);
  if (!uploaded.ok) {
    return uploaded;
  }

  const { data, error } = await supabase
    .from("document_vault")
    .insert({
      company_id: companyId,
      file_name: parsed.data.file_name,
      file_url: uploaded.path,
      storage_path: uploaded.path,
    })
    .select("*")
    .single();

  if (error || !data) {
    return {
      ok: false,
      message:
        error?.message ??
        "The file is in evidence-vault, but the database record could not be saved.",
    };
  }

  revalidatePath("/dashboard/vault");
  return { ok: true, document: data };
}
