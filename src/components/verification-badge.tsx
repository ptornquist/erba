import { BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { VerificationStatus } from "@/types/database";

const LABELS: Record<VerificationStatus, string> = {
  self_reported: "Self-Reported",
  evidence_supplied: "Evidence Supplied",
  verified: "ERBA Verified",
};

export function VerificationBadge({
  status,
}: {
  status: VerificationStatus;
}) {
  if (status === "verified") {
    return (
      <Badge className="h-6 gap-1 border border-emerald-400/40 bg-emerald-500/15 px-2.5 text-emerald-300">
        <BadgeCheck className="size-3.5" />
        {LABELS[status]}
      </Badge>
    );
  }

  if (status === "evidence_supplied") {
    return (
      <Badge
        variant="outline"
        className="h-6 border-sky-400/70 bg-sky-500/5 px-2.5 text-sky-300"
      >
        {LABELS[status]}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="h-6 border-amber-400/70 bg-amber-500/5 px-2.5 text-amber-300"
    >
      {LABELS[status]}
    </Badge>
  );
}
