import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileSignOut } from "@/components/site/ProfileSignOut";
import { buttonVariants } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profil",
};

export default async function ProfilePage() {
  if (!isSupabaseConfigured) {
    redirect("/login");
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : null;

  if (error || !email) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold">Arkivet</p>
        <h1 className="mt-2 font-serif text-3xl text-paper">Din profil</h1>
        <p className="mt-2 text-sm text-paper/65">{email}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/play" className={cn(buttonVariants({ variant: "gold" }))}>
          Fortsätt spela
        </Link>
        <ProfileSignOut />
      </div>
    </div>
  );
}
