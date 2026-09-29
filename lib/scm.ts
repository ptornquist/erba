export type VerificationTier = 1 | 2 | 3;

/** Maps Jonas verification tiers to the existing pain_submissions enum. */
export const VERIFICATION_TIER = {
  self_reported: 1,
  evidence_supplied: 2,
  verified: 3,
} as const satisfies Record<string, VerificationTier>;

export function scmNormalisedCost(input: {
  internal_admin_hours: number;
  average_hourly_wage: number;
  external_consulting_cost: number;
  it_and_system_cost: number;
  capital_cost: number;
}): number {
  return (
    input.internal_admin_hours * input.average_hourly_wage +
    input.external_consulting_cost +
    input.it_and_system_cost +
    input.capital_cost
  );
}

export function asNonNegativeNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}
