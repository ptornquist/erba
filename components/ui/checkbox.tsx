"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  loading?: boolean;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, loading, disabled, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      disabled={disabled || loading}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "peer flex size-5 shrink-0 items-center justify-center rounded-sm border shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
        checked
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-background hover:border-muted-foreground",
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
      ) : checked ? (
        <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
      ) : null}
    </button>
  ),
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
