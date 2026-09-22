"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VerificationBadge } from "@/components/verification-badge";
import {
  SAMPLE_LEDGER,
  filterLedger,
  industrySplit,
} from "@/lib/ledger-data";
import { formatCompactEuro, formatEuro } from "@/lib/scm";

type Mode = "all" | "backed";

export function PainIndexClient() {
  const [mode, setMode] = useState<Mode>("all");
  const rows = useMemo(() => filterLedger(SAMPLE_LEDGER, mode), [mode]);
  const split = useMemo(() => industrySplit(mode), [mode]);
  const maxTotal = Math.max(...split.map((row) => row.total), 1);
  const combinedInternal = split.reduce((sum, row) => sum + row.internalAdmin, 0);
  const combinedExternal = split.reduce(
    (sum, row) => sum + row.externalCompliance,
    0,
  );

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={mode === "all" ? "default" : "outline"}
          onClick={() => setMode("all")}
        >
          All Reported Data
        </Button>
        <Button
          type="button"
          variant={mode === "backed" ? "default" : "outline"}
          onClick={() => setMode("backed")}
        >
          Verified &amp; Evidence-Backed Data Only
        </Button>
        <Badge variant="outline" className="ml-auto h-8 border-white/15 text-white/60">
          {mode === "all" ? "Includes self-reported observations" : "Excludes unverified rows"}
        </Badge>
      </div>

      <section className="grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-2">
        <div className="bg-[#121826] px-6 py-6">
          <p className="text-[11px] tracking-[0.2em] text-white/45 uppercase">
            Internal admin overhead
          </p>
          <p className="font-heading mt-2 text-3xl text-[#c4b38a]">
            {formatCompactEuro(combinedInternal)}
          </p>
        </div>
        <div className="bg-[#121826] px-6 py-6">
          <p className="text-[11px] tracking-[0.2em] text-white/45 uppercase">
            External consultant / legal fees
          </p>
          <p className="font-heading mt-2 text-3xl text-[#c4b38a]">
            {formatCompactEuro(combinedExternal)}
          </p>
        </div>
      </section>

      <Card className="border-white/10 bg-[#121826] text-[#ece7dc] ring-white/10">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            SCM breakdown by industry
          </CardTitle>
          <CardDescription className="text-white/55">
            Internal administrative labour versus external counsel, auditors,
            and dedicated compliance tooling.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex gap-4 text-[11px] tracking-[0.14em] text-white/45 uppercase">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-sm bg-[#c4b38a]" />
              Internal
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-sm bg-sky-500/80" />
              External
            </span>
          </div>
          {split.map((row) => (
            <div key={row.industry} className="grid gap-1.5">
              <div className="flex items-baseline justify-between text-sm">
                <span>{row.industry}</span>
                <span className="text-white/45">{formatEuro(row.total)}</span>
              </div>
              <div className="flex h-3 overflow-hidden rounded-sm bg-white/8">
                <div
                  className="bg-[#c4b38a]"
                  style={{ width: `${(row.internalAdmin / maxTotal) * 100}%` }}
                />
                <div
                  className="bg-sky-500/80"
                  style={{ width: `${(row.externalCompliance / maxTotal) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-[#121826] text-[#ece7dc] ring-white/10">
        <CardHeader>
          <CardTitle>Ledger excerpt</CardTitle>
          <CardDescription className="text-white/55">
            Company identities remain masked where contributors elected
            anonymity.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {rows.map((row) => (
            <article
              key={row.id}
              className="grid gap-2 rounded-lg border border-white/10 px-4 py-4 md:grid-cols-[1fr_auto] md:items-center"
            >
              <div>
                <p className="text-sm font-medium">{row.regulation_name}</p>
                <p className="mt-1 text-xs text-white/45">
                  {row.companyLabel} · {row.industry} · Combined{" "}
                  {formatEuro(row.estimated_cost_eur)}
                </p>
              </div>
              <VerificationBadge status={row.verification_status} />
            </article>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
