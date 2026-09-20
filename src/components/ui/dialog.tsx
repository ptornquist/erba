"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const previouslyFocused = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onOpenChange]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="presentation"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>,
    document.body,
  );
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
  title: string;
  description?: string;
}

export function DialogContent({
  className,
  children,
  onClose,
  title,
  description,
  ...props
}: DialogContentProps) {
  const titleId = React.useId();
  const descriptionId = React.useId();
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const first = contentRef.current?.querySelector<HTMLElement>(
      'input, select, textarea, button:not([data-dialog-close]), [href], [tabindex]:not([tabindex="-1"])',
    );
    (first ?? contentRef.current)?.focus();
  }, []);

  return (
    <div
      ref={contentRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      tabIndex={-1}
      className={cn(
        "relative z-10 w-full max-w-lg rounded-xl border border-gold/40 bg-card p-6 text-paper shadow-2xl outline-none",
        className,
      )}
      {...props}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <h2
            id={titleId}
            className="font-serif text-2xl font-semibold leading-none tracking-tight"
          >
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="text-sm text-paper/70">
              {description}
            </p>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            data-dialog-close
            onClick={onClose}
            className="rounded-md p-1 text-paper/50 transition-colors hover:bg-gold/15 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
