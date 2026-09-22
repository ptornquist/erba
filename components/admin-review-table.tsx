"use client";

import { useState, useTransition } from "react";
import { verifyPainSubmission } from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatEur } from "@/lib/utils";
import type { VerificationStatus } from "@/types/database";

export type AdminReviewRow = {
  id: string;
  companyName: string;
  industry: string;
  regulationName: string;
  estimatedCostEur: number;
  verificationStatus: VerificationStatus;
  evidence: Array<{ id: string; fileName: string }>;
};

const STATUS_LABEL: Record<VerificationStatus, string> = {
  self_reported: "Self-reported",
  evidence_supplied: "Evidence supplied",
  verified: "ERBA verified",
};

const STATUS_VARIANT: Record<
  VerificationStatus,
  "outline" | "warning" | "success"
> = {
  self_reported: "outline",
  evidence_supplied: "warning",
  verified: "success",
};

export function AdminReviewTable({ rows }: { rows: AdminReviewRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Regulation</TableHead>
            <TableHead className="text-right">SCM cost</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Evidence</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                No submissions in the review queue.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => <ReviewRow key={row.id} row={row} />)
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function ReviewRow({ row }: { row: AdminReviewRow }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const awaitingReview = row.verificationStatus === "evidence_supplied";

  function verify() {
    setMessage(null);
    startTransition(async () => {
      const result = await verifyPainSubmission(row.id);
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      setMessage("Marked ERBA verified.");
    });
  }

  return (
    <TableRow>
      <TableCell>
        <p className="font-medium text-foreground">{row.companyName}</p>
        <p className="text-xs text-muted-foreground">{row.industry}</p>
      </TableCell>
      <TableCell className="max-w-56">{row.regulationName}</TableCell>
      <TableCell className="text-right font-medium tabular-nums text-primary">
        {formatEur(row.estimatedCostEur)}
      </TableCell>
      <TableCell>
        <Badge variant={STATUS_VARIANT[row.verificationStatus]}>
          {STATUS_LABEL[row.verificationStatus]}
        </Badge>
        {message && (
          <p className="mt-1 max-w-40 text-xs text-muted-foreground">{message}</p>
        )}
      </TableCell>
      <TableCell>
        {row.evidence.length === 0 ? (
          <span className="text-xs text-muted-foreground">None on file</span>
        ) : (
          <div className="flex flex-col items-start gap-1">
            {row.evidence.map((file) => (
              <a
                key={file.id}
                href={`/admin/evidence/${file.id}`}
                className="text-xs font-medium text-primary underline-offset-2 hover:underline"
              >
                {file.fileName}
              </a>
            ))}
          </div>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Button
          type="button"
          size="sm"
          disabled={!awaitingReview || pending}
          onClick={verify}
        >
          {pending ? "Verifying…" : "Verify Data"}
        </Button>
      </TableCell>
    </TableRow>
  );
}
