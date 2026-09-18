"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/form-field";
import { Link } from "@/i18n/navigation";
import { localizePath, stripLocalePrefix } from "@/i18n/routing";
import { humaniseSupabaseError } from "@/lib/errors";
import { hardNavigate } from "@/lib/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import {
  createSignInSchema,
  type SignInFormValues,
} from "@/lib/validations/join";

export function SignInForm() {
  const t = useTranslations("login");
  const tv = useTranslations("validation");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";
  const signInSchema = useMemo(
    () => createSignInSchema((key) => tv(key as Parameters<typeof tv>[0])),
    [tv],
  );
  const [submitError, setSubmitError] = useState<string | null>(
    searchParams.get("error") === "confirmation_failed"
      ? t("confirmationFailed")
      : null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: SignInFormValues) {
    setSubmitError(null);

    if (!isSupabaseConfigured) {
      setSubmitError(t("notConfigured"));
      return;
    }

    try {
      const { error } = await createClient().auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) throw error;

      const { pathname } = stripLocalePrefix(nextPath);
      hardNavigate(localizePath(locale, pathname));
    } catch (err) {
      console.error("Sign-in failed", err);
      setSubmitError(humaniseSupabaseError(err, t("genericError")));
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-8 space-y-5"
      >
        <FormField id="signin-email" label={t("email")} error={errors.email?.message}>
          <Input
            id="signin-email"
            type="email"
            autoComplete="email"
            placeholder="ceo@yourcompany.eu"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </FormField>
        <FormField
          id="signin-password"
          label={t("password")}
          error={errors.password?.message}
        >
          <Input
            id="signin-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
        </FormField>

        {submitError && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>{t("failed")}</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" />
              {t("submitting")}
            </>
          ) : (
            <>
              {t("submit")}
              <ArrowRight />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("newTo")}{" "}
        <Link
          href="/join"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {t("joinFree")}
        </Link>
      </p>
    </div>
  );
}
