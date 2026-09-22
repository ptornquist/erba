import { NextResponse } from "next/server";
import { createAdminDataClient, requireAdmin } from "@/lib/admin";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await requireAdmin();

  const { id } = await context.params;
  const admin = createAdminDataClient();
  const { data, error } = await admin
    .from("document_vault")
    .select("storage_path, file_name, file_url")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return new NextResponse("Evidence not found", { status: 404 });
  }

  if (data.file_url?.startsWith("http") && !data.storage_path) {
    return NextResponse.redirect(data.file_url);
  }

  if (!data.storage_path) {
    return new NextResponse("Evidence file is unavailable", { status: 404 });
  }

  const signed = await admin.storage
    .from("document-vault")
    .createSignedUrl(data.storage_path, 60, { download: data.file_name });

  if (signed.error || !signed.data) {
    return new NextResponse("Evidence file is unavailable", { status: 404 });
  }

  return NextResponse.redirect(signed.data.signedUrl);
}
