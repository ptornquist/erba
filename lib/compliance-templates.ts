import { INDIVIDUAL_INDUSTRY, INDUSTRIES } from "@/lib/constants";

type Industry = (typeof INDUSTRIES)[number];

/**
 * Baseline obligations every EU mid-cap faces regardless of sector.
 * Provisioned for a company the first time it opens the checklist.
 */
const GENERAL_TASKS: readonly string[] = [
  "Confirm CSRD scope status after Omnibus I threshold change (1,000+ employees)",
  "Complete double-materiality assessment or document rationale for exemption",
  "Map tier-1 suppliers for CSDDD due-diligence readiness",
  "Appoint a GDPR Data Protection Officer or document why one is not required",
  "Register beneficial ownership under AMLD6 in the national UBO register",
  "Review EU Taxonomy eligibility for turnover, CapEx and OpEx KPIs",
  "Publish gender pay-gap report under the Pay Transparency Directive (150+ employees)",
  "Verify Whistleblower Directive reporting channel is in place and communicated",
];

const INDUSTRY_TASKS: Partial<Record<Industry, readonly string[]>> = {
  Manufacturing: [
    "Assess CBAM exposure for imported steel, aluminium and cement inputs",
    "Prepare Ecodesign for Sustainable Products (ESPR) digital product passport plan",
    "Update REACH substance registrations and SVHC communications",
    "Review Machinery Regulation 2023/1230 conformity requirements",
  ],
  "Agriculture & Food": [
    "File EUDR due-diligence statements for soy, cattle, cocoa, coffee and palm oil",
    "Verify Farm-to-Fork pesticide reduction reporting obligations",
    "Update Nutri-Score / front-of-pack labelling compliance",
    "Check Nature Restoration Law land-use implications",
  ],
  Automotive: [
    "Prepare Battery Regulation passport and carbon-footprint declarations",
    "Verify Euro 7 emissions type-approval timeline for affected models",
    "Assess End-of-Life Vehicles Regulation recycled-content quotas",
    "Confirm CBAM impact on imported steel and aluminium components",
  ],
  Chemicals: [
    "Complete REACH revision impact assessment (mixtures assessment factor)",
    "Review PFAS universal restriction proposal exposure",
    "Update CLP hazard classifications for new endocrine-disruptor classes",
    "Assess Industrial Emissions Directive 2.0 permit changes",
  ],
  Construction: [
    "Prepare Construction Products Regulation (CPR) digital product passports",
    "Assess Energy Performance of Buildings Directive renovation obligations",
    "Verify CBAM certificate requirements for imported cement and steel",
    "Review Construction & Demolition Waste recycled-content targets",
  ],
  "Energy & Utilities": [
    "Confirm Methane Regulation measurement, reporting and verification plan",
    "Assess Hydrogen and Decarbonised Gas Package unbundling rules",
    "Review Renewable Energy Directive III permitting acceleration areas",
    "Prepare Network Code on Cybersecurity (NCCS) compliance evidence",
  ],
  "Logistics & Transport": [
    "Register in EU ETS2 for road transport fuel emissions",
    "Prepare CountEmissionsEU freight carbon-accounting methodology",
    "Verify Mobility Package driver posting and cabotage compliance",
    "Assess Weights & Dimensions Directive changes for zero-emission fleets",
  ],
  "Retail & Wholesale": [
    "Prepare Packaging & Packaging Waste Regulation (PPWR) reuse targets",
    "Verify Right-to-Repair Directive spare-parts obligations",
    "Update Green Claims Directive substantiation for environmental marketing",
    "Assess EUDR obligations for wood, paper and cocoa products sold",
  ],
  "Textiles & Apparel": [
    "Plan ESPR textile digital product passport and unsold-goods destruction ban",
    "Set up Extended Producer Responsibility scheme registrations by Member State",
    "Verify Forced Labour Regulation supply-chain evidence",
    "Assess Waste Framework Directive textile-collection obligations",
  ],
  "Technology & Software": [
    "Classify AI systems under the AI Act and prepare conformity documentation",
    "Assess Cyber Resilience Act obligations for products with digital elements",
    "Verify Data Act B2B data-sharing and cloud-switching requirements",
    "Confirm NIS2 registration and incident-reporting readiness",
  ],
  "Pharma & Medical Devices": [
    "Complete MDR / IVDR transition for legacy devices before deadline",
    "Assess EU Pharma Package regulatory data-protection changes",
    "Verify European Health Data Space secondary-use obligations",
    "Update Urban Wastewater Treatment Directive EPR contributions",
  ],
  "Financial Services": [
    "Complete DORA ICT third-party register and resilience testing",
    "Verify SFDR entity- and product-level disclosures",
    "Assess MiCA licensing requirements for crypto-asset services",
    "Prepare Instant Payments Regulation verification-of-payee",
  ],
  "Private individual": [
    "Check whether any organisation you own, advise or work for falls in CSRD or CSDDD scope after Omnibus I",
    "Review GDPR data-subject rights for personal data you hold as a private person",
    "Confirm beneficial-ownership reporting if you control a company or foundation",
    "Document personal due-diligence steps if you trade goods covered by EUDR or CBAM",
  ],
};

export function getChecklistTemplate(industry: string): string[] {
  const sectorTasks = INDUSTRY_TASKS[industry as Industry] ?? [];
  if (industry === INDIVIDUAL_INDUSTRY) {
    return [...sectorTasks];
  }
  return [...sectorTasks, ...GENERAL_TASKS];
}
