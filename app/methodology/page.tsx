import type { Metadata } from "next";
import { BookOpen, Landmark, Scale } from "lucide-react";
import { VerificationTiers } from "@/components/ledger-standards";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How ERBA measures the cumulative cost of European regulation and classifies every figure as Self-Reported, Evidence Supplied, or Independently Verified.",
};

const FRAMEWORKS = [
  {
    icon: BookOpen,
    title: "EU Better Regulation Toolbox",
    body: "Cost figures follow Chapter 8, Tool #58 — the EU Standard Cost Model. The model isolates the administrative and compliance activity a regulation requires, then prices that activity from time, fees and systems rather than from opinion.",
  },
  {
    icon: Landmark,
    title: "OECD Regulatory Compliance Cost Assessment",
    body: "The same boundary is used in the OECD Regulatory Compliance Cost Assessment: only costs caused by the regulatory obligation are counted, and they are separated from ordinary business activity.",
  },
  {
    icon: Scale,
    title: "EESC Regulatory Burden Index",
    body: "ERBA also draws on the European Economic and Social Committee Regulatory Burden Index. A single rule is not the whole burden. The ledger is built to show cumulative effects and the extra complexity that appears when the same obligation crosses borders.",
  },
] as const;

const COST_ITEMS = [
  {
    title: "Internal staff time",
    body: "Hours that employees spend on reporting, record-keeping and other compliance work required by the regulation.",
  },
  {
    title: "External legal and consulting fees",
    body: "Invoices for lawyers, auditors and consultants engaged to interpret or meet the obligation.",
  },
  {
    title: "Dedicated IT and system costs",
    body: "Software, implementation and maintenance bought specifically to collect, report or store the information the regulation demands.",
  },
] as const;

export default function MethodologyPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-grid">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,51,153,0.12),transparent_60%)]"
        />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:py-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Data standards
          </p>
          <h1 className="mt-3 text-balance text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Methodology
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            The rules ERBA uses to collect a compliance cost and to decide how
            far that figure can be relied upon.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Our approach
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Measure the toll. Do not argue it.
        </h2>
        <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
          <p>
            ERBA exists to measure, objectively, the cumulative financial toll
            of European regulation on mid-market industry. The public record is
            a ledger of costs, not a statement of political preference.
          </p>
          <p>
            Each contribution is an annual figure attached to a named
            obligation. Read together, those figures describe what the stock of
            rules costs firms that sit between the smallest enterprises and the
            largest groups — the part of the economy for which a cumulative
            total is still largely unknown.
          </p>
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Established frameworks
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Built on methods that already exist.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              ERBA does not invent a private definition of regulatory cost. The
              methodology is grounded in the EU Better Regulation Toolbox,
              specifically Chapter 8, Tool #58 — the EU Standard Cost Model —
              and in the OECD Regulatory Compliance Cost Assessment.
            </p>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {FRAMEWORKS.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Defining compliance costs
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          What a figure is allowed to contain.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          ERBA measures the annual cost of complying with a specific European
          obligation. Businesses are asked to include three categories, and to
          leave ordinary commercial spending out.
        </p>
        <ol className="mt-8 space-y-4">
          {COST_ITEMS.map(({ title, body }, index) => (
            <li
              key={title}
              className="flex gap-5 rounded-xl border border-border bg-card p-6"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary font-mono text-sm font-bold text-primary">
                0{index + 1}
              </span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Data verification tiers
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Three levels of data integrity.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Every published figure is labelled with one tier. A higher tier
              is not a larger number. It is a stronger claim about how the
              number was checked.
            </p>
          </div>
          <div className="mt-10">
            <VerificationTiers />
          </div>
          <div className="mt-8 max-w-3xl space-y-4 text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">Self-Reported</span>{" "}
              means the organisation entered the figure itself. It is shown as
              submitted.
            </p>
            <p>
              <span className="font-semibold text-foreground">
                Evidence Supplied
              </span>{" "}
              means documentation has been provided securely to ERBA and is
              held for review. The file is not published.
            </p>
            <p>
              <span className="font-semibold text-foreground">
                Independently Verified
              </span>{" "}
              means ERBA has reviewed that evidence and confirmed the figure
              against this methodology.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
