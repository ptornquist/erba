"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  ExternalLink,
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FolderLock,
  Loader2,
  Lock,
  Search,
  Trash2,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { humaniseSupabaseError } from "@/lib/errors";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  ALLOWED_DOCUMENT_EXTENSIONS,
  documentUploadSchema,
} from "@/lib/validations/dashboard";
import type { DocumentVaultItem } from "@/types/database";

interface DocumentVaultProps {
  companyId: string;
  companyName: string;
  initialDocuments: DocumentVaultItem[];
}

const dateTime = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function extensionOf(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function iconFor(ext: string): LucideIcon {
  if (["pdf", "doc", "docx"].includes(ext)) return FileText;
  if (["xls", "xlsx", "csv"].includes(ext)) return FileSpreadsheet;
  if (["png", "jpg", "jpeg"].includes(ext)) return FileImage;
  if (ext === "zip") return FileArchive;
  return File;
}

function categoryFor(name: string): string {
  const lower = name.toLowerCase();
  if (/iso|cert|certificate|attest/.test(lower)) return "Certificate";
  if (/audit|assurance|report/.test(lower)) return "Audit report";
  if (/policy|procedure|code/.test(lower)) return "Policy";
  if (/register|log|record/.test(lower)) return "Register";
  return "Evidence";
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function DocumentVault({
  companyId,
  companyName,
  initialDocuments,
}: DocumentVaultProps) {
  const [documents, setDocuments] = useState<DocumentVaultItem[]>(initialDocuments);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documents.filter((d) => q.length === 0 || d.file_name.toLowerCase().includes(q));
  }, [documents, query]);

  function closeUpload() {
    setUploadOpen(false);
    setSelectedFile(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleUpload() {
    setUploadError(null);
    const parsed = documentUploadSchema.safeParse({
      file_name: selectedFile?.name ?? "",
      size_bytes: selectedFile?.size ?? 0,
    });
    if (!parsed.success) {
      setUploadError(parsed.error.issues[0]?.message ?? "Invalid file");
      return;
    }

    setUploading(true);
    try {
      // Storage upload is mocked for the MVP: we persist the metadata row with a
      // deterministic vault URI so the table, export and RLS paths are exercised.
      const objectPath = `${companyId}/${Date.now()}-${parsed.data.file_name}`;
      const fileUrl = `vault://erba/${objectPath}`;

      const { data, error: insertError } = await createClient()
        .from("document_vault")
        .insert({
          company_id: companyId,
          file_name: parsed.data.file_name,
          file_url: fileUrl,
        })
        .select("*")
        .single();
      if (insertError) throw insertError;

      setDocuments((prev) => [data, ...prev]);
      closeUpload();
    } catch (err) {
      setUploadError(
        humaniseSupabaseError(err, "Upload failed. Please try again."),
      );
    } finally {
      setUploading(false);
    }
  }

  async function deleteDocument(doc: DocumentVaultItem) {
    setError(null);
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    try {
      const { error: deleteError } = await createClient()
        .from("document_vault")
        .delete()
        .eq("id", doc.id)
        .eq("company_id", companyId);
      if (deleteError) throw deleteError;
    } catch (err) {
      setDocuments((prev) =>
        [...prev, doc].sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at)),
      );
      setError(
        humaniseSupabaseError(err, "Could not delete the document. Please try again."),
      );
    }
  }

  async function copyLink(doc: DocumentVaultItem) {
    try {
      await navigator.clipboard.writeText(doc.file_url);
      setCopiedId(doc.id);
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch {
      setError("Clipboard access was blocked by the browser.");
    }
  }

  function exportCsv() {
    const header = ["File name", "Category", "Type", "Uploaded at", "Location"];
    const rows = documents.map((d) => [
      d.file_name,
      categoryFor(d.file_name),
      extensionOf(d.file_name).toUpperCase(),
      new Date(d.uploaded_at).toISOString(),
      d.file_url,
    ]);
    const csv = [header, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const safeName = companyName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    anchor.href = url;
    anchor.download = `erba-document-vault-${safeName}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Documents stored" value={String(documents.length)} />
        <Stat
          label="Certificates"
          value={String(documents.filter((d) => categoryFor(d.file_name) === "Certificate").length)}
        />
        <Stat
          label="Last upload"
          value={
            documents[0]
              ? dateTime.format(new Date(documents[0].uploaded_at)).split(",")[0]
              : "—"
          }
        />
      </div>

      <Card>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search documents…"
                aria-label="Search documents"
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={exportCsv}
                disabled={documents.length === 0}
              >
                <Download />
                Export CSV
              </Button>
              <Button onClick={() => setUploadOpen(true)}>
                <Upload />
                Upload document
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {visible.length === 0 ? (
            <EmptyState
              icon={FolderLock}
              title={documents.length === 0 ? "Your vault is empty" : "No matching documents"}
              description={
                documents.length === 0
                  ? "Store ISO certificates, audit reports and compliance evidence so they are ready for regulators and customers on demand."
                  : "Try a different search term."
              }
              action={
                documents.length === 0 ? (
                  <Button onClick={() => setUploadOpen(true)}>
                    <Upload />
                    Upload your first document
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Document</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden sm:table-cell">Uploaded</TableHead>
                    <TableHead className="hidden xl:table-cell">Access</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((doc) => {
                    const ext = extensionOf(doc.file_name);
                    const Icon = iconFor(ext);
                    return (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                              <Icon className="size-4" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium">{doc.file_name}</p>
                              <p className="text-xs uppercase text-muted-foreground">
                                {ext || "file"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline">{categoryFor(doc.file_name)}</Badge>
                        </TableCell>
                        <TableCell className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
                          {dateTime.format(new Date(doc.uploaded_at))}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Lock className="size-3.5" aria-hidden="true" />
                            Company only
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => copyLink(doc)}
                              aria-label={`Copy link for ${doc.file_name}`}
                              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            >
                              {copiedId === doc.id ? (
                                <Check className="size-4 text-emerald-400" />
                              ) : (
                                <Copy className="size-4" />
                              )}
                            </button>
                            <a
                              href={doc.file_url.startsWith("http") ? doc.file_url : undefined}
                              target="_blank"
                              rel="noreferrer"
                              aria-disabled={!doc.file_url.startsWith("http")}
                              aria-label={`Open ${doc.file_name}`}
                              title={
                                doc.file_url.startsWith("http")
                                  ? "Open document"
                                  : "Storage delivery not enabled in this environment"
                              }
                              className={cn(
                                "rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                                !doc.file_url.startsWith("http") && "cursor-not-allowed opacity-50",
                              )}
                            >
                              <ExternalLink className="size-4" />
                            </a>
                            <button
                              type="button"
                              onClick={() => deleteDocument(doc)}
                              aria-label={`Delete ${doc.file_name}`}
                              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={uploadOpen} onOpenChange={(open) => (open ? setUploadOpen(true) : closeUpload())}>
        <DialogContent
          title="Upload compliance document"
          description="Files are scoped to your company and never shared with other members."
          onClose={closeUpload}
        >
          <label
            htmlFor="vault-file"
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
              selectedFile ? "border-primary/60 bg-primary/5" : "border-border hover:border-muted-foreground/50",
            )}
          >
            <Upload className="size-6 text-muted-foreground" aria-hidden="true" />
            {selectedFile ? (
              <>
                <span className="font-medium">{selectedFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(0)} KB · click to change
                </span>
              </>
            ) : (
              <>
                <span className="font-medium">Choose a file</span>
                <span className="text-xs text-muted-foreground">
                  {ALLOWED_DOCUMENT_EXTENSIONS.map((e) => e.toUpperCase()).join(", ")} · up to 25 MB
                </span>
              </>
            )}
            <input
              ref={fileInputRef}
              id="vault-file"
              type="file"
              className="sr-only"
              accept={ALLOWED_DOCUMENT_EXTENSIONS.map((e) => `.${e}`).join(",")}
              onChange={(e) => {
                setUploadError(null);
                setSelectedFile(e.target.files?.[0] ?? null);
              }}
            />
          </label>

          {uploadError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeUpload} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
              {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
              {uploading ? "Uploading…" : "Add to vault"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-mono text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
