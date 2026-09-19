"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/form-field";
import {
  PAIN_COST_MAX_EUR,
  PAIN_COST_MIN_EUR,
  PAIN_COST_STEP_EUR,
} from "@/lib/constants";
import { cn, formatEur } from "@/lib/utils";

type PainCostFieldProps = {
  id: string;
  value: number | undefined;
  error?: string;
  onChange: (value: number | undefined) => void;
};

export function PainCostField({
  id,
  value,
  error,
  onChange,
}: PainCostFieldProps) {
  const t = useTranslations("wizard");
  const sliderValue =
    typeof value === "number" && Number.isFinite(value)
      ? Math.min(PAIN_COST_MAX_EUR, Math.max(PAIN_COST_MIN_EUR, value))
      : PAIN_COST_MIN_EUR;
  const fillPercent =
    ((sliderValue - PAIN_COST_MIN_EUR) /
      (PAIN_COST_MAX_EUR - PAIN_COST_MIN_EUR)) *
    100;

  return (
    <FormField
      id={id}
      label={t("cost")}
      error={error}
      hint={t("costHint")}
      optional
      optionalLabel={t("optional")}
    >
      <div className="space-y-3">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            €
          </span>
          <Input
            id={id}
            type="number"
            inputMode="numeric"
            min={PAIN_COST_MIN_EUR}
            max={PAIN_COST_MAX_EUR}
            step={PAIN_COST_STEP_EUR}
            placeholder={t("placeholderCost")}
            className="pl-8 font-mono"
            aria-invalid={Boolean(error)}
            value={typeof value === "number" && Number.isFinite(value) ? value : ""}
            onChange={(event) => {
              const next = event.target.value;
              if (next === "") {
                onChange(undefined);
                return;
              }
              const parsed = Number(next);
              onChange(Number.isFinite(parsed) ? parsed : undefined);
            }}
          />
        </div>
        <div className="space-y-2 rounded-lg border border-border bg-background px-4 py-3">
          <input
            type="range"
            min={PAIN_COST_MIN_EUR}
            max={PAIN_COST_MAX_EUR}
            step={PAIN_COST_STEP_EUR}
            value={sliderValue}
            aria-label={t("costScale")}
            aria-valuemin={PAIN_COST_MIN_EUR}
            aria-valuemax={PAIN_COST_MAX_EUR}
            aria-valuenow={sliderValue}
            aria-valuetext={formatEur(sliderValue)}
            onChange={(event) => onChange(Number(event.target.value))}
            className={cn(
              "h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary",
              "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary",
              "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary",
            )}
            style={{
              background: `linear-gradient(to right, var(--primary) ${fillPercent}%, var(--secondary) ${fillPercent}%)`,
            }}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatEur(PAIN_COST_MIN_EUR)}</span>
            <span className="font-mono font-semibold text-foreground">
              {formatEur(sliderValue)}
            </span>
            <span>{t("costMax")}</span>
          </div>
        </div>
      </div>
    </FormField>
  );
}
