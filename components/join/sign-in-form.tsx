"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/form-field";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { signInSchema, type SignInFormValues } from "@/lib/validations/join";

interface SignInFormProps {
  onSwitchToJoin: () => void;
}

export function SignInForm({ onSwitchToJoin }: SignInFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      setSubmitError(
        "This deployment is not connected to Supabase yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY and try again.",
      );
      return;
    }

    try {
      const { error } = await createClient().auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) throw error;

      router.push(nextPath);
      router.refresh();
    } catch (err) {
      console.error("Sign-in failed", err);
      setSubmitError(
        err instanceof Error && err.message
          ? err.message
          : "Could not sign you in. Check your credentials and try again.",
      );
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Sign in to access the War Room and your referral tracker.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-8 space-y-5"
      >
        <FormField id="signin-email" label="Email" error={errors.email?.message}>
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
          label="Password"
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
            <AlertTitle>Sign-in failed</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to ERBA?{" "}
        <button
          type="button"
          onClick={onSwitchToJoin}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Join free
        </button>
      </p>
    </div>
  );
}
