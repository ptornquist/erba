import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  BarChart3,
  Euro,
  FileWarning,
  Leaf,
  Ship,
  Tractor,
  UserRound,
  Users,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOMENTUM_STATS } from "@/lib/constants";
import { formatInteger } from "@/lib/utils";
import { loadLocale } from "@/i18n/load-locale";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await loadLocale(params);
  const t = await getTranslations("landing");
  const dateLocale = locale;

  const whyNow = [
    { icon: Tractor, title: t("farmerTitle"), body: t("farmerBody") },
    { icon: Leaf, title: t("greenTitle"), body: t("greenBody") },
    { icon: Ship, title: t("mercosurTitle"), body: t("mercosurBody") },
  ] as const;

  const howItWorks = [
    { icon: UserRound, title: t("step1Title"), body: t("step1Body") },
    { icon: Euro, title: t("step2Title"), body: t("step2Body") },
    { icon: BarChart3, title: t("step3Title"), body: t("step3Body") },
  ] as const;

  return (
    <>
      <section className="relative overflow-hidden bg-grid">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,51,153,0.14),transparent_60%)]"
        />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-24 pt-20 text-center sm:px-6 lg:px-8 lg:pb-32 lg:pt-28">
          <Badge variant="warning" className="mb-6 px-3 py-1 text-xs uppercase tracking-widest">
            <FileWarning className="size-3.5" aria-hidden="true" />
            {t("badge")}
          </Badge>
          <h1 className="max-w-5xl text-balance text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-8xl">
            {t("headlineBefore")}{" "}
            <span className="text-primary">{t("headlineAccent")}</span>
          </h1>
          <p className="mt-8 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl lg:text-2xl">
            {t("subhead")}
          </p>
          <div className="mt-12 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
            <ButtonLink
              href="/join"
              size="xl"
              className="w-full shadow-[0_0_60px_-10px_rgba(0,51,153,0.45)] sm:w-auto"
            >
              {t("ctaJoin")}
              <ArrowRight aria-hidden="true" />
            </ButtonLink>
            <ButtonLink
              href="/pain-index"
              size="xl"
              variant="outline"
              className="w-full sm:w-auto"
            >
              {t("ctaPain")}
            </ButtonLink>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">{t("noFees")}</p>
        </div>
      </section>

      <section
        aria-label="Momentum"
        className="border-y border-primary/40 bg-primary text-primary-foreground"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-white/20 px-4 sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4 py-8 sm:py-10">
            <Users className="size-10 shrink-0 opacity-90" aria-hidden="true" />
            <div>
              <p className="font-mono text-4xl font-black tabular-nums tracking-tight sm:text-5xl">
                {formatInteger(MOMENTUM_STATS.companiesJoined, dateLocale)}
              </p>
              <p className="text-sm font-semibold uppercase tracking-widest opacity-90">
                {t("companiesJoined")}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 py-8 sm:py-10">
            <Euro className="size-10 shrink-0 opacity-90" aria-hidden="true" />
            <div>
              <p className="font-mono text-4xl font-black tabular-nums tracking-tight sm:text-5xl">
                {MOMENTUM_STATS.documentedCostsLabel}
              </p>
              <p className="text-sm font-semibold uppercase tracking-widest opacity-90">
                {t("documentedCosts")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="why-now" className="scroll-mt-20 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              {t("whyNowEyebrow")}
            </p>
            <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              {t("whyNowTitle")}
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">{t("whyNowLead")}</p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {whyNow.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="group relative flex flex-col rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary/60"
              >
                <span className="mb-6 inline-flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-7" aria-hidden="true" />
                </span>
                <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
                <p className="mt-4 leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-card/40 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                {t("howEyebrow")}
              </p>
              <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                {t("howTitle")}
              </h2>
              <p className="mt-5 text-lg text-muted-foreground">{t("howLead")}</p>
              <ButtonLink href="/join" size="lg" className="mt-10">
                {t("howCta")}
                <ArrowRight aria-hidden="true" />
              </ButtonLink>
            </div>

            <ol className="space-y-4">
              {howItWorks.map(({ icon: Icon, title, body }, index) => (
                <li
                  key={title}
                  className="flex gap-5 rounded-xl border border-border bg-background p-6"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary font-mono text-lg font-bold text-primary">
                    0{index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
                      <h3 className="text-lg font-semibold">{title}</h3>
                    </div>
                    <p className="mt-1.5 text-muted-foreground">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-24 lg:py-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,51,153,0.12),transparent_60%)]"
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-balance text-4xl font-black tracking-tight sm:text-6xl">
            {t("closeTitle")}
            <br />
            <span className="text-primary">{t("closeAccent")}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            {t("closeLead", {
              count: formatInteger(MOMENTUM_STATS.companiesJoined, dateLocale),
            })}
          </p>
          <ButtonLink href="/join" size="xl" className="mt-10 w-full sm:w-auto">
            {t("ctaJoin")}
            <ArrowRight aria-hidden="true" />
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
