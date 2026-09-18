import type { Metadata } from "next";
import { Building2, ShieldCheck } from "lucide-react";
import { MobileNav, SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getDashboardContext } from "@/lib/dashboard";

export const metadata: Metadata = {
  title: { default: "Member Dashboard", template: "%s | ERBA Dashboard" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const { user, company, fullName } = await getDashboardContext();

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8 lg:px-8 lg:py-8">
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-24 space-y-6">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <Building2 className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {company?.name ?? "No company yet"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {company?.industry ?? "Complete onboarding"}
                </p>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate text-muted-foreground">
                {fullName ?? user.email}
              </span>
              {company?.is_anonymous ? (
                <Badge variant="secondary">Anonymous</Badge>
              ) : (
                <Badge variant="success">
                  <ShieldCheck className="size-3" aria-hidden="true" />
                  Verified
                </Badge>
              )}
            </div>
          </div>

          <SidebarNav />

          <p className="px-3 text-xs leading-relaxed text-muted-foreground">
            Company-scoped data is protected by Postgres row-level security.
            Only members of your organisation can read your tasks and
            documents.
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <MobileNav />
        {children}
      </div>
    </div>
  );
}
