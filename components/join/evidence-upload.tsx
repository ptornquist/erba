"use client";

import { useRef, useState } from "react";
import { FileUp, ImageIcon, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EVIDENCE_ACCEPT,
  EVIDENCE_MAX_BYTES,
  isAllowedEvidenceFile,
} from "@/lib/evidence";
import { cn } from "@/lib/utils";

interface EvidenceUploadZoneProps {
  file: File | null;
  error: string | null;
  onFileChange: (file: File | null) => void;
  onError: (message: string | null) => void;
  disabled?: boolean;
}

export function EvidenceUploadZone({
  file,
  error,
  onFileChange,
  onError,
  disabled = false,
}: EvidenceUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function applyFile(next: File | null) {
    if (!next) {
      onError(null);
      onFileChange(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (!isAllowedEvidenceFile(next)) {
      onError("Upload a PDF or image (PNG, JPG, WEBP, GIF) of up to 10 MB.");
      onFileChange(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    onError(null);
    onFileChange(next);
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium leading-none">
        Upload Compliance Evidence (Optional)
      </p>
      <p className="text-xs text-muted-foreground">
        PDF or image files only, max {Math.round(EVIDENCE_MAX_BYTES / (1024 * 1024))}{" "}
        MB. Attaching a file marks this record as Evidence supplied.
      </p>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (disabled) return;
          applyFile(event.dataTransfer.files[0] ?? null);
        }}
        className={cn(
          "rounded-xl border-2 border-dashed bg-secondary/40 p-5 text-center transition-colors",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <input
          ref={inputRef}
          id="compliance-evidence"
          type="file"
          accept={EVIDENCE_ACCEPT}
          className="sr-only"
          disabled={disabled}
          onChange={(event) => applyFile(event.target.files?.[0] ?? null)}
        />
        {file ? (
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              {file.type.startsWith("image/") ? (
                <ImageIcon className="size-5" aria-hidden="true" />
              ) : (
                <FileUp className="size-5" aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-medium text-foreground">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(0)} KB ready to upload
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyFile(null)}
            >
              <Trash2 />
              Remove
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 text-sm text-muted-foreground"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Upload className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="font-semibold text-primary">Drop a file here</span>
              {" or browse PDFs and images"}
            </span>
          </button>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
