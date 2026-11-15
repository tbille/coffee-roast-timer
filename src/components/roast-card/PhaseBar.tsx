import { cn } from "@/lib/utils";
import { formatClock } from "@/lib/format";

/** Phase keys, compatible with `RoastPhase["key"]` from utils/roastProfileView. */
export type PhaseBarKey = "drying" | "maillard" | "beforeCrack" | "development";

/** One coloured segment, in seconds since charge. `RoastPhase` objects fit as-is. */
export interface PhaseBarSegment {
  key: PhaseBarKey;
  label: string;
  start: number;
  end: number;
}

/** A tick on the bar, in seconds since charge. */
export interface PhaseBarMarker {
  s: number;
  label: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const PHASE_BG: Record<PhaseBarKey, string> = {
  drying: "bg-phase-drying",
  maillard: "bg-phase-maillard",
  beforeCrack: "bg-phase-precrack",
  development: "bg-phase-development",
};

export interface PhaseBarProps {
  phases: PhaseBarSegment[];
  /**
   * Length of the time scale in seconds. Defaults to the largest of: last phase end,
   * currentS, markers and ghost markers. Pass max(expected drop, elapsed) in the console.
   */
  totalS?: number;
  /** Solid ticks on the bar (e.g. second crack) */
  markers?: PhaseBarMarker[];
  /** Dashed reference ticks above the bar (e.g. the reference roast's Y, FC, Drop) */
  ghostMarkers?: PhaseBarMarker[];
  /** Live position: draws a cursor at this time (seconds) */
  currentS?: number;
  /** sm: 6px (cards) · md: 12px (summaries) · lg: 20px (console) */
  size?: "sm" | "md" | "lg";
  /** Show the phase legend with durations and share of the roast */
  showLegend?: boolean;
  /** Replaces the generated accessible description. Pass "" to hide the bar from assistive tech. */
  ariaLabel?: string;
  className?: string;
}

const HEIGHT = { sm: "h-1.5", md: "h-3", lg: "h-5" } as const;
const MARKER = { sm: "-top-0.5 h-2.5", md: "-top-1 h-5", lg: "-top-1.5 h-8" } as const;

const pct = (s: number, total: number) => `${Math.min(100, Math.max(0, (s / total) * 100))}%`;

/** Roast phase ribbon. Only draws what real marks support; empty phases render an empty track. */
export function PhaseBar({
  phases,
  totalS,
  markers = [],
  ghostMarkers = [],
  currentS,
  size = "md",
  showLegend = false,
  ariaLabel,
  className,
}: PhaseBarProps) {
  const scale = Math.max(
    totalS ?? 0,
    phases.length ? phases[phases.length - 1].end : 0,
    currentS ?? 0,
    ...markers.map((m) => m.s),
    ...ghostMarkers.map((m) => m.s),
  );
  const total = scale > 0 ? scale : 1;
  const roastLength = phases.length ? phases[phases.length - 1].end - phases[0].start : 0;
  const share = (p: PhaseBarSegment) => (roastLength > 0 ? ((p.end - p.start) / roastLength) * 100 : 0);

  const generated = [
    phases.length
      ? `Roast phases: ${phases.map((p) => `${p.label} ${formatClock(p.end - p.start)} (${share(p).toFixed(0)}%)`).join(", ")}`
      : "No phases marked yet",
    ...markers.map((m) => `${m.label} at ${formatClock(m.s)}`),
    ...ghostMarkers.map((m) => `Reference ${m.label} at ${formatClock(m.s)}`),
  ].join(". ");
  const label = ariaLabel ?? generated;
  const hasGhosts = ghostMarkers.length > 0;

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn("relative", hasGhosts && (size === "lg" ? "pt-6" : "pt-3"))}
        {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      >
        {hasGhosts && (
          <div className="absolute inset-x-0 top-0 h-full" aria-hidden>
            {ghostMarkers.map((m) => (
              <div key={`${m.label}-${m.s}`} className="absolute top-0 flex -translate-x-1/2 flex-col items-center" style={{ left: pct(m.s, total) }}>
                {size === "lg" && (
                  <span className="mb-0.5 whitespace-nowrap font-mono text-[11px] leading-none text-muted-foreground">{m.label}</span>
                )}
                <span className={cn("w-0 border-l border-dashed border-muted-foreground", size === "lg" ? "h-3" : "h-2.5")} />
              </div>
            ))}
          </div>
        )}
        <div className="relative">
          <div className={cn("relative w-full overflow-hidden rounded-full bg-muted", HEIGHT[size])}>
            {phases.map((phase) => (
              <div
                key={`${phase.key}-${phase.start}`}
                className={cn("absolute inset-y-0", PHASE_BG[phase.key])}
                style={{ left: pct(phase.start, total), width: pct(Math.max(0, phase.end - phase.start), total) }}
              />
            ))}
          </div>
          {markers.map((m) => (
            <div
              key={`${m.label}-${m.s}`}
              className={cn("absolute w-0.5 rounded bg-foreground", MARKER[size])}
              style={{ left: `calc(${pct(m.s, total)} - 1px)` }}
              aria-hidden
            />
          ))}
          {currentS !== undefined && (
            <div
              className={cn("absolute w-0.5 rounded bg-accent", MARKER[size])}
              style={{ left: `calc(${pct(currentS, total)} - 1px)` }}
              aria-hidden
            />
          )}
        </div>
      </div>

      {showLegend && (phases.length > 0 || markers.length > 0) && (
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-hidden>
          {phases.map((phase) => (
            <li key={`${phase.key}-${phase.start}`} className="flex items-center gap-2">
              <span className={cn("h-2.5 w-2.5 rounded-full", PHASE_BG[phase.key])} />
              <span className="text-muted-foreground">{phase.label}</span>
              <span className="font-mono tabular-nums">{formatClock(phase.end - phase.start)}</span>
              <span className="text-muted-foreground">· {share(phase).toFixed(0)}%</span>
            </li>
          ))}
          {markers.map((m) => (
            <li key={`${m.label}-${m.s}`} className="flex items-center gap-2">
              <span className="h-3 w-0.5 rounded bg-foreground" />
              <span className="text-muted-foreground">{m.label}</span>
              <span className="font-mono tabular-nums">{formatClock(m.s)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
