import { useId } from "react";
import { Link2, Lock } from "lucide-react";
import { ChipGroup, type ChipOption } from "@/components/ui/chip-group";
import { cn } from "@/lib/utils";
import {
  VISIBILITY_DESCRIPTIONS,
  VISIBILITY_LABELS,
  VISIBILITY_OPTIONS,
  type RoastVisibility,
} from "@/types/roast-session.types";

const OPTIONS: ChipOption<RoastVisibility>[] = VISIBILITY_OPTIONS.map((value) => ({ value, label: VISIBILITY_LABELS[value] }));

export interface VisibilityPickerProps {
  value: RoastVisibility;
  onChange: (value: RoastVisibility) => void;
  label?: string;
  size?: "md" | "lg";
  disabled?: boolean;
  className?: string;
}

/** "Who can see it": Private · Link only · Public, with a one-line description of the choice. */
export function VisibilityPicker({ value, onChange, label = "Who can see it", size = "md", disabled, className }: VisibilityPickerProps) {
  const descriptionId = useId();
  return (
    <div className={cn("space-y-2", className)}>
      <ChipGroup
        label={label}
        options={OPTIONS}
        value={value}
        onChange={(v) => v && onChange(v)}
        size={size}
        disabled={disabled}
        describedBy={descriptionId}
      />
      <p id={descriptionId} className="text-xs text-muted-foreground">
        {VISIBILITY_DESCRIPTIONS[value]}
      </p>
    </div>
  );
}

/** Small neutral label for Private / Link only roasts. Public roasts get nothing. */
export function VisibilityBadge({ visibility, className }: { visibility: RoastVisibility; className?: string }) {
  if (visibility === "public") return null;
  const Icon = visibility === "private" ? Lock : Link2;
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground", className)}
      title={VISIBILITY_DESCRIPTIONS[visibility]}
    >
      <Icon className="h-3 w-3" strokeWidth={1.75} aria-hidden />
      {VISIBILITY_LABELS[visibility]}
    </span>
  );
}
