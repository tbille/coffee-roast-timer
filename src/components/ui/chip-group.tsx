import { useId, useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export interface ChipOption<T extends string = string> {
  value: T;
  label: string;
  /** CSS colour for a small swatch before the label, e.g. "hsl(var(--phase-maillard))" */
  swatch?: string;
  disabled?: boolean;
}

export interface ChipGroupProps<T extends string = string> {
  /** Accessible name of the group; shown as a visible label unless `hideLabel` */
  label: string;
  hideLabel?: boolean;
  options: ChipOption<T>[];
  value: T | null | undefined;
  onChange: (value: T | null) => void;
  /** Clicking the selected chip clears it (onChange(null)) */
  allowDeselect?: boolean;
  disabled?: boolean;
  /** md: 40px chips · lg: 48px chips */
  size?: "md" | "lg";
  className?: string;
  id?: string;
  /** For forms: marks the group invalid and links an error message */
  invalid?: boolean;
  describedBy?: string;
}

/**
 * Single-select chips with radio-group semantics (roving tabindex; arrows move and select).
 * Use for Process, Roast level, Where, roaster filters.
 */
export function ChipGroup<T extends string = string>({
  label,
  hideLabel = false,
  options,
  value,
  onChange,
  allowDeselect = false,
  disabled = false,
  size = "md",
  className,
  id,
  invalid,
  describedBy,
}: ChipGroupProps<T>) {
  const autoId = useId();
  const labelId = `${id ?? autoId}-label`;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const enabled = options.map((o) => !disabled && !o.disabled);
  const selectedIndex = options.findIndex((o) => o.value === value);
  const focusIndex = selectedIndex >= 0 && enabled[selectedIndex] ? selectedIndex : enabled.indexOf(true);

  const move = (from: number, dir: 1 | -1) => {
    for (let i = 1; i <= options.length; i++) {
      const idx = (from + dir * i + options.length) % options.length;
      if (enabled[idx]) {
        refs.current[idx]?.focus();
        onChange(options[idx].value);
        return;
      }
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      move(index, 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      move(index, -1);
    }
  };

  const select = (option: ChipOption<T>) => {
    if (option.value === value) {
      if (allowDeselect) onChange(null);
      return;
    }
    onChange(option.value);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span id={labelId} className={cn("text-sm font-medium text-foreground", hideLabel && "sr-only")}>
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        aria-disabled={disabled || undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className="flex flex-wrap gap-2"
      >
        {options.map((option, index) => {
          const checked = option.value === value;
          return (
            <button
              key={option.value}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              disabled={!enabled[index]}
              tabIndex={index === focusIndex ? 0 : -1}
              onClick={() => select(option)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
                size === "lg" ? "h-12" : "h-10",
                checked
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background text-foreground hover:bg-muted",
                invalid && !checked && "border-destructive",
              )}
            >
              {option.swatch && (
                <span
                  className="h-3 w-3 shrink-0 rounded-full border border-foreground/15"
                  style={{ backgroundColor: option.swatch }}
                  aria-hidden
                />
              )}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
