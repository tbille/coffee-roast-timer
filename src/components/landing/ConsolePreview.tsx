import { Sun } from "lucide-react";
import { PhaseBar, type PhaseBarSegment } from "@/components/roast-card/PhaseBar";
import { cn } from "@/lib/utils";

// A frozen moment of a real roast: yellowing at 4:30, first crack at 8:30, now 9:42.
const NOW_S = 9 * 60 + 42;
const YELLOWING_S = 4 * 60 + 30;
const FIRST_CRACK_S = 8 * 60 + 30;

const PHASES: PhaseBarSegment[] = [
  { key: "drying", label: "Drying", start: 0, end: YELLOWING_S },
  { key: "maillard", label: "Maillard", start: YELLOWING_S, end: FIRST_CRACK_S },
  { key: "development", label: "Development", start: FIRST_CRACK_S, end: NOW_S },
];

const LOG = [
  { t: "9:10", label: "Heat 7" },
  { t: "8:30", label: "First crack" },
  { t: "6:05", label: "Fan 9" },
];

/**
 * Static, non-interactive miniature of the roast console, built from the same
 * PhaseBar and tokens as the real thing. Decorative: hidden from assistive tech,
 * the caption carries the meaning.
 */
export function ConsolePreview({ className }: { className?: string }) {
  return (
    <figure className={cn("min-w-0", className)}>
      <div
        aria-hidden
        className="pointer-events-none select-none overflow-hidden rounded-lg border bg-card text-card-foreground"
      >
        <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5 text-xs text-muted-foreground">
          <span className="truncate font-medium text-foreground">FreshRoast SR800</span>
          <span className="flex shrink-0 items-center gap-1.5">
            <Sun className="h-3.5 w-3.5" strokeWidth={1.75} />
            Screen stays on
          </span>
        </div>

        <div className="space-y-5 px-4 pb-4 pt-6 sm:px-6">
          <div className="text-center">
            <p className="font-mono text-6xl font-semibold leading-none tracking-tight tabular-nums sm:text-7xl">9:42</p>
            <p className="mt-3 font-mono text-sm tabular-nums text-muted-foreground">
              <span className="font-sans">Development</span> 1:12 · 12%
            </p>
          </div>

          <PhaseBar phases={PHASES} totalS={11 * 60} currentS={NOW_S} size="lg" ariaLabel="" />

          <div className="flex items-center justify-between gap-3 text-sm">
            <p className="font-mono tabular-nums">
              <span className="font-sans text-control-heat">Heat</span> 7
              <span className="px-1.5 text-muted-foreground">·</span>
              <span className="font-sans text-control-air">Fan</span> 9
            </p>
            <ul className="hidden space-y-0.5 text-right text-xs text-muted-foreground sm:block">
              {LOG.slice(0, 2).map((e) => (
                <li key={e.t}>
                  <span className="font-mono tabular-nums">{e.t}</span> {e.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <div className="flex h-16 items-center justify-between rounded-lg bg-accent px-5 text-accent-foreground">
              <span className="text-lg font-semibold">Drop</span>
              <span className="rounded border border-current/40 px-1.5 py-0.5 font-mono text-xs opacity-80">D</span>
            </div>
            <div className="flex gap-2">
              <span className="flex h-10 flex-1 items-center justify-center rounded-md border text-sm">Second crack</span>
              <span className="flex h-10 flex-1 items-center justify-center rounded-md border text-sm text-muted-foreground">
                Undo
              </span>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        The roast screen at 9:42 on a FreshRoast SR800: first crack was tapped at 8:30, so it shows 1:12 of development.
      </figcaption>
    </figure>
  );
}
