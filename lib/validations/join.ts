import { z } from "zod";
import { INDUSTRIES, REGULATIONS, TURNOVER_BANDS } from "@/lib/constants";

export const accountSchema = z.object({
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

export const companySchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, "Please enter your company name")
    .max(160, "Company name is too long"),
  industry: z.enum(INDUSTRIES, { error: "Select your industry" }),
  turnoverBand: z.enum(TURNOVER_BANDS, { error: "Select a turnover band" }),
  isAnonymous: z.boolean(),
});

export const painSchema = z.object({
  regulation: z.enum(REGULATIONS, {
    error: "Select the regulation that hurts most",
  }),
  estimatedCostEur: z
    .number({ error: "Enter an estimated annual cost in EUR" })
    .positive("Cost must be greater than zero")
    .max(1_000_000_000_000, "That number looks too large"),
  description: z
    .string()
    .trim()
    .max(1000, "Keep the description under 1,000 characters")
    .optional()
    .or(z.literal("")),
});

export const joinSchema = accountSchema.and(companySchema).and(painSchema);

export type JoinFormValues = z.infer<typeof joinSchema>;

export const STEP_FIELDS: ReadonlyArray<ReadonlyArray<keyof JoinFormValues>> = [
  ["name", "email", "password"],
  ["companyName", "industry", "turnoverBand", "isAnonymous"],
  ["regulation", "estimatedCostEur", "description"],
];

export const signInSchema = z.object({
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  password: z.string().min(1, "Enter your password"),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
