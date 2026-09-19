import { INDIVIDUAL_INDUSTRY, SITE_FULL_NAME, SITE_URL } from "@/lib/constants";

export interface ObjectionLetterInput {
  companyName: string;
  industry?: string | null;
  turnoverBand?: string | null;
  estimatedCostEur?: number | null;
  signatoryName?: string | null;
}

const eur = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/** Builds the plain-text CSRD objection letter offered in the War Room. */
export function buildCsrdObjectionLetter(input: ObjectionLetterInput): string {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const costLine =
    input.estimatedCostEur && input.estimatedCostEur > 0
      ? `Our internal estimate places the annual cost of CSRD compliance for ${input.companyName} at approximately ${eur.format(input.estimatedCostEur)} — resources diverted from investment, hiring and R&D.`
      : `Our internal assessment shows that CSRD compliance consumes a disproportionate share of finance and legal capacity at ${input.companyName} — resources diverted from investment, hiring and R&D.`;

  const isIndividual = input.industry === INDIVIDUAL_INDUSTRY;
  const profileLine = [
    input.industry && !isIndividual ? `operating in ${input.industry}` : null,
    input.turnoverBand && !isIndividual
      ? `with annual turnover in the ${input.turnoverBand} band`
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  return [
    `${input.companyName}`,
    `${today}`,
    ``,
    `To: The European Commission, Directorate-General for Financial Stability, Financial Services and Capital Markets Union (DG FISMA)`,
    `Cc: Members of the European Parliament, ECON and JURI Committees; National Ministry of Economic Affairs`,
    ``,
    `Subject: Formal objection to the cumulative reporting burden imposed by the Corporate Sustainability Reporting Directive (CSRD)`,
    ``,
    `Dear Commissioner,`,
    ``,
    `I write on behalf of ${input.companyName}, ${isIndividual ? "a European resident" : "a European company"}${profileLine ? ` ${profileLine}` : ""}, and as a member of the ${SITE_FULL_NAME}.`,
    ``,
    `We support transparent, comparable sustainability information. We do not support a regime whose reporting obligations now exceed, in staff hours and external fees, the value of the information produced. ${costLine}`,
    ``,
    `Specifically, we object to:`,
    ``,
    `1. The scale of the European Sustainability Reporting Standards (ESRS), which require assessment of more than one thousand data points before materiality can even be determined;`,
    `2. The double-materiality assessment methodology, which in practice demands consultancy support that mid-caps cannot absorb without cutting productive investment;`,
    `3. The mandatory limited-assurance requirement, which has created a seller's market for audit services and materially increased our external costs;`,
    `4. The trickle-down effect on smaller suppliers in our value chain, who are being asked for CSRD-grade data despite being formally out of scope;`,
    `5. The interaction with overlapping instruments (EU Taxonomy, CSDDD, EUDR, CBAM), each of which is assessed in isolation but paid for cumulatively.`,
    ``,
    `We therefore request that the Commission:`,
    ``,
    `a) Raise the CSRD applicability threshold so that companies below 1,000 employees are permanently exempt, not merely deferred;`,
    `b) Cap ESRS data points for wave-two companies at a materially reduced core set;`,
    `c) Suspend the assurance requirement until a functioning, competitive assurance market exists;`,
    `d) Publish a cumulative cost assessment of all Green Deal reporting obligations before any further reporting acts are adopted.`,
    ``,
    `Europe's competitiveness depends on companies like ours having the capacity to compete, not merely to report. We ask that this objection be formally recorded in the Commission's simplification review.`,
    ``,
    `Yours faithfully,`,
    ``,
    `${input.signatoryName ?? "[Name]"}`,
    `Chief Executive Officer, ${input.companyName}`,
    `Member, ${SITE_FULL_NAME}`,
    `${SITE_URL}`,
    ``,
  ].join("\n");
}
