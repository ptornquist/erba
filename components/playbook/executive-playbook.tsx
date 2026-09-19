import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  Crosshair,
  Shield,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

const LINK_CLASS =
  "font-semibold text-[#ffcc00] underline decoration-[#ffcc00]/40 underline-offset-4 transition-colors hover:text-[#ffe066] hover:decoration-[#ffe066]";

function BriefLink({
  href,
  children,
}: {
  href: "/pain-index" | "/dashboard" | "/dashboard/policy" | "/dashboard/checklists" | "/dashboard/vault";
  children: ReactNode;
}) {
  return (
    <Link href={href} className={LINK_CLASS} prefetch={href.startsWith("/dashboard") ? false : undefined}>
      {children}
    </Link>
  );
}

type RowKind = "action" | "task" | "impact";

const ROW_STYLES: Record<
  RowKind,
  { label: string; accent: string; bar: string }
> = {
  action: {
    label: "action",
    accent: "text-[#ffcc00]",
    bar: "border-[#ffcc00]",
  },
  task: {
    label: "task",
    accent: "text-sky-300",
    bar: "border-sky-400",
  },
  impact: {
    label: "impact",
    accent: "text-emerald-300",
    bar: "border-emerald-400",
  },
};

function ScanRow({
  kind,
  label,
  children,
}: {
  kind: RowKind;
  label: string;
  children: ReactNode;
}) {
  const style = ROW_STYLES[kind];
  return (
    <div
      className={`grid gap-2 border-l-2 pl-4 sm:grid-cols-[6.5rem_1fr] sm:items-start sm:gap-6 ${style.bar}`}
    >
      <p
        className={`text-[11px] font-bold uppercase tracking-[0.2em] ${style.accent}`}
      >
        {label}
      </p>
      <div className="text-sm leading-relaxed text-zinc-200 sm:text-base">
        {children}
      </div>
    </div>
  );
}

type Phase = {
  n: string;
  icon: LucideIcon;
  titleKey: "phase1Title" | "phase2Title" | "phase3Title";
  timeKey: "phase1Time" | "phase2Time" | "phase3Time";
  action: ReactNode;
  task: ReactNode;
  impact: ReactNode;
};

export async function ExecutivePlaybook() {
  const t = await getTranslations("playbook");

  const phases: Phase[] = [
    {
      n: "01",
      icon: Target,
      titleKey: "phase1Title",
      timeKey: "phase1Time",
      action: t.rich("phase1Action", {
        pain: (chunks) => <BriefLink href="/pain-index">{chunks}</BriefLink>,
      }),
      task: t("phase1Task"),
      impact: t("phase1Impact"),
    },
    {
      n: "02",
      icon: Shield,
      titleKey: "phase2Title",
      timeKey: "phase2Time",
      action: t("phase2Action"),
      task: t.rich("phase2Task", {
        policy: (chunks) => (
          <BriefLink href="/dashboard/policy">{chunks}</BriefLink>
        ),
        checklists: (chunks) => (
          <BriefLink href="/dashboard/checklists">{chunks}</BriefLink>
        ),
      }),
      impact: t.rich("phase2Impact", {
        vault: (chunks) => (
          <BriefLink href="/dashboard/vault">{chunks}</BriefLink>
        ),
      }),
    },
    {
      n: "03",
      icon: Users,
      titleKey: "phase3Title",
      timeKey: "phase3Time",
      action: t.rich("phase3Action", {
        war: (chunks) => <BriefLink href="/dashboard">{chunks}</BriefLink>,
      }),
      task: t("phase3Task"),
      impact: t("phase3Impact"),
    },
  ];

  return (
    <div className="relative isolate flex flex-1 flex-col overflow-hidden bg-[#05070d] text-zinc-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(255_204_0/0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_204_0/0.04)_1px,transparent_1px)] bg-[size:56px_56px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(255,204,0,0.12),transparent_58%)]"
      />

      <article className="relative mx-auto w-full max-w-5xl flex-1 px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <header className="border-b border-white/10 pb-12 sm:pb-16">
          <p className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ffcc00]">
            <Crosshair className="size-3.5" aria-hidden="true" />
            {t("eyebrow")}
          </p>
          <h1 className="mt-5 max-w-4xl text-balance text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-7xl lg:leading-[0.95]">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-medium tracking-tight text-[#ffcc00] sm:text-2xl">
            {t("subtitle")}
          </p>
          <p className="mt-8 max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg">
            {t("lead")}
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg">
            {t("leadCommand")}
          </p>
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
            {t("classification")}
          </p>
        </header>

        <ol className="relative mt-14 space-y-6 sm:mt-16 sm:space-y-8">
          <div
            aria-hidden="true"
            className="absolute bottom-8 left-[1.35rem] top-8 hidden w-px bg-gradient-to-b from-[#ffcc00] via-white/20 to-emerald-400 sm:left-[1.6rem] md:block"
          />
          {phases.map((phase) => {
            const Icon = phase.icon;
            return (
              <li key={phase.n} className="relative md:pl-20">
                <span className="mb-4 flex size-11 items-center justify-center rounded-full border border-[#ffcc00]/50 bg-[#0c1018] font-mono text-sm font-bold text-[#ffcc00] shadow-[0_0_24px_-6px_rgba(255,204,0,0.7)] md:absolute md:left-0 md:top-8 md:mb-0 md:size-12">
                  {phase.n}
                </span>
                <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)] sm:p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                        {t("phaseLabel", { n: phase.n.replace(/^0/, "") })}
                      </p>
                      <h2 className="mt-2 flex items-center gap-2.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        <Icon
                          className="size-6 shrink-0 text-[#ffcc00] sm:size-7"
                          aria-hidden="true"
                        />
                        {t(phase.titleKey)}
                      </h2>
                    </div>
                    <p className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-zinc-400">
                      {t(phase.timeKey)}
                    </p>
                  </div>

                  <div className="mt-8 space-y-6">
                    <ScanRow kind="action" label={t("action")}>
                      {phase.action}
                    </ScanRow>
                    <ScanRow kind="task" label={t("task")}>
                      {phase.task}
                    </ScanRow>
                    <ScanRow kind="impact" label={t("impact")}>
                      {phase.impact}
                    </ScanRow>
                  </div>
                </section>
              </li>
            );
          })}
        </ol>

        <footer className="mt-16 border-t border-white/10 pt-12 text-center sm:mt-20 sm:pt-16">
          <p className="mx-auto max-w-2xl text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {t("close")}
          </p>
          <ButtonLink
            href="/dashboard"
            prefetch={false}
            size="xl"
            className="mt-10 w-full border-0 bg-[#ffcc00] text-black shadow-[0_0_50px_-8px_rgba(255,204,0,0.65)] hover:bg-[#ffe066] hover:text-black sm:w-auto"
          >
            {t("cta")}
            <ArrowRight aria-hidden="true" />
          </ButtonLink>
        </footer>
      </article>
    </div>
  );
}
