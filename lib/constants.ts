export const SITE_NAME = "ERBA";
export const SITE_FULL_NAME = "European Regulatory Burden Alliance";
export const SITE_DOMAIN = "euregburden.org";
export const SITE_URL = `https://${SITE_DOMAIN}`;

export const SOCIAL_LINKS = [
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/eureg-burden-alliance",
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61584326527776",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/erba.416/",
  },
  {
    id: "x",
    label: "X",
    href: "https://x.com/EuErba20698",
  },
] as const;

export type SocialNetwork = (typeof SOCIAL_LINKS)[number]["id"];

export const MEMBER_TYPES = ["company", "individual"] as const;
export type MemberType = (typeof MEMBER_TYPES)[number];

/** Stored for private members so company columns stay populated without a form. */
export const INDIVIDUAL_INDUSTRY = "Private individual";
export const INDIVIDUAL_TURNOVER = "Private individual";

export const REFERRALS_TO_UNLOCK = 5;

export const INDUSTRIES = [
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

export const TURNOVER_BANDS = [
  "€10M – €50M",
  "€50M – €150M",
  "€150M – €500M",
  "€500M – €1B",
  "€1B – €5B",
  "€5B+",
] as const;

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
