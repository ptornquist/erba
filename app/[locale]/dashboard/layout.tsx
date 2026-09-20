import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Building2, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { MobileNav, SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { INDUSTRIES } from "@/lib/constants";
import { getDashboardContext } from "@/lib/dashboard";
import { loadLocale } from "@/i18n/load-locale";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await loadLocale(params);
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: { default: t("dashboardTitle"), template: `%s | ERBA` },
    robots: { index: false, follow: false },
  };
}

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = await loadLocale(params);
  const { user, company, fullName } = await getDashboardContext();
  const t = await getTranslations({ locale, namespace: "dashboardNav" });
  const ti = await getTranslations({ locale, namespace: "industries" });

  const industryLabel =
    company?.industry &&
    (INDUSTRIES as readonly string[]).includes(company.industry)
      ? ti(company.industry as (typeof INDUSTRIES)[number])
      : (company?.industry ?? t("completeOnboarding"));

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
                  {company?.name ?? t("noCompany")}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {industryLabel}
                </p>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate text-muted-foreground">
                {fullName ?? user.email}
              </span>
              {company?.is_anonymous ? (
                <Badge variant="secondary">{t("anonymous")}</Badge>
              ) : (
                <Badge variant="success">
                  <ShieldCheck className="size-3" aria-hidden="true" />
                  {t("verified")}
                </Badge>
              )}
            </div>
          </div>

          <SidebarNav />

          <p className="px-3 text-xs leading-relaxed text-muted-foreground">
            {t("rlsNote")}
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
