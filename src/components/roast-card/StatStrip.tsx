import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatClock, formatPercent } from "@/lib/format";

export interface StatItem {
  /** Short label, rendered uppercase: "Total", "1st crack", "Dev", "Loss" */
  label: string;
  /** Pre-formatted value ("9:42", "18.2%"). Missing values render as a muted dash. */
  value?: string | null;
  /** Secondary line under the value ("1:32 · 15.8%", "250 g -> 212 g") */
  sub?: ReactNode;
  /** Stable key when labels repeat */
  key?: string;
}

export interface StatStripProps {
  stats: StatItem[];
  /** sm: cards · md: summaries (profile, review) · lg: console / hero */
  size?: "sm" | "md" | "lg";
  /** Fixed column count; defaults to one column per stat (max 4), 2 on phones for md/lg */
  columns?: 2 | 3 | 4;
  className?: string;
}

const LABEL = {
  sm: "text-[11px]",
  md: "text-xs",
  lg: "text-xs",
} as const;

const VALUE = {
  sm: "mt-0.5 text-sm",
  md: "mt-1 text-xl sm:text-2xl",
  lg: "mt-1 text-2xl sm:text-3xl",
} as const;

const COLS = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
} as const;

const RESPONSIVE_COLS = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
} as const;

/** The signature row of roast numbers: uppercase muted labels over mono tabular values. */
export function StatStrip({ stats, size = "md", columns, className }: StatStripProps) {
  const n = (columns ?? Math.min(4, Math.max(2, stats.length))) as 2 | 3 | 4;
  const cols = size === "sm" ? COLS[n] : RESPONSIVE_COLS[n];
  return (
    <dl className={cn("grid", size === "sm" ? "gap-2" : "gap-x-4 gap-y-5", cols, className)}>
      {stats.map((stat) => (
        <div key={stat.key ?? stat.label} className="min-w-0">
          <dt className={cn("font-medium uppercase tracking-wide text-muted-foreground", LABEL[size])}>{stat.label}</dt>
          <dd
            className={cn(
              "font-mono font-semibold tabular-nums",
              VALUE[size],
              stat.value ? "text-foreground" : "text-muted-foreground/60",
            )}
          >
            {stat.value || "—"}
          </dd>
          {stat.sub && <dd className="mt-0.5 text-xs text-muted-foreground">{stat.sub}</dd>}
        </div>
      ))}
    </dl>
  );
}

/** Minimal shape of the roast numbers; `RoastFacts` from utils/roastProfileView fits. */
export interface StatFacts {
  totalSeconds: number;
  firstCrack?: { time: number };
  developmentSeconds?: number;
  developmentPercent?: number;
  weightLossPercent?: number;
}

/** The four card stats: Total · 1st crack · Dev · Loss. */
// eslint-disable-next-line react-refresh/only-export-components
export function cardStats(facts: StatFacts): StatItem[] {
  return [
    { label: "Total", value: facts.totalSeconds ? formatClock(facts.totalSeconds) : undefined },
    { label: "1st crack", value: facts.firstCrack ? formatClock(facts.firstCrack.time) : undefined },
    { label: "Dev", value: facts.developmentPercent !== undefined ? formatPercent(facts.developmentPercent) : undefined },
    { label: "Loss", value: facts.weightLossPercent !== undefined ? formatPercent(facts.weightLossPercent) : undefined },
  ];
}
