import { z } from "zod";
import { INDUSTRIES, REGULATIONS, TURNOVER_BANDS } from "@/lib/constants";

type Translate = (key: string) => string;

export function createJoinSchema(t: Translate) {
  const accountSchema = z.object({
    name: z
      .string()
      .trim()
      .min(2, t("fullName"))
      .max(120, t("nameLong")),
    email: z.email(t("email")).trim().toLowerCase(),
    password: z
      .string()
      .min(8, t("passwordShort"))
      .max(72, t("passwordLong"))
      .regex(/[A-Za-z]/, t("passwordLetter"))
      .regex(/[0-9]/, t("passwordNumber")),
  });

  const companySchema = z.object({
    companyName: z
      .string()
      .trim()
      .min(2, t("companyName"))
      .max(160, t("companyLong")),
    industry: z.enum(INDUSTRIES, { error: t("industry") }),
    turnoverBand: z.enum(TURNOVER_BANDS, { error: t("turnover") }),
    isAnonymous: z.boolean(),
  });

  const painSchema = z.object({
    regulation: z.enum(REGULATIONS, {
      error: t("regulation"),
    }),
    estimatedCostEur: z
      .number({ error: t("cost") })
      .positive(t("costPositive"))
      .max(1_000_000_000_000, t("costLarge")),
    description: z
      .string()
      .trim()
      .max(1000, t("descriptionLong"))
      .optional()
      .or(z.literal("")),
  });

  return accountSchema.and(companySchema).and(painSchema);
}

export type JoinFormValues = z.infer<ReturnType<typeof createJoinSchema>>;

export const STEP_FIELDS: ReadonlyArray<ReadonlyArray<keyof JoinFormValues>> = [
  ["name", "email", "password"],
  ["companyName", "industry", "turnoverBand", "isAnonymous"],
  ["regulation", "estimatedCostEur", "description"],
];

export function createSignInSchema(t: Translate) {
  return z.object({
    email: z.email(t("email")).trim().toLowerCase(),
    password: z.string().min(1, t("passwordRequired")),
  });
}

export type SignInFormValues = z.infer<ReturnType<typeof createSignInSchema>>;
