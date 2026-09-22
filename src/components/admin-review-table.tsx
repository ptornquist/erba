"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VerificationBadge } from "@/components/verification-badge";
import { verifyPainSubmission } from "@/app/admin/actions";
import { formatEuro } from "@/lib/scm";
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

export function AdminReviewTable({ rows }: { rows: AdminReviewRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-[#121826]">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="text-white/45">Company</TableHead>
            <TableHead className="text-white/45">Regulation</TableHead>
            <TableHead className="text-right text-white/45">SCM cost</TableHead>
            <TableHead className="text-white/45">Status</TableHead>
            <TableHead className="text-white/45">Evidence</TableHead>
            <TableHead className="text-right text-white/45">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableCell colSpan={6} className="py-10 text-center text-white/45">
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
  const awaitingReview = row.verificationStatus === "evidence_supplied";

  function verify() {
    startTransition(async () => {
      const result = await verifyPainSubmission(row.id);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(`${row.companyName} marked ERBA Verified.`);
    });
  }

  return (
    <TableRow className="border-white/10 hover:bg-white/3">
      <TableCell>
        <p className="font-medium text-[#f4efe4]">{row.companyName}</p>
        <p className="text-xs text-white/45">{row.industry}</p>
      </TableCell>
      <TableCell className="max-w-56 text-white/80">{row.regulationName}</TableCell>
      <TableCell className="text-right tabular-nums text-[#c4b38a]">
        {formatEuro(row.estimatedCostEur)}
      </TableCell>
      <TableCell>
        <VerificationBadge status={row.verificationStatus} />
      </TableCell>
      <TableCell>
        {row.evidence.length === 0 ? (
          <span className="text-xs text-white/35">None on file</span>
        ) : (
          <div className="flex flex-col items-start gap-1">
            {row.evidence.map((file) => (
              <a
                key={file.id}
                href={`/admin/evidence/${file.id}`}
                className="text-xs text-sky-300 underline-offset-2 hover:underline"
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
