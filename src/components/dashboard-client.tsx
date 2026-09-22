"use client";

import { useEffect, useRef, useState } from "react";
import { FileLock2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VerificationBadge } from "@/components/verification-badge";
import { SAMPLE_LEDGER } from "@/lib/ledger-data";
import {
  COMPANY_STORAGE_KEY,
  formatEuro,
  toPainSubmission,
} from "@/lib/scm";
import { getSupabase } from "@/lib/supabase";
import type { PainSubmission } from "@/types/database";

type SessionState = {
  companyId: string;
  companyName: string;
  submissions: PainSubmission[];
};

export function DashboardClient() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem("erba.session");
    if (raw) {
      setSession(JSON.parse(raw) as SessionState);
      return;
    }

    const companyId = window.localStorage.getItem(COMPANY_STORAGE_KEY);
    if (!companyId) {
      setSession({
        companyId: "demo",
        companyName: "Sample mid-market contributor",
        submissions: SAMPLE_LEDGER,
      });
      return;
    }

    void loadFromSupabase(companyId).then((rows) => {
      setSession({
        companyId,
        companyName: "Your company",
        submissions: rows.length > 0 ? rows : SAMPLE_LEDGER,
      });
    });
  }, []);

  async function markEvidenceSupplied(submissionId: string) {
    setUploadingId(submissionId);
    const supabase = getSupabase();

    if (supabase && session && session.companyId !== "demo") {
      await supabase
        .from("pain_submissions")
        .update({ verification_status: "evidence_supplied" })
        .eq("id", submissionId);
    }

    setSession((current) => {
      if (!current) {
        return current;
      }

      const next = {
        ...current,
        submissions: current.submissions.map((row) =>
          row.id === submissionId
            ? { ...row, verification_status: "evidence_supplied" as const }
            : row,
        ),
      };
      window.localStorage.setItem("erba.session", JSON.stringify(next));
      return next;
    });
    setUploadingId(null);
  }

  const submissions = session?.submissions ?? [];

  return (
    <div className="grid gap-8">
      <Card className="border-white/10 bg-[#121826] text-[#ece7dc] ring-white/10">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            SCM submissions
          </CardTitle>
          <CardDescription className="text-white/55">
            {session?.companyName ?? "Loading"} — three-tier verification
            status for each information obligation.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {submissions.map((row) => (
            <article
              key={row.id}
              className="flex flex-col gap-3 rounded-lg border border-white/10 px-4 py-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm font-medium">{row.regulation_name}</p>
                <p className="mt-1 max-w-xl text-xs leading-5 text-white/50">
                  {row.description}
                </p>
                <p className="mt-2 text-xs text-white/40">
                  Internal {formatEuro(row.internal_admin_cost_eur)} · External{" "}
                  {formatEuro(row.external_compliance_cost_eur)} · Combined{" "}
                  {formatEuro(row.estimated_cost_eur)}
                </p>
              </div>
              <VerificationBadge status={row.verification_status} />
            </article>
          ))}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-[#121826] text-[#ece7dc] ring-white/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md border border-[#c4b38a]/30 text-[#c4b38a]">
              <FileLock2 className="size-4" />
            </span>
            <div>
              <CardTitle>Secure Document Vault</CardTitle>
              <CardDescription className="text-white/55">
                Evidence remains private. Only the resulting verification tier
                is published.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="rounded-lg border border-[#c4b38a]/25 bg-[#c4b38a]/8 px-4 py-4 text-sm leading-6 text-[#ece7dc]">
            Upgrade Your Data Credibility: Upload compliance invoices, internal
            audit logs, or legal retainers to move your submission from
            Self-Reported to Evidence Supplied.
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              ref={fileInputRef}
              type="file"
              className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm file:mr-3 file:border-0 file:bg-transparent file:text-[#c4b38a]"
              onChange={() => {
                const firstSelfReported = submissions.find(
                  (row) => row.verification_status === "self_reported",
                );
                if (firstSelfReported) {
                  void markEvidenceSupplied(firstSelfReported.id);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              disabled={!submissions.some((row) => row.verification_status === "self_reported")}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-4" />
              {uploadingId ? "Attaching…" : "Attach evidence"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function loadFromSupabase(companyId: string): Promise<PainSubmission[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("pain_submissions")
    .select("*")
    .eq("company_id", companyId);

  return (data ?? []).map(toPainSubmission);
}
