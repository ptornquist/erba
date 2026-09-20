import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { getLocale } from "next-intl/server";
import { isSupabaseConfigured, type TypedSupabaseClient } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { generateReferralCode } from "@/lib/utils";
import { redirect } from "@/i18n/navigation";
import type { Company, Profile } from "@/types/database";

export interface DashboardContext {
  supabase: TypedSupabaseClient;
  user: User;
  profile: Profile | null;
  companies: Company[];
  /** The member's primary company (first created). Null if onboarding was interrupted. */
  company: Company | null;
  fullName: string | null;
}

/**
 * Resolves the authenticated member, their profile and companies.
 * Redirects to /login when unauthenticated. Cached per request so the layout
 * and page can both call it without duplicate queries.
 */
export const getDashboardContext = cache(
  async (): Promise<DashboardContext> => {
    const locale = await getLocale();

    if (!isSupabaseConfigured) {
      redirect({ href: "/login", locale });
      throw new Error("Supabase is not configured");
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect({
        href: { pathname: "/login", query: { next: "/dashboard" } },
        locale,
      });
      throw new Error("Unauthenticated");
    }

    const [{ data: existingProfile }, { data: companiesData }] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("companies")
          .select("*")
          .eq("profile_id", user.id)
          .order("created_at", { ascending: true }),
      ]);

    let profile: Profile | null = existingProfile;

    // Self-heal: a profile row can be missing if sign-up was interrupted
    // between auth.signUp() and the profiles insert.
    if (!profile) {
      const { data: created } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email ?? "",
          referral_code: generateReferralCode(),
          referred_by: null,
        })
        .select("*")
        .single();
      profile = created;
    }

    const companies = companiesData ?? [];
    const fullName =
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : null;

    return {
      supabase,
      user,
      profile,
      companies,
      company: companies[0] ?? null,
      fullName,
    };
  },
);
