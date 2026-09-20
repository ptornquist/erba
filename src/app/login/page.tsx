"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabaseClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(
    null,
  );

  const handleAuth = async (action: "login" | "signup", e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!isSupabaseConfigured) {
        throw new Error("Arkivet är inte kopplat till Supabase.");
      }

      if (action === "signup") {
        const { error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMessage({ text: "Kolla din mail för att bekräfta kontot!", type: "success" });
      } else {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace("/profile");
        router.refresh();
      }
    } catch (error: unknown) {
      const text = error instanceof Error ? error.message : "Ett fel uppstod.";
      setMessage({ text, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
            SportHistory<span className="text-amber-400">Clue</span>
          </h1>
          <p className="text-sm text-zinc-400">Logga in för att spara dina framsteg i arkivet.</p>
        </div>

        {message && (
          <div
            role="status"
            className={`mb-6 rounded-xl p-4 text-sm ${
              message.type === "error"
                ? "border border-red-900 bg-red-950/50 text-red-400"
                : "border border-emerald-900 bg-emerald-950/50 text-emerald-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <form className="space-y-4" onSubmit={(event) => void handleAuth("login", event)}>
          <div>
            <label
              htmlFor="login-email"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500"
            >
              E-post
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder-zinc-600 transition-colors focus:border-amber-500 focus:outline-none"
              placeholder="din@epost.se"
              required
            />
          </div>
          <div>
            <label
              htmlFor="login-password"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500"
            >
              Lösenord
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder-zinc-600 transition-colors focus:border-amber-500 focus:outline-none"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="flex-1 rounded-xl bg-amber-500 py-3 font-semibold text-black transition-colors hover:bg-amber-400 disabled:opacity-50"
            >
              {loading ? "Laddar..." : "Logga in"}
            </button>
            <button
              type="button"
              onClick={(event) => void handleAuth("signup", event)}
              disabled={loading || !email || !password}
              className="flex-1 rounded-xl bg-zinc-800 py-3 font-semibold text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
            >
              Skapa konto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
