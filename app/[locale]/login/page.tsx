import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Loader2 } from "lucide-react";
import { SignInForm } from "@/components/join/sign-in-form";
import { loadLocale } from "@/i18n/load-locale";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await loadLocale(params);
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("loginTitle"),
    description: t("loginDescription"),
  };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await loadLocale(params);
  const t = await getTranslations({ locale, namespace: "login" });

  return (
    <section className="relative flex-1 overflow-hidden bg-grid py-12 sm:py-16 lg:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,51,153,0.12),transparent_55%)]"
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-16 lg:px-8">
        <div className="lg:sticky lg:top-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 text-balance text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">{t("lead")}</p>
        </div>

        <Suspense
          fallback={
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-border bg-card">
              <Loader2
                className="size-6 animate-spin text-muted-foreground"
                aria-label={t("submitting")}
              />
            </div>
          }
        >
          <SignInForm />
        </Suspense>
      </div>
    </section>
  );
}
