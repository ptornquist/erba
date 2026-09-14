import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2, Lock, ShieldCheck, Timer } from "lucide-react";
import { JoinFlow } from "@/components/join/join-flow";
import { MOMENTUM_STATS } from "@/lib/constants";
import { formatInteger } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Join Free – Add Your Regulatory Pain",
  description:
    "Register your company and log the annual cost of your worst EU regulatory burden. Anonymous option available.",
};

const ASSURANCES = [
  {
    icon: Timer,
    title: "Two minutes",
    body: "Three short steps. No documents required.",
  },
  {
    icon: Lock,
    title: "Anonymous option",
    body: "Your cost counts; your company name can stay hidden.",
  },
  {
    icon: ShieldCheck,
    title: "Never sold",
    body: "Data is aggregated for advocacy only, never shared with vendors.",
  },
] as const;

export default async function JoinPage(props: PageProps<"/join">) {
  const searchParams = await props.searchParams;
  const initialMode = searchParams.mode === "signin" ? "signin" : "join";

  return (
    <section className="relative flex-1 overflow-hidden bg-grid py-12 sm:py-16 lg:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(239,59,47,0.16),transparent_55%)]"
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:items-start lg:gap-16 lg:px-8">
        <div className="lg:sticky lg:top-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Join the Alliance
          </p>
          <h1 className="mt-3 text-balance text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Put your compliance cost on the record.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            {formatInteger(MOMENTUM_STATS.companiesJoined)} companies have
            already documented{" "}
            <span className="font-semibold text-foreground">
              {MOMENTUM_STATS.documentedCostsLabel}
            </span>{" "}
            in regulatory burden. Every new data point makes the number harder
            to dismiss.
          </p>

          <ul className="mt-10 space-y-5">
            {ASSURANCES.map(({ icon: Icon, title, body }) => (
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
                aria-label="Loading form"
              />
            </div>
          }
        >
          <JoinFlow initialMode={initialMode} />
        </Suspense>
      </div>
    </section>
  );
}
