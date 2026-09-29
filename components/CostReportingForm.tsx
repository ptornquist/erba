"use client";

import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { humaniseSupabaseError } from "@/lib/errors";
import { EVIDENCE_BUCKET } from "@/lib/evidence";
import { scmNormalisedCost } from "@/lib/scm";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";

const FRAMEWORKS = ["NIS2", "CSRD", "EU AI Act", "Other"] as const;

type FrameworkName = (typeof FRAMEWORKS)[number];

type CostFormState = {
  framework_name: FrameworkName | "";
  internal_admin_hours: string;
  average_hourly_wage: string;
  external_consulting_cost: string;
  it_and_system_cost: string;
  capital_cost: string;
};

const EMPTY_FORM: CostFormState = {
  framework_name: "",
  internal_admin_hours: "",
  average_hourly_wage: "",
  external_consulting_cost: "",
  it_and_system_cost: "",
  capital_cost: "",
};

const euro = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function parseAmount(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function uniqueEvidenceObjectPath(userId: string, fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  const ext =
    lastDot >= 0
      ? fileName.slice(lastDot + 1).replace(/[^A-Za-z0-9]/g, "")
      : "bin";
  return `${userId}/${Date.now()}.${ext || "bin"}`;
}

export function CostReportingForm({ companyId = "" }: { companyId?: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<CostFormState>(EMPTY_FORM);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const totalReportedCost = useMemo(
    () =>
      scmNormalisedCost({
        internal_admin_hours: parseAmount(form.internal_admin_hours),
        average_hourly_wage: parseAmount(form.average_hourly_wage),
        external_consulting_cost: parseAmount(form.external_consulting_cost),
        it_and_system_cost: parseAmount(form.it_and_system_cost),
        capital_cost: parseAmount(form.capital_cost),
      }),
    [form],
  );

  function updateField(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleEvidenceChange(event: ChangeEvent<HTMLInputElement>) {
    setEvidenceFile(event.target.files?.[0] ?? null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (!isSupabaseConfigured) {
        throw new Error(
          "This deployment is not connected to Supabase yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY and try again.",
        );
      }

      if (!companyId) {
        throw new Error("Register a company first before reporting costs.");
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Sign in to submit cost data to the ledger.");
      }

      const frameworkName = form.framework_name || "Other";
      const internalAdminHours = parseAmount(form.internal_admin_hours);
      const averageHourlyWage = parseAmount(form.average_hourly_wage);
      const externalConsultingCost = parseAmount(form.external_consulting_cost);
      const itAndSystemCost = parseAmount(form.it_and_system_cost);
      const capitalCost = parseAmount(form.capital_cost);
      const internalAdminCostEur = internalAdminHours * averageHourlyWage;
      const externalComplianceCostEur =
        externalConsultingCost + itAndSystemCost + capitalCost;

      let evidencePath: string | null = null;
      if (evidenceFile) {
        setIsUploadingEvidence(true);
        try {
          const objectPath = uniqueEvidenceObjectPath(user.id, evidenceFile.name);
          const { data: uploaded, error: uploadError } = await supabase.storage
            .from(EVIDENCE_BUCKET)
            .upload(objectPath, evidenceFile, {
              cacheControl: "3600",
              upsert: false,
              contentType: evidenceFile.type || "application/octet-stream",
            });

          if (uploadError) throw uploadError;
          evidencePath = uploaded.path;
          if (!evidencePath) {
            throw new Error(
              "Storage did not return a file path. The evidence-vault upload failed.",
            );
          }
        } finally {
          setIsUploadingEvidence(false);
        }
      }

      const verificationTier = evidencePath ? 2 : 1;

      const { data: pain, error: painError } = await supabase
        .from("pain_submissions")
        .insert({
          company_id: companyId,
          regulation_name: frameworkName,
          estimated_cost_eur: totalReportedCost,
          internal_admin_cost_eur: internalAdminCostEur,
          external_compliance_cost_eur: externalComplianceCostEur,
          description: `Standard Cost Model report for ${frameworkName}.`,
          verification_status: evidencePath ? "evidence_supplied" : "self_reported",
        })
        .select("id")
        .single();
      if (painError) throw painError;
      if (!pain?.id) {
        throw new Error("Could not save your Pain Index entry.");
      }

      const { error: costError } = await supabase.from("compliance_costs").insert({
        company_id: companyId,
        pain_submission_id: pain.id,
        framework_name: frameworkName,
        internal_admin_hours: internalAdminHours,
        average_hourly_wage: averageHourlyWage,
        external_consulting_cost: externalConsultingCost,
        it_and_system_cost: itAndSystemCost,
        capital_cost: capitalCost,
        total_reported_cost: totalReportedCost,
        verification_tier: verificationTier,
        evidence_documents: evidencePath ? [evidencePath] : [],
      });
      if (costError) throw costError;

      setForm(EMPTY_FORM);
      setEvidenceFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccessMessage("Cost data successfully submitted to the ledger");
    } catch (error) {
      setIsUploadingEvidence(false);
      setSubmitError(
        humaniseSupabaseError(error, "Could not submit cost data to the ledger."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-xl space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-900">
          EU Standard Cost Model
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Report compliance costs
        </h2>
        <p className="text-sm leading-relaxed text-slate-500">
          Record internal labour, external advice, systems and equipment for one
          regulatory framework.
        </p>
      </div>

      {successMessage ? (
        <div
          className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-semibold text-emerald-900">{successMessage}</p>
        </div>
      ) : null}

      {submitError ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3"
          role="alert"
        >
          <p className="text-sm font-medium text-red-800">{submitError}</p>
        </div>
      ) : null}

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-800">Regulation</span>
        <select
          name="framework_name"
          required
          value={form.framework_name}
          onChange={updateField}
          className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-900/20"
        >
          <option value="" disabled>
            Select a framework
          </option>
          {FRAMEWORKS.map((framework) => (
            <option key={framework} value={framework}>
              {framework}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          name="internal_admin_hours"
          label="Internal Admin Hours"
          unit="hours"
          placeholder="800"
          value={form.internal_admin_hours}
          onChange={updateField}
        />
        <NumberField
          name="average_hourly_wage"
          label="Average Hourly Wage"
          unit="€"
          placeholder="45"
          value={form.average_hourly_wage}
          onChange={updateField}
        />
        <NumberField
          name="external_consulting_cost"
          label="External Consulting & Legal Costs"
          unit="€"
          placeholder="40000"
          value={form.external_consulting_cost}
          onChange={updateField}
        />
        <NumberField
          name="it_and_system_cost"
          label="IT and System Costs"
          unit="€"
          placeholder="15000"
          value={form.it_and_system_cost}
          onChange={updateField}
        />
        <NumberField
          name="capital_cost"
          label="Capital Costs / Equipment"
          unit="€"
          placeholder="0"
          value={form.capital_cost}
          onChange={updateField}
          className="sm:col-span-2"
        />
      </div>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Verification (Optional)
        </h3>
        <p className="text-sm leading-relaxed text-slate-500">
          Uploading evidence such as invoices or time logs upgrades this record
          to Tier 2: Evidence Supplied, which increases trust in the figure.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            id="cost-evidence"
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={handleEvidenceChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Upload evidence
          </button>
          {evidenceFile ? (
            <p className="text-sm text-slate-600">
              {evidenceFile.name}
              <button
                type="button"
                className="ml-2 text-slate-500 underline-offset-2 hover:underline"
                onClick={() => {
                  setEvidenceFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Remove
              </button>
            </p>
          ) : (
            <p className="text-sm text-slate-400">No file selected</p>
          )}
        </div>
      </section>

      <div
        className="rounded-lg border-2 border-blue-900 bg-blue-50 px-5 py-4"
        aria-live="polite"
      >
        <p className="text-sm font-semibold text-blue-900">
          Total Compliance Cost
        </p>
        <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-blue-900">
          {euro.format(totalReportedCost)}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-blue-900/70">
          (Internal Admin Hours × Average Hourly Wage) + External Consulting
          &amp; Legal Costs + IT and System Costs + Capital Costs
        </p>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-11 w-full items-center justify-center rounded-md bg-blue-900 px-6 text-sm font-semibold text-white hover:bg-blue-950 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isUploadingEvidence
          ? "Uploading evidence..."
          : isSubmitting
            ? "Submitting…"
            : "Submit cost report"}
      </button>
    </form>
  );
}

function NumberField({
  name,
  label,
  unit,
  placeholder,
  value,
  onChange,
  className = "",
}: {
  name: keyof CostFormState;
  label: string;
  unit: string;
  placeholder: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-slate-800">{label}</span>
        <span className="text-xs text-slate-400">{unit}</span>
      </span>
      <input
        name={name}
        type="number"
        inputMode="decimal"
        min={0}
        step="any"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 font-mono text-sm text-slate-900 outline-none focus:border-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-900/20"
      />
    </label>
  );
}
