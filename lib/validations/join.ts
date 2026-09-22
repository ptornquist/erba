import { z } from "zod";
import {
  INDUSTRIES,
  MEMBER_TYPES,
  REGULATIONS,
  TURNOVER_BANDS,
  type MemberType,
} from "@/lib/constants";

const accountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(120, "Name is too long"),
  email: z.email("Enter a valid work email address").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long")
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

const membershipSchema = z
  .object({
    memberType: z.enum(MEMBER_TYPES, {
      error: "Choose whether you are joining as a company or an individual",
    }),
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
        message: "Please enter your company name",
      });
    } else if (data.companyName.trim().length > 160) {
      ctx.addIssue({
        code: "custom",
        path: ["companyName"],
        message: "Company name is too long",
      });
    }

    if (
      !data.industry ||
      !(INDUSTRIES as readonly string[]).includes(data.industry)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["industry"],
        message: "Select your industry",
      });
    }

    if (
      !data.turnoverBand ||
      !(TURNOVER_BANDS as readonly string[]).includes(data.turnoverBand)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["turnoverBand"],
        message: "Select a turnover band",
      });
    }
  });

const painSchema = z
  .object({
    regulation: z.union([z.enum(REGULATIONS), z.literal("")]).optional(),
    estimatedCostEur: z
      .number({ error: "Enter an estimated annual cost in EUR" })
      .positive("Cost must be greater than zero")
      .max(1_000_000_000_000, "That number looks too large")
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, "Keep the description under 1,000 characters")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const hasRegulation = Boolean(data.regulation);
    const hasCost =
      typeof data.estimatedCostEur === "number" &&
      Number.isFinite(data.estimatedCostEur);
    const hasDescription = Boolean(data.description?.trim());
    if (!hasRegulation && !hasCost && !hasDescription) return;

    if (!hasRegulation) {
      ctx.addIssue({
        code: "custom",
        path: ["regulation"],
        message: "Select the regulation that hurts most",
      });
    }
    if (!hasCost) {
      ctx.addIssue({
        code: "custom",
        path: ["estimatedCostEur"],
        message: "Enter an estimated annual cost in EUR",
      });
    }
  });

export const joinSchema = accountSchema.and(membershipSchema).and(painSchema);

export type JoinFormValues = z.infer<typeof joinSchema>;

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

export function hasPainContribution(
  values: Pick<JoinFormValues, "regulation" | "estimatedCostEur">,
): boolean {
  return (
    Boolean(values.regulation) &&
    typeof values.estimatedCostEur === "number" &&
    Number.isFinite(values.estimatedCostEur)
  );
}

export const signInSchema = z.object({
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  password: z.string().min(1, "Enter your password"),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
