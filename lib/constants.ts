export const SITE_NAME = "ERBA";
export const SITE_FULL_NAME = "European Regulatory Burden Alliance";
export const SITE_DOMAIN = "euregburden.org";
export const SITE_URL = `https://${SITE_DOMAIN}`;
export const CONTACT_EMAIL = `contact@${SITE_DOMAIN}`;

export const REFERRALS_TO_UNLOCK = 5;

export const MEMBER_TYPES = ["company", "individual"] as const;
export type MemberType = (typeof MEMBER_TYPES)[number];

export const COMPANY_INDUSTRIES = [
  "Manufacturing",
  "Agriculture & Food",
  "Automotive",
  "Chemicals",
  "Construction",
  "Energy & Utilities",
  "Logistics & Transport",
  "Retail & Wholesale",
  "Textiles & Apparel",
  "Technology & Software",
  "Pharma & Medical Devices",
  "Financial Services",
  "Other",
] as const;

export const INDIVIDUAL_INDUSTRY = "Private individual";
export const INDIVIDUAL_TURNOVER = "Private individual";

export const INDUSTRIES = [
  ...COMPANY_INDUSTRIES,
  INDIVIDUAL_INDUSTRY,
] as const;

export const TURNOVER_BANDS = [
  "€10M – €50M",
  "€50M – €150M",
  "€150M – €500M",
  "€500M – €1B",
  "€1B – €5B",
  "€5B+",
] as const;

/** Per-submission Pain Index scale shown on join and the public index. */
export const PAIN_COST_MIN_EUR = 0;
export const PAIN_COST_MAX_EUR = 1_000_000;
export const PAIN_COST_STEP_EUR = 1_000;

export const REGULATIONS = [
  "CSRD",
  "Supply Chain Act",
  "Deforestation",
  "Other",
] as const;

export const REGULATION_LABELS: Record<(typeof REGULATIONS)[number], string> =
  {
    CSRD: "CSRD (Corporate Sustainability Reporting Directive)",
    "Supply Chain Act": "Supply Chain Act (CSDDD)",
    Deforestation: "Deforestation Regulation (EUDR)",
    Other: "Other",
  };

/** Hardcoded momentum figures for the landing page. */
export const MOMENTUM_STATS = {
  companiesJoined: 5243,
  documentedCostsLabel: "€4.2B",
} as const;
