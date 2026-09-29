"use client";

import { useCallback, useEffect, useState } from "react";
import { FolderLock } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import {
  EVIDENCE_BUCKET,
  EVIDENCE_SIGNED_URL_TTL_SECONDS,
} from "@/lib/evidence";
import { humaniseSupabaseError } from "@/lib/errors";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";

type VaultFile = {
  name: string;
  path: string;
  createdAt: string | null;
  size: number;
};

const createdAtFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatCreatedAt(value: string | null): string {
  if (!value) return "Unknown date";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "Unknown date"
    : createdAtFormatter.format(parsed);
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function sizeFromMetadata(metadata: Record<string, unknown> | null): number {
  const raw = metadata?.size;
  const parsed = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function EvidenceVault() {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openingPath, setOpeningPath] = useState<string | null>(null);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError(
        "This deployment is not connected to Supabase yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY and try again.",
      );
      setFiles([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (!user) {
      if (userError && !/session missing/i.test(userError.message)) {
        throw userError;
      }
      setFiles([]);
      setError(null);
      return;
    }

    const { data, error: listError } = await supabase.storage
      .from(EVIDENCE_BUCKET)
      .list(user.id, {
        limit: 1000,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });
    if (listError) throw listError;

    const nextFiles: VaultFile[] = (data ?? [])
      .filter(
        (item) =>
          Boolean(item.id) &&
          item.name !== ".emptyFolderPlaceholder" &&
          !item.name.endsWith("/"),
      )
      .map((item) => ({
        name: item.name,
        path: `${user.id}/${item.name}`,
        createdAt: item.created_at ?? null,
        size: sizeFromMetadata(
          (item.metadata as Record<string, unknown> | null) ?? null,
        ),
      }));

    setFiles(nextFiles);
    setError(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        await loadFiles();
      } catch (cause) {
        if (!cancelled) {
          setFiles([]);
          setError(
            humaniseSupabaseError(cause, "Could not load the evidence vault."),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [loadFiles]);

  async function viewFile(file: VaultFile) {
    setError(null);
    setOpeningPath(file.path);
    try {
      const supabase = createClient();
      const { data, error: signedUrlError } = await supabase.storage
        .from(EVIDENCE_BUCKET)
        .createSignedUrl(file.path, EVIDENCE_SIGNED_URL_TTL_SECONDS);
      if (signedUrlError) throw signedUrlError;
      if (!data?.signedUrl) {
        throw new Error("Could not create a signed URL from the evidence-vault.");
      }
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (cause) {
      setError(
        humaniseSupabaseError(
          cause,
          "Could not open the document from the evidence-vault.",
        ),
      );
    } finally {
      setOpeningPath(null);
    }
  }

  async function deleteFile(file: VaultFile) {
    setError(null);
    setDeletingPath(file.path);
    try {
      const supabase = createClient();
      const { error: removeError } = await supabase.storage
        .from(EVIDENCE_BUCKET)
        .remove([file.path]);
      if (removeError) throw removeError;
      await loadFiles();
    } catch (cause) {
      setError(
        humaniseSupabaseError(
          cause,
          "Could not delete the file from the evidence-vault.",
        ),
      );
    } finally {
      setDeletingPath(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
      <header className="bg-slate-900 px-6 py-8 text-white sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          ERBA
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Evidence Vault
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
          Private files stored in your evidence-vault folder. View uses a
          time-limited signed URL; delete removes the object from storage.
        </p>
      </header>

      <div className="space-y-6 p-6 sm:p-8">
        {error ? (
          <div
            className="rounded-lg border border-red-200 bg-white px-4 py-3 shadow-sm"
            role="alert"
          >
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-lg border border-slate-200 bg-white shadow-sm"
              />
            ))}
          </div>
        ) : files.length === 0 ? (
          <EmptyState
            icon={FolderLock}
            title="No evidence uploaded yet."
            description="Files you attach on a cost report land here, scoped to your account."
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {files.map((file) => {
              const busy =
                openingPath === file.path || deletingPath === file.path;
              const displayName = file.name.includes("_")
                ? file.name.substring(file.name.indexOf("_") + 1)
                : file.name;
              return (
                <li key={file.path}>
                  <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <h2
                        className="truncate text-lg font-bold leading-snug text-slate-900"
                        title={displayName}
                      >
                        {displayName}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {formatCreatedAt(file.createdAt)}
                      </p>
                      <p className="text-sm tabular-nums text-slate-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <footer className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3">
                      <button
                        type="button"
                        onClick={() => void viewFile(file)}
                        disabled={busy}
                        className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {openingPath === file.path ? "Opening…" : "View"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteFile(file)}
                        disabled={busy}
                        className="px-1 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingPath === file.path ? "Deleting…" : "Delete"}
                      </button>
                    </footer>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
