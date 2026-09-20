"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabaseClient } from "@/lib/supabase/client";
import { STORAGE_KEYS, loadJson } from "@/lib/progress";

interface AuthUser {
  id: string;
  email?: string;
}

interface PlayerProfile {
  id: string;
  username: string | null;
  total_score: number | null;
  expeditions_completed: number | null;
  player_level: number | null;
  title: string | null;
}

const FEATURED_BADGES = [
  { icon: "🥇", name: "First Gold" },
  { icon: "🌍", name: "World Traveler" },
  { icon: "🔥", name: "3-Day Streak" },
  { icon: "🤝", name: "Friendly Rival" },
] as const;

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [localExpeditions, setLocalExpeditions] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      if (!isSupabaseConfigured) {
        router.replace("/login");
        return;
      }

      const {
        data: { user: authUser },
        error,
      } = await supabaseClient.auth.getUser();

      if (cancelled) return;

      if (error || !authUser) {
        router.replace("/login");
        return;
      }

      setUser({ id: authUser.id, email: authUser.email });

      const { data } = await supabaseClient
        .from("profiles")
        .select("id, username, total_score, expeditions_completed, player_level, title")
        .eq("id", authUser.id)
        .maybeSingle();

      if (cancelled) return;

      if (data) {
        setProfile(data as PlayerProfile);
      } else {
        const username = authUser.email?.split("@")[0] ?? "player";
        const { data: created } = await supabaseClient
          .from("profiles")
          .insert({ id: authUser.id, username })
          .select("id, username, total_score, expeditions_completed, player_level, title")
          .maybeSingle();
        if (!cancelled && created) setProfile(created as PlayerProfile);
      }

      const progress = loadJson<Record<string, string[]>>(STORAGE_KEYS.expeditions, {});
      const completed = Object.values(progress).filter((ids) => ids.length > 0).length;
      if (!cancelled) {
        setLocalExpeditions(completed);
        setLoading(false);
      }
    };

    void fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-zinc-500">
        Laddar profil...
      </div>
    );
  }

  const displayName = profile?.username || user?.email?.split("@")[0] || "Player";
  const totalScore = profile?.total_score ?? 0;
  const expeditionsCompleted = profile?.expeditions_completed || localExpeditions;
  const level = profile?.player_level ?? Math.max(1, Math.floor(totalScore / 10_000) + 1);
  const title = profile?.title || titleForLevel(level);
  const levelProgress = Math.min(100, ((totalScore % 10_000) / 10_000) * 100);

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-end justify-between border-b border-zinc-800 pb-6">
          <div>
            <h1 className="mb-1 text-3xl font-bold tracking-tight text-white">Profile</h1>
            <p className="text-sm text-zinc-500">Player statistics • Achievements • Progress</p>
          </div>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            Logga ut
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="col-span-1 flex flex-col items-center rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center shadow-2xl">
            <div className="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-amber-500/50 bg-zinc-800">
              <span className="text-3xl" aria-hidden>
                🏆
              </span>
            </div>
            <h2 className="mb-1 w-full truncate text-xl font-bold text-white" title={displayName}>
              {displayName}
            </h2>
            <div className="mb-6 flex items-center gap-1 text-sm font-semibold text-amber-400">
              ✨ {title}
            </div>

            <div className="mb-2 h-2 w-full rounded-full bg-zinc-900">
              <div
                className="h-2 rounded-full bg-amber-500"
                style={{ width: `${Math.max(levelProgress, 8)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-zinc-500">Level {level}</span>
          </div>

          <div className="col-span-1 space-y-6 md:col-span-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Player Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
                  <div className="mb-1 text-3xl font-bold text-amber-400">
                    {totalScore.toLocaleString()}
                  </div>
                  <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Total Score
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
                  <div className="mb-1 text-3xl font-bold text-zinc-200">{expeditionsCompleted}</div>
                  <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Expeditions Completed
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Featured Badges
                </h3>
                <span className="cursor-pointer text-xs text-amber-500/80 hover:text-amber-400">
                  View All →
                </span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {FEATURED_BADGES.map((badge) => (
                  <div
                    key={badge.name}
                    className="flex h-24 w-20 flex-shrink-0 flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/80"
                  >
                    <span className="mb-2 text-2xl" aria-hidden>
                      {badge.icon}
                    </span>
                    <span className="px-1 text-center text-[10px] text-zinc-400">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function titleForLevel(level: number): string {
  if (level >= 34) return "Grand Slam Champion";
  if (level >= 16) return "Hall of Fame";
  if (level >= 6) return "League Regular";
  return "Archive Rookie";
}
