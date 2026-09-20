"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
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
import { Link } from "@/i18n/navigation";
import { localizePath, stripLocalePrefix } from "@/i18n/routing";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { INDUSTRIES, REGULATIONS, TURNOVER_BANDS } from "@/lib/constants";
import {
  createJoinSchema,
  STEP_FIELDS,
  type JoinFormValues,
} from "@/lib/validations/join";
import { humaniseSupabaseError } from "@/lib/errors";
import { hardNavigate } from "@/lib/navigation";
import { cn, generateReferralCode } from "@/lib/utils";

export function JoinWizard() {
  const t = useTranslations("wizard");
  const tv = useTranslations("validation");
  const ti = useTranslations("industries");
  const tr = useTranslations("regulations");
  const tl = useTranslations("login");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const referredBy = searchParams.get("ref")?.trim().toUpperCase() ?? null;
  const nextPath = searchParams.get("next") ?? "/dashboard";
  const joinSchema = useMemo(
    () => createJoinSchema((key) => tv(key as Parameters<typeof tv>[0])),
    [tv],
  );

  const steps = [
    { title: t("account"), description: t("accountWho"), icon: UserRound },
    { title: t("company"), description: t("companyWhat"), icon: Building2 },
    { title: t("pain"), description: t("painWhat"), icon: Euro },
  ] as const;

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
  const isLastStep = step === steps.length - 1;

  async function goNext() {
    const valid = await trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (valid) {
      setSubmitError(null);
      setStep((s) => Math.min(s + 1, steps.length - 1));
    }
  }

  function goBack() {
    setSubmitError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  function destinationPath() {
    const { pathname } = stripLocalePrefix(nextPath);
    return localizePath(locale, pathname);
  }

  async function onSubmit(values: JoinFormValues) {
    setSubmitError(null);

    if (!isSupabaseConfigured) {
      setSubmitError(tl("notConfigured"));
      return;
    }

    try {
      const supabase = createClient();

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
                ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(destinationPath())}`
                : undefined,
          },
        });

      if (signUpError) throw signUpError;

      const user = signUpData.user;
      if (!user) {
        throw new Error(t("noUser"));
      }

      if (user.identities && user.identities.length === 0) {
        throw new Error(t("duplicate"));
      }

      if (!signUpData.session) {
        setNeedsEmailConfirmation(true);
        return;
      }

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

      hardNavigate(destinationPath());
    } catch (err) {
      console.error("Join submission failed", err);
      setSubmitError(humaniseSupabaseError(err, t("genericError")));
    }
  }

  if (needsEmailConfirmation) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center sm:p-12">
        <span className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-8" aria-hidden="true" />
        </span>
        <h2 className="text-2xl font-bold tracking-tight">{t("confirmTitle")}</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          {t("confirmBody", { email: form.getValues("email") })}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/pain-index" variant="outline">
            {t("viewPain")}
          </ButtonLink>
          <ButtonLink href="/login">{t("confirmedSignIn")}</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      <ol className="grid grid-cols-3 border-b border-border" aria-label={t("progress")}>
        {steps.map(({ title, description, icon: Icon }, index) => {
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
                  {t("step", { current: index + 1, total: steps.length })}
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
            {t("step", { current: step + 1, total: steps.length })}
          </p>
          <h2 className="text-xl font-bold">{steps[step].title}</h2>
        </div>

        {referredBy && step === 0 && (
          <Alert>
            <Check />
            <AlertTitle>{t("referralApplied")}</AlertTitle>
            <AlertDescription>
              {t("referralCode", { code: referredBy })}
            </AlertDescription>
          </Alert>
        )}

        {step === 0 && (
          <fieldset className="space-y-5">
            <legend className="sr-only">{t("accountDetails")}</legend>
            <FormField id="name" label={t("fullName")} error={errors.name?.message}>
              <Input
                id="name"
                autoComplete="name"
                placeholder={t("placeholderName")}
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
            </FormField>
            <FormField
              id="email"
              label={t("workEmail")}
              error={errors.email?.message}
              hint={t("emailHint")}
            >
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t("placeholderEmail")}
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
            </FormField>
            <FormField
              id="password"
              label={t("password")}
              error={errors.password?.message}
              hint={t("passwordHint")}
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
            <legend className="sr-only">{t("companyDetails")}</legend>
            <FormField
              id="companyName"
              label={t("companyName")}
              error={errors.companyName?.message}
            >
              <Input
                id="companyName"
                autoComplete="organization"
                placeholder={t("placeholderCompany")}
                aria-invalid={Boolean(errors.companyName)}
                {...register("companyName")}
              />
            </FormField>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="industry"
                label={t("industry")}
                error={errors.industry?.message}
              >
                <Select
                  id="industry"
                  defaultValue=""
                  placeholder={t("selectIndustry")}
                  aria-invalid={Boolean(errors.industry)}
                  {...register("industry")}
                >
                  {INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>
                      {ti(industry)}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField
                id="turnoverBand"
                label={t("turnover")}
                error={errors.turnoverBand?.message}
              >
                <Select
                  id="turnoverBand"
                  defaultValue=""
                  placeholder={t("selectTurnover")}
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
                  {t("anonymous")}
                </label>
                <p className="text-xs text-muted-foreground">{t("anonymousHint")}</p>
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
            <legend className="sr-only">{t("painDetails")}</legend>
            <FormField
              id="regulation"
              label={t("regulation")}
              error={errors.regulation?.message}
            >
              <Select
                id="regulation"
                defaultValue=""
                placeholder={t("selectRegulation")}
                aria-invalid={Boolean(errors.regulation)}
                {...register("regulation")}
              >
                {REGULATIONS.map((regulation) => (
                  <option key={regulation} value={regulation}>
                    {tr(regulation)}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField
              id="estimatedCostEur"
              label={t("cost")}
              error={errors.estimatedCostEur?.message}
              hint={t("costHint")}
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
                  placeholder={t("placeholderCost")}
                  className="pl-8 font-mono"
                  aria-invalid={Boolean(errors.estimatedCostEur)}
                  {...register("estimatedCostEur", { valueAsNumber: true })}
                />
              </div>
            </FormField>
            <FormField
              id="description"
              label={t("describe")}
              optional
              optionalLabel={t("optional")}
              error={errors.description?.message}
            >
              <Textarea
                id="description"
                rows={4}
                placeholder={t("placeholderDescription")}
                aria-invalid={Boolean(errors.description)}
                {...register("description")}
              />
            </FormField>
          </fieldset>
        )}

        {submitError && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>{t("errorTitle")}</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {t("alreadyMember")}{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {t("signIn")}
            </Link>
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
                {t("back")}
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
                    {t("creating")}
                  </>
                ) : (
                  <>
                    {t("submit")}
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
                {t("continue")}
                <ArrowRight />
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
