"use client";

import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { scmNormalisedCost, VERIFICATION_TIER } from "@/lib/scm";
import type { ComplianceCost } from "@/types/database";

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
  maximumFractionDigits: 0,
});

function parseAmount(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function CostReportingForm({ companyId = "" }: { companyId?: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<CostFormState>(EMPTY_FORM);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const verification_tier = evidenceFile
      ? VERIFICATION_TIER.evidence_supplied
      : VERIFICATION_TIER.self_reported;

    const payload: ComplianceCost = {
      id: crypto.randomUUID(),
      company_id: companyId,
      framework_name: form.framework_name || "Other",
      internal_admin_hours: parseAmount(form.internal_admin_hours),
      average_hourly_wage: parseAmount(form.average_hourly_wage),
      external_consulting_cost: parseAmount(form.external_consulting_cost),
      it_and_system_cost: parseAmount(form.it_and_system_cost),
      capital_cost: parseAmount(form.capital_cost),
      total_reported_cost: totalReportedCost,
      erba_normalised_cost: totalReportedCost,
      verification_tier,
      evidence_documents: evidenceFile ? [evidenceFile.name] : [],
      created_at: new Date().toISOString(),
    };

    console.log("ComplianceCost", payload);
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

      <div className="flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Total Reported Cost
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-blue-900">
            {euro.format(totalReportedCost)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            (Admin Hours × Hourly Wage) + consulting + IT + capital
          </p>
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-md bg-blue-900 px-6 text-sm font-semibold text-white hover:bg-blue-950"
        >
          Submit cost report
        </button>
      </div>
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
