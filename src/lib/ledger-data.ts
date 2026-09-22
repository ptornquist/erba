import type { PainSubmission, VerificationStatus } from "@/types/database";
import { SCM_TOOL_REFERENCE } from "@/lib/scm";

export type IndustryBurden = {
  industry: string;
  internalAdmin: number;
  externalCompliance: number;
  verificationMix: Record<VerificationStatus, number>;
};

export type LedgerRow = PainSubmission & {
  industry: string;
  companyLabel: string;
};

export const PUBLIC_DOCUMENTED_BURDEN_EUR = 4_200_000_000;
export const PUBLIC_VERIFIED_BURDEN_EUR = 1_100_000_000;

export const INDUSTRY_BURDEN: IndustryBurden[] = [
  {
    industry: "Manufacturing",
    internalAdmin: 620_000_000,
    externalCompliance: 410_000_000,
    verificationMix: {
      self_reported: 540_000_000,
      evidence_supplied: 310_000_000,
      verified: 180_000_000,
    },
  },
  {
    industry: "Chemicals",
    internalAdmin: 390_000_000,
    externalCompliance: 280_000_000,
    verificationMix: {
      self_reported: 320_000_000,
      evidence_supplied: 210_000_000,
      verified: 140_000_000,
    },
  },
  {
    industry: "Energy & Utilities",
    internalAdmin: 340_000_000,
    externalCompliance: 260_000_000,
    verificationMix: {
      self_reported: 290_000_000,
      evidence_supplied: 180_000_000,
      verified: 130_000_000,
    },
  },
  {
    industry: "Automotive & Mobility",
    internalAdmin: 310_000_000,
    externalCompliance: 190_000_000,
    verificationMix: {
      self_reported: 250_000_000,
      evidence_supplied: 150_000_000,
      verified: 100_000_000,
    },
  },
  {
    industry: "Pharmaceuticals",
    internalAdmin: 280_000_000,
    externalCompliance: 210_000_000,
    verificationMix: {
      self_reported: 220_000_000,
      evidence_supplied: 160_000_000,
      verified: 110_000_000,
    },
  },
  {
    industry: "Food & Agri-processing",
    internalAdmin: 210_000_000,
    externalCompliance: 140_000_000,
    verificationMix: {
      self_reported: 180_000_000,
      evidence_supplied: 100_000_000,
      verified: 70_000_000,
    },
  },
  {
    industry: "Financial Services",
    internalAdmin: 180_000_000,
    externalCompliance: 170_000_000,
    verificationMix: {
      self_reported: 160_000_000,
      evidence_supplied: 110_000_000,
      verified: 80_000_000,
    },
  },
  {
    industry: "Construction & Materials",
    internalAdmin: 120_000_000,
    externalCompliance: 90_000_000,
    verificationMix: {
      self_reported: 110_000_000,
      evidence_supplied: 60_000_000,
      verified: 40_000_000,
    },
  },
];

export const SAMPLE_LEDGER: LedgerRow[] = [
  {
    id: "sample-1",
    company_id: "sample-co-1",
    companyLabel: "Mid-market chemicals group",
    industry: "Chemicals",
    regulation_name: "REACH / CLP dossier maintenance",
    description:
      "Annual substance registration updates, SDS authoring, and internal hazard classification workflow.",
    internal_admin_cost_eur: 420_000,
    external_compliance_cost_eur: 310_000,
    estimated_cost_eur: 730_000,
    verification_status: "verified",
    scm_tool_reference: SCM_TOOL_REFERENCE,
  },
  {
    id: "sample-2",
    company_id: "sample-co-2",
    companyLabel: "Precision manufacturer (anonymous)",
    industry: "Manufacturing",
    regulation_name: "CSRD double-materiality reporting",
    description:
      "In-house ESG data collection plus external assurance and legal review of the sustainability statement.",
    internal_admin_cost_eur: 280_000,
    external_compliance_cost_eur: 190_000,
    estimated_cost_eur: 470_000,
    verification_status: "evidence_supplied",
    scm_tool_reference: SCM_TOOL_REFERENCE,
  },
  {
    id: "sample-3",
    company_id: "sample-co-3",
    companyLabel: "Food processor",
    industry: "Food & Agri-processing",
    regulation_name: "Official Controls Regulation traceability",
    description:
      "Lot-level documentation, laboratory retainers, and staff time for competent-authority inspections.",
    internal_admin_cost_eur: 155_000,
    external_compliance_cost_eur: 88_000,
    estimated_cost_eur: 243_000,
    verification_status: "self_reported",
    scm_tool_reference: SCM_TOOL_REFERENCE,
  },
  {
    id: "sample-4",
    company_id: "sample-co-4",
    companyLabel: "Regional energy supplier",
    industry: "Energy & Utilities",
    regulation_name: "EU ETS MRV and CBAM transitional reporting",
    description:
      "Internal emissions accounting plus specialised verifier and counsel for cross-border filings.",
    internal_admin_cost_eur: 510_000,
    external_compliance_cost_eur: 360_000,
    estimated_cost_eur: 870_000,
    verification_status: "verified",
    scm_tool_reference: SCM_TOOL_REFERENCE,
  },
];

export function filterLedger(
  rows: LedgerRow[],
  mode: "all" | "backed",
): LedgerRow[] {
  if (mode === "all") {
    return rows;
  }

  return rows.filter(
    (row) =>
      row.verification_status === "evidence_supplied" ||
      row.verification_status === "verified",
  );
}

export function industrySplit(
  mode: "all" | "backed",
): Array<{
  industry: string;
  internalAdmin: number;
  externalCompliance: number;
  total: number;
}> {
  return INDUSTRY_BURDEN.map((row) => {
    const backedShare =
      (row.verificationMix.evidence_supplied + row.verificationMix.verified) /
      (row.internalAdmin + row.externalCompliance);
    const factor = mode === "all" ? 1 : backedShare;

    const internalAdmin = Math.round(row.internalAdmin * factor);
    const externalCompliance = Math.round(row.externalCompliance * factor);

    return {
      industry: row.industry,
      internalAdmin,
      externalCompliance,
      total: internalAdmin + externalCompliance,
    };
  });
}
