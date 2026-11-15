import { useId, type KeyboardEvent } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepperProps {
  /** Visible label ("Heat", "Fan", "Batch") — also the accessible name */
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  /** Display format for the value ("6", "250 g", "P3"). Defaults to String(value). */
  format?: (value: number) => string;
  /** Spoken value; defaults to `format(value)` */
  valueText?: (value: number) => string;
  disabled?: boolean;
  /** md: 48px buttons · lg: 56px buttons and a larger value (console) */
  size?: "md" | "lg";
  /** Visually hide the label (it stays the accessible name) */
  hideLabel?: boolean;
  /** Optional hint under the control ("Within 150–250 g") */
  hint?: string;
  className?: string;
  id?: string;
}

const decimals = (n: number) => {
  const text = String(n);
  const dot = text.indexOf(".");
  return dot === -1 ? 0 : text.length - dot - 1;
};

/**
 * Minus / value / plus control with spinbutton semantics.
 * Keyboard on the value: ArrowUp/Right +step, ArrowDown/Left -step, PageUp/PageDown x10, Home/End min/max.
 */
export function Stepper({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = (v) => String(v),
  valueText,
  disabled = false,
  size = "md",
  hideLabel = false,
  hint,
  className,
  id,
}: StepperProps) {
  const autoId = useId();
  const baseId = id ?? autoId;
  const labelId = `${baseId}-label`;
  const hintId = hint ? `${baseId}-hint` : undefined;
  const precision = decimals(step);

  const clamp = (v: number) => Math.min(max, Math.max(min, Number(v.toFixed(precision))));
  const set = (v: number) => {
    const next = clamp(v);
    if (next !== value) onChange(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const map: Record<string, number | undefined> = {
      ArrowUp: value + step,
      ArrowRight: value + step,
      ArrowDown: value - step,
      ArrowLeft: value - step,
      PageUp: value + step * 10,
      PageDown: value - step * 10,
      Home: min,
      End: max,
    };
    const next = map[e.key];
    if (next === undefined) return;
    e.preventDefault();
    set(next);
  };

  const btn = size === "lg" ? "h-14 w-14" : "h-12 w-12";
  const icon = size === "lg" ? "h-6 w-6" : "h-5 w-5";
  const display = format(value);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span id={labelId} className={cn("text-sm font-medium text-foreground", hideLabel && "sr-only")}>
        {label}
      </span>
      <div className={cn("flex items-center gap-2", disabled && "opacity-50")}>
        <button
          type="button"
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-md border border-input bg-background text-foreground transition-colors duration-150 hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40",
            btn,
          )}
          onClick={() => set(value - step)}
          disabled={disabled || value <= min}
          aria-label={`Decrease ${label}`}
          tabIndex={-1}
        >
          <Minus className={icon} strokeWidth={1.75} aria-hidden />
        </button>
        <div
          role="spinbutton"
          tabIndex={disabled ? -1 : 0}
          aria-labelledby={labelId}
          aria-describedby={hintId}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={valueText ? valueText(value) : display}
          aria-disabled={disabled || undefined}
          onKeyDown={onKeyDown}
          className={cn(
            "flex min-w-[3.5rem] flex-1 items-center justify-center rounded-md px-2 font-mono font-semibold tabular-nums text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
            size === "lg" ? "h-14 text-3xl" : "h-12 text-xl",
          )}
        >
          {display}
        </div>
        <button
          type="button"
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-md border border-input bg-background text-foreground transition-colors duration-150 hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40",
            btn,
          )}
          onClick={() => set(value + step)}
          disabled={disabled || value >= max}
          aria-label={`Increase ${label}`}
          tabIndex={-1}
        >
          <Plus className={icon} strokeWidth={1.75} aria-hidden />
        </button>
      </div>
      {hint && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
