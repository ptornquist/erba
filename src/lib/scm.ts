import type {
  PainSubmission,
  Tables,
  VerificationStatus,
} from "@/types/database";

export const SCM_TOOL_REFERENCE = "EU Better Regulation Toolbox — Tool #58";

export const COMPANY_STORAGE_KEY = "erba.companyId";

export const INDUSTRIES = [
  "Manufacturing",
  "Chemicals",
  "Energy & Utilities",
  "Food & Agri-processing",
  "Automotive & Mobility",
  "Pharmaceuticals",
  "Financial Services",
  "Construction & Materials",
  "Logistics & Transport",
  "Digital & Telecoms",
] as const;

export const TURNOVER_BANDS = [
  { value: "under_2m", label: "Under €2 million" },
  { value: "from_2m_to_10m", label: "€2–10 million" },
  { value: "from_10m_to_50m", label: "€10–50 million" },
  { value: "over_50m", label: "Over €50 million" },
] as const;

export function parseEuro(value: string): number {
  const normalized = value.replace(/[^\d.,-]/g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function combinedScmCost(
  internalAdminCostEur: number,
  externalComplianceCostEur: number,
): number {
  return roundEuro(internalAdminCostEur + externalComplianceCostEur);
}

export function roundEuro(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatEuro(value: number, fractionDigits = 0): string {
  const sign = value < 0 ? "-" : "";
  const [integerPart, fractionPart] = Math.abs(value)
    .toFixed(fractionDigits)
    .split(".");
  const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const decimals =
    fractionDigits > 0 && fractionPart ? `.${fractionPart}` : "";
  return `${sign}€${grouped}${decimals}`;
}

export function formatCompactEuro(value: number): string {
  if (value >= 1_000_000_000) {
    const billions = value / 1_000_000_000;
    return `€${trimOneDecimal(billions)}B`;
  }

  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `€${trimOneDecimal(millions)}M`;
  }

  return formatEuro(value);
}

function trimOneDecimal(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "");
}

export function generateReferralCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export function toPainSubmission(
  row: Tables<"pain_submissions">,
): PainSubmission {
  return {
    id: row.id,
    company_id: row.company_id,
    regulation_name: row.regulation_name,
    description: row.description,
    internal_admin_cost_eur: Number(row.internal_admin_cost_eur),
    external_compliance_cost_eur: Number(row.external_compliance_cost_eur),
    estimated_cost_eur: Number(row.estimated_cost_eur),
    verification_status: row.verification_status,
    scm_tool_reference: row.scm_tool_reference,
  };
}

export function isEvidenceBacked(status: VerificationStatus): boolean {
  return status === "evidence_supplied" || status === "verified";
}
