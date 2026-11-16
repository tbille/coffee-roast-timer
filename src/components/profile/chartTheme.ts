import { formatClock } from "@/lib/format";

/** Chart colours from theme tokens, so curves work in light and dark themes. */
export const CHART_COLORS = {
  bean: "hsl(var(--phase-development))",
  setpoint: "hsl(var(--control-heat))",
  development: "hsl(var(--phase-development))",
  grid: "hsl(var(--muted-foreground) / 0.25)",
  axis: "hsl(var(--muted-foreground))",
  mark: "hsl(var(--muted-foreground))",
  label: "hsl(var(--foreground))",
} as const;

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--popover))",
  color: "hsl(var(--popover-foreground))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "var(--radius)",
  fontSize: 13,
} as const;

/** Minute ticks on a seconds axis, coarser for long roasts. */
export function minuteTicks(from: number, to: number): number[] {
  const span = to - from;
  const step = span > 16 * 60 ? 180 : span > 8 * 60 ? 120 : 60;
  const ticks: number[] = [];
  for (let t = Math.ceil(from / step) * step; t <= to; t += step) ticks.push(t);
  return ticks;
}

/** Signed m:ss for axes that can go negative (aligned on first crack). */
export const signedClock = (s: number) => (s < 0 ? `-${formatClock(-s)}` : formatClock(s));

