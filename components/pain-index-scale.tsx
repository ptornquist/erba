import { Progress } from "@/components/ui/progress";
import { PAIN_COST_MAX_EUR, PAIN_COST_MIN_EUR } from "@/lib/constants";
import { formatEur } from "@/lib/utils";

type PainIndexScaleProps = {
  totalEur: number;
  locale: string;
  label: string;
  minLabel: string;
  maxLabel: string;
  hint: string;
  overflowLabel: string;
};

export function PainIndexScale({
  totalEur,
  locale,
  label,
  minLabel,
  maxLabel,
  hint,
  overflowLabel,
}: PainIndexScaleProps) {
  const clamped = Math.min(
    PAIN_COST_MAX_EUR,
    Math.max(PAIN_COST_MIN_EUR, totalEur),
  );
  const percent = (clamped / PAIN_COST_MAX_EUR) * 100;
  const overflow = totalEur > PAIN_COST_MAX_EUR;

  return (
    <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-border bg-card/80 p-5 text-left sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className="font-mono text-sm font-semibold tabular-nums">
          {formatEur(clamped, locale)} / {formatEur(PAIN_COST_MAX_EUR, locale)}
        </p>
      </div>
      <Progress className="mt-3 h-4" value={percent} aria-label={label} />
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {overflow ? overflowLabel : hint}
      </p>
    </div>
  );
}
