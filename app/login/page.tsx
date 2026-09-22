import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { SignInForm } from "@/components/join/sign-in-form";

export const metadata: Metadata = {
  title: "Log in",
  description:
    "Sign in to access the War Room, your checklists and the referral tracker.",
};

export default function LoginPage() {
  return (
    <section className="relative flex-1 overflow-hidden bg-grid py-12 sm:py-16 lg:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,51,153,0.12),transparent_55%)]"
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-16 lg:px-8">
        <div className="lg:sticky lg:top-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Member access
          </p>
          <h1 className="mt-3 text-balance text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Welcome back
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            Sign in to access the War Room, your checklists and the referral
            tracker.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-border bg-card">
              <Loader2
                className="size-6 animate-spin text-muted-foreground"
                aria-label="Signing in…"
              />
            </div>
          }
        >
          <SignInForm />
        </Suspense>
      </div>
    </section>
  );
}
