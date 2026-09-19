import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Loader2, Lock, ShieldCheck, Timer } from "lucide-react";
import { JoinWizard } from "@/components/join/join-wizard";
import { loadLocale } from "@/i18n/load-locale";
import { redirect } from "@/i18n/navigation";
import { MOMENTUM_STATS } from "@/lib/constants";
import { formatInteger } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await loadLocale(params);
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("joinTitle"),
    description: t("joinDescription"),
  };
}

function firstString(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function JoinPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await loadLocale(params);
  const query = await searchParams;

  if (firstString(query.mode) === "signin") {
    const next = firstString(query.next);
    const error = firstString(query.error);
    redirect({
      href: {
        pathname: "/login",
        query: {
          ...(next ? { next } : {}),
          ...(error ? { error } : {}),
        },
      },
      locale,
    });
  }

  const t = await getTranslations("join");
  const assurances = [
    { icon: Timer, title: t("twoMinTitle"), body: t("twoMinBody") },
    { icon: Lock, title: t("anonTitle"), body: t("anonBody") },
    { icon: ShieldCheck, title: t("neverTitle"), body: t("neverBody") },
  ] as const;

  return (
    <section className="relative flex-1 overflow-hidden bg-grid py-12 sm:py-16 lg:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,51,153,0.12),transparent_55%)]"
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:items-start lg:gap-16 lg:px-8">
        <div className="lg:sticky lg:top-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 text-balance text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            {t("lead", {
              count: formatInteger(MOMENTUM_STATS.companiesJoined, locale),
              cost: MOMENTUM_STATS.documentedCostsLabel,
            })}
          </p>

          <ul className="mt-10 space-y-5">
            {assurances.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <Suspense
          fallback={
            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-border bg-card">
              <Loader2
                className="size-6 animate-spin text-muted-foreground"
                aria-label={t("loading")}
              />
            </div>
          }
        >
          <JoinWizard />
        </Suspense>
      </div>
    </section>
  );
}
