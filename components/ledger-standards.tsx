import { FileCheck2, Scale, ShieldCheck } from "lucide-react";

export const METHODOLOGY_STATEMENT =
  "Grounded in the EU Better Regulation Toolbox (Tool #58: Standard Cost Model) and the OECD Regulatory Compliance Cost Assessment.";

const TIERS = [
  {
    icon: Scale,
    title: "Self-Reported",
    body: "The organisation entered the figure. It is published as submitted and has not been checked against documents.",
  },
  {
    icon: FileCheck2,
    title: "Evidence Supplied",
    body: "Supporting documents are on file. The figure stays in this tier until it is reviewed.",
  },
  {
    icon: ShieldCheck,
    title: "Independently Verified",
    body: "ERBA has reviewed the evidence and confirmed the figure against the stated methodology.",
  },
] as const;

export function MethodologyStatement({ className }: { className?: string }) {
  return <p className={className}>{METHODOLOGY_STATEMENT}</p>;
}

export function VerificationTiers() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {TIERS.map(({ icon: Icon, title, body }) => (
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
  );
}
