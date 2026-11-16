import { ChipGroup, type ChipOption } from "@/components/ui/chip-group";
import { roasterName } from "@/utils/roastProfileView";

export const ALL_ROASTERS = "all";
export const UNKNOWN_ROASTER = "unknown";

interface RoasterFilterProps {
  value: string;
  onChange: (value: string) => void;
  /** Roast count per roaster type (`unknown` for rows without one) */
  counts: Record<string, number>;
  className?: string;
}

/** Neutral roaster chips (text only, no colour coding). Hidden when only one roaster is used. */
export function RoasterFilter({ value, onChange, counts, className }: RoasterFilterProps) {
  const types = Object.keys(counts).filter((k) => counts[k] > 0);
  if (types.length < 2) return null;
  const total = types.reduce((sum, k) => sum + counts[k], 0);
  types.sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));

  const options: ChipOption[] = [
    { value: ALL_ROASTERS, label: `All · ${total}` },
    ...types.map((t) => ({
      value: t,
      label: `${t === UNKNOWN_ROASTER ? "Unknown roaster" : roasterName(t) ?? t} · ${counts[t]}`,
    })),
  ];

  return (
    <ChipGroup
      label="Roaster"
      options={options}
      value={value}
      onChange={(v) => onChange(v ?? ALL_ROASTERS)}
      size="lg"
      className={className}
    />
  );
}
