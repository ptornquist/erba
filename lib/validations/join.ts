import { z } from "zod";
import {
  COMPANY_INDUSTRIES,
  MEMBER_TYPES,
  PAIN_COST_MAX_EUR,
  PAIN_COST_MIN_EUR,
  REGULATIONS,
  TURNOVER_BANDS,
  type MemberType,
} from "@/lib/constants";

type Translate = (key: string) => string;

function optionalCost(t: Translate) {
  return z
    .number({ error: t("cost") })
    .min(PAIN_COST_MIN_EUR, t("costRange"))
    .max(PAIN_COST_MAX_EUR, t("costRange"))
    .optional();
}

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

  const membershipSchema = z
    .object({
      memberType: z.enum(MEMBER_TYPES, { error: t("memberType") }),
      companyName: z.string(),
      industry: z.string().optional(),
      turnoverBand: z.string().optional(),
      isAnonymous: z.boolean(),
    })
    .superRefine((data, ctx) => {
      if (data.memberType !== "company") return;

      if (data.companyName.trim().length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["companyName"],
          message: t("companyName"),
        });
      } else if (data.companyName.trim().length > 160) {
        ctx.addIssue({
          code: "custom",
          path: ["companyName"],
          message: t("companyLong"),
        });
      }

      if (
        !data.industry ||
        !(COMPANY_INDUSTRIES as readonly string[]).includes(data.industry)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["industry"],
          message: t("industry"),
        });
      }

      if (
        !data.turnoverBand ||
        !(TURNOVER_BANDS as readonly string[]).includes(data.turnoverBand)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["turnoverBand"],
          message: t("turnover"),
        });
      }
    });

  const painSchema = z
    .object({
      regulation: z
        .union([z.enum(REGULATIONS), z.literal("")])
        .optional(),
      estimatedCostEur: optionalCost(t),
      description: z
        .string()
        .trim()
        .max(1000, t("descriptionLong"))
        .optional()
        .or(z.literal("")),
    })
    .superRefine((data, ctx) => {
      const hasRegulation = Boolean(data.regulation);
      const hasCost = typeof data.estimatedCostEur === "number";
      const hasDescription = Boolean(data.description?.trim());
      if (!hasRegulation && !hasCost && !hasDescription) return;

      if (!hasRegulation) {
        ctx.addIssue({
          code: "custom",
          path: ["regulation"],
          message: t("regulation"),
        });
      }
      if (!hasCost) {
        ctx.addIssue({
          code: "custom",
          path: ["estimatedCostEur"],
          message: t("cost"),
        });
      }
    });

  return accountSchema.and(membershipSchema).and(painSchema);
}

export type JoinFormValues = z.infer<ReturnType<typeof createJoinSchema>>;

const ACCOUNT_FIELDS = ["name", "email", "password"] as const;
const COMPANY_FIELDS = [
  "memberType",
  "companyName",
  "industry",
  "turnoverBand",
  "isAnonymous",
] as const;
const INDIVIDUAL_FIELDS = ["memberType", "isAnonymous"] as const;
const PAIN_FIELDS = ["regulation", "estimatedCostEur", "description"] as const;

export function stepFields(
  step: number,
  memberType?: MemberType,
): (keyof JoinFormValues)[] {
  if (step === 0) return [...ACCOUNT_FIELDS];
  if (step === 1) {
    if (memberType === "individual") return [...INDIVIDUAL_FIELDS];
    if (memberType === "company") return [...COMPANY_FIELDS];
    return ["memberType"];
  }
  return [...PAIN_FIELDS];
}

export function hasPainContribution(values: Pick<
  JoinFormValues,
  "regulation" | "estimatedCostEur"
>): boolean {
  return (
    Boolean(values.regulation) &&
    typeof values.estimatedCostEur === "number" &&
    Number.isFinite(values.estimatedCostEur)
  );
}

export function createSignInSchema(t: Translate) {
  return z.object({
    email: z.email(t("email")).trim().toLowerCase(),
    password: z.string().min(1, t("passwordRequired")),
  });
}

export type SignInFormValues = z.infer<ReturnType<typeof createSignInSchema>>;
