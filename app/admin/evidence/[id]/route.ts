import { NextResponse } from "next/server";
import { createAdminDataClient, requireAdmin } from "@/lib/admin";
import { signedEvidenceViewUrl } from "@/lib/admin-evidence";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await requireAdmin();

  const { id } = await context.params;
  const admin = createAdminDataClient();
  const signedUrl = await signedEvidenceViewUrl(admin, id);

  if (!signedUrl) {
    return new NextResponse("Evidence file is unavailable", { status: 404 });
  }

  return NextResponse.redirect(signedUrl);
}
