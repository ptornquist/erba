"use client";

import { useState } from "react";
import { Check, Download, Siren } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  buildCsrdObjectionLetter,
  type ObjectionLetterInput,
} from "@/lib/objection-letter";

interface BurdenAlertCardProps {
  letterInput: ObjectionLetterInput;
}

export function BurdenAlertCard({ letterInput }: BurdenAlertCardProps) {
  const [downloaded, setDownloaded] = useState(false);

  function handleDownload() {
    const letter = buildCsrdObjectionLetter(letterInput);
    const blob = new Blob([letter], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const safeName = letterInput.companyName
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
    anchor.href = url;
    anchor.download = `ERBA-CSRD-Objection-Letter-${safeName || "company"}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 3000);
  }

  return (
    <Card className="relative overflow-hidden border-primary/40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(239,59,47,0.18),transparent_55%)]"
      />
      <CardHeader className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="destructive" className="uppercase tracking-wider">
            <Siren className="size-3.5" aria-hidden="true" />
            Burden Alert
          </Badge>
          <Badge variant="outline">Priority: High</Badge>
          <span className="text-xs text-muted-foreground">Updated this week</span>
        </div>
        <CardTitle className="mt-3 text-2xl">
          CSRD Wave 2: 1,100+ data points hit mid-caps this reporting cycle
        </CardTitle>
        <CardDescription className="text-base">
          The Corporate Sustainability Reporting Directive now applies to large
          non-listed companies. The European Sustainability Reporting Standards
          require a double-materiality assessment across 12 topical standards
          before a single disclosure can be scoped out.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Avg. first-year cost" value="€320k" />
          <Stat label="Avg. FTEs consumed" value="2.4" />
          <Stat label="Assurance fee uplift" value="+38%" />
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The Commission&apos;s Omnibus simplification review is open for input.
          Members who file a formal objection now are on record before the
          Parliament vote. Your letter is pre-filled with your company details
          and ERBA&apos;s five core demands. Download it, sign it, and send it to
          DG FISMA and your national MEPs.
        </p>
      </CardContent>
      <CardFooter className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button size="lg" onClick={handleDownload} className="w-full sm:w-auto">
          {downloaded ? (
            <>
              <Check />
              Letter downloaded
            </>
          ) : (
            <>
              <Download />
              Download 1-Click Objection Letter
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          Plain-text format · Editable · Addressed to DG FISMA
        </p>
      </CardFooter>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-4">
      <p className="font-mono text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
