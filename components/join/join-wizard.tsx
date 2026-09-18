"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Euro,
  Loader2,
  MailCheck,
  UserRound,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/form-field";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import {
  INDUSTRIES,
  REGULATIONS,
  REGULATION_LABELS,
  TURNOVER_BANDS,
} from "@/lib/constants";
import {
  joinSchema,
  STEP_FIELDS,
  type JoinFormValues,
} from "@/lib/validations/join";
import { humaniseSupabaseError } from "@/lib/errors";
import { hardNavigate } from "@/lib/navigation";
import { cn, generateReferralCode } from "@/lib/utils";

const STEPS = [
  { title: "Account", description: "Who you are", icon: UserRound },
  { title: "Company", description: "What you run", icon: Building2 },
  { title: "Pain Index", description: "What it costs", icon: Euro },
] as const;

interface JoinWizardProps {
  onSwitchToSignIn: () => void;
}

export function JoinWizard({ onSwitchToSignIn }: JoinWizardProps) {
  const searchParams = useSearchParams();
  const referredBy = searchParams.get("ref")?.trim().toUpperCase() ?? null;
  const nextPath = searchParams.get("next") ?? "/dashboard";

  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  const form = useForm<JoinFormValues>({
    resolver: zodResolver(joinSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      companyName: "",
      industry: undefined,
      turnoverBand: undefined,
      isAnonymous: false,
      regulation: undefined,
      estimatedCostEur: undefined,
      description: "",
    },
  });

  const {
    register,
    handleSubmit,
    trigger,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const isAnonymous = useWatch({ control, name: "isAnonymous" });
  const isLastStep = step === STEPS.length - 1;

  async function goNext() {
    const valid = await trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (valid) {
      setSubmitError(null);
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  }

  function goBack() {
    setSubmitError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(values: JoinFormValues) {
    setSubmitError(null);

    if (!isSupabaseConfigured) {
      setSubmitError(
        "This deployment is not connected to Supabase yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY and try again.",
      );
      return;
    }

    try {
      const supabase = createClient();

      // The full onboarding payload travels with the auth user so the
      // `on_auth_user_created` trigger can provision profile/company/pain rows
      // server-side. That is required when email confirmation is enabled,
      // because the browser has no session (and therefore no RLS rights) yet.
      const onboarding = {
        full_name: values.name,
        company_name: values.companyName,
        industry: values.industry,
        turnover_band: values.turnoverBand,
        is_anonymous: values.isAnonymous,
        regulation_name: values.regulation,
        estimated_cost_eur: values.estimatedCostEur,
        description: values.description ? values.description : null,
        referred_by: referredBy,
      };

      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: onboarding,
            emailRedirectTo:
              typeof window !== "undefined"
                ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
                : undefined,
          },
        });

      if (signUpError) throw signUpError;

      const user = signUpData.user;
      if (!user) {
        throw new Error("Sign-up succeeded but no user was returned.");
      }

      // Supabase returns an obfuscated user with no identities when the email
      // is already registered and confirmation is enabled.
      if (user.identities && user.identities.length === 0) {
        throw new Error(
          "An account with this email already exists. Sign in instead.",
        );
      }

      if (!signUpData.session) {
        // Rows are provisioned by the database trigger; the member unlocks
        // the dashboard once they confirm their email.
        setNeedsEmailConfirmation(true);
        return;
      }

      // Confirmation disabled: we hold a session, so insert directly if the
      // trigger has not already done it (projects without the trigger).
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existingProfile) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: user.id,
          email: values.email,
          referral_code: generateReferralCode(),
          referred_by: referredBy,
        });
        if (profileError) throw profileError;
      }

      const { count: companyCount } = await supabase
        .from("companies")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", user.id);

      if (!companyCount) {
        const { data: company, error: companyError } = await supabase
          .from("companies")
          .insert({
            profile_id: user.id,
            name: values.companyName,
            industry: values.industry,
            turnover_band: values.turnoverBand,
            is_anonymous: values.isAnonymous,
          })
          .select("id")
          .single();
        if (companyError) throw companyError;

        const { error: painError } = await supabase
          .from("pain_submissions")
          .insert({
            company_id: company.id,
            regulation_name: values.regulation,
            estimated_cost_eur: values.estimatedCostEur,
            description: values.description ? values.description : null,
          });
        if (painError) throw painError;
      }

      // Hard navigation so the router cannot reuse a prefetched pre-auth redirect.
      hardNavigate(nextPath);
    } catch (err) {
      console.error("Join submission failed", err);
      setSubmitError(
        humaniseSupabaseError(
          err,
          "Something went wrong while creating your account. Please try again.",
        ),
      );
    }
  }

  if (needsEmailConfirmation) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center sm:p-12">
        <span className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-8" aria-hidden="true" />
        </span>
        <h2 className="text-2xl font-bold tracking-tight">Confirm your email</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Your company and regulatory pain have been recorded. We sent a
          confirmation link to{" "}
          <span className="font-medium text-foreground">
            {form.getValues("email")}
          </span>
          . Click it to unlock your member dashboard.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/pain-index" variant="outline">
            View the Pain Index
          </ButtonLink>
          <Button onClick={onSwitchToSignIn}>I&apos;ve confirmed – sign in</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      <ol className="grid grid-cols-3 border-b border-border" aria-label="Progress">
        {STEPS.map(({ title, description, icon: Icon }, index) => {
          const state =
            index < step ? "complete" : index === step ? "current" : "upcoming";
          return (
            <li
              key={title}
              aria-current={state === "current" ? "step" : undefined}
              className={cn(
                "flex items-center gap-3 border-b-2 px-4 py-4 sm:px-6",
                state === "current" && "border-primary",
                state === "complete" && "border-primary",
                state === "upcoming" && "border-transparent",
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  state === "current" && "bg-primary text-primary-foreground",
                  state === "complete" && "bg-primary text-primary-foreground",
                  state === "upcoming" && "bg-secondary text-muted-foreground",
                )}
              >
                {state === "complete" ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  <Icon className="size-4" aria-hidden="true" />
                )}
              </span>
              <div className="hidden min-w-0 sm:block">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Step {index + 1}
                </p>
                <p className="truncate text-sm font-semibold">{title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-8 p-6 sm:p-8"
      >
        <div className="sm:hidden">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </p>
          <h2 className="text-xl font-bold">{STEPS[step].title}</h2>
        </div>

        {referredBy && step === 0 && (
          <Alert>
            <Check />
            <AlertTitle>Referral applied</AlertTitle>
            <AlertDescription>
              You were invited with code{" "}
              <span className="font-mono font-semibold">{referredBy}</span>.
            </AlertDescription>
          </Alert>
        )}

        {step === 0 && (
          <fieldset className="space-y-5">
            <legend className="sr-only">Account details</legend>
            <FormField id="name" label="Full name" error={errors.name?.message}>
              <Input
                id="name"
                autoComplete="name"
                placeholder="Maria Schneider"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
            </FormField>
            <FormField
              id="email"
              label="Work email"
              error={errors.email?.message}
              hint="We never publish email addresses."
            >
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="ceo@yourcompany.eu"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
            </FormField>
            <FormField
              id="password"
              label="Password"
              error={errors.password?.message}
              hint="At least 8 characters, including a letter and a number."
            >
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                aria-invalid={Boolean(errors.password)}
                {...register("password")}
              />
            </FormField>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset className="space-y-5">
            <legend className="sr-only">Company details</legend>
            <FormField
              id="companyName"
              label="Company name"
              error={errors.companyName?.message}
            >
              <Input
                id="companyName"
                autoComplete="organization"
                placeholder="Schneider Präzisionstechnik GmbH"
                aria-invalid={Boolean(errors.companyName)}
                {...register("companyName")}
              />
            </FormField>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="industry"
                label="Industry"
                error={errors.industry?.message}
              >
                <Select
                  id="industry"
                  defaultValue=""
                  placeholder="Select industry"
                  aria-invalid={Boolean(errors.industry)}
                  {...register("industry")}
                >
                  {INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField
                id="turnoverBand"
                label="Annual turnover"
                error={errors.turnoverBand?.message}
              >
                <Select
                  id="turnoverBand"
                  defaultValue=""
                  placeholder="Select turnover band"
                  aria-invalid={Boolean(errors.turnoverBand)}
                  {...register("turnoverBand")}
                >
                  {TURNOVER_BANDS.map((band) => (
                    <option key={band} value={band}>
                      {band}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-background p-4">
              <div className="space-y-1">
                <label
                  htmlFor="isAnonymous"
                  className="text-sm font-medium leading-none"
                >
                  Keep my company anonymous
                </label>
                <p className="text-xs text-muted-foreground">
                  Your cost data still counts in the Pain Index, but your
                  company name is never displayed publicly.
                </p>
              </div>
              <Switch
                id="isAnonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) =>
                  setValue("isAnonymous", checked, { shouldDirty: true })
                }
              />
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className="space-y-5">
            <legend className="sr-only">Regulatory pain</legend>
            <FormField
              id="regulation"
              label="Worst regulatory burden"
              error={errors.regulation?.message}
            >
              <Select
                id="regulation"
                defaultValue=""
                placeholder="Select the regulation that hurts most"
                aria-invalid={Boolean(errors.regulation)}
                {...register("regulation")}
              >
                {REGULATIONS.map((regulation) => (
                  <option key={regulation} value={regulation}>
                    {REGULATION_LABELS[regulation]}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField
              id="estimatedCostEur"
              label="Estimated annual compliance cost (EUR)"
              error={errors.estimatedCostEur?.message}
              hint="Include staff time, consultants, audits, software and legal fees."
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  €
                </span>
                <Input
                  id="estimatedCostEur"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1000}
                  placeholder="250000"
                  className="pl-8 font-mono"
                  aria-invalid={Boolean(errors.estimatedCostEur)}
                  {...register("estimatedCostEur", { valueAsNumber: true })}
                />
              </div>
            </FormField>
            <FormField
              id="description"
              label="Describe the burden"
              optional
              error={errors.description?.message}
            >
              <Textarea
                id="description"
                rows={4}
                placeholder="e.g. Two FTEs now spend 60% of their time on double-materiality assessments and supplier questionnaires."
                aria-invalid={Boolean(errors.description)}
                {...register("description")}
              />
            </FormField>
          </fieldset>
        )}

        {submitError && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Could not complete sign-up</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Already a member?{" "}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </button>
          </div>
          <div className="flex gap-3">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                <ArrowLeft />
                Back
              </Button>
            )}
            {isLastStep ? (
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Join the Alliance
                    <ArrowRight />
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                onClick={goNext}
                className="flex-1 sm:flex-none"
              >
                Continue
                <ArrowRight />
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
