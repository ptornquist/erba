import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdmin(): Promise<User> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/join");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/join");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_admin !== true) {
    redirect("/dashboard");
  }

  return user;
}

export function createAdminDataClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
