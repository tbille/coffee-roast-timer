import { formatClock, formatPercent } from "@/lib/format";

export interface TrendPoint {
  /** ISO date, used for ordering only */
  at: string;
  firstCrackS?: number;
  devPercent?: number;
  lossPercent?: number;
}

interface TrendStripProps {
  /** Roasts in any order; the last 10 by date are used. */
  points: TrendPoint[];
}

const W = 96;
const H = 28;
const PAD = 3;

function Sparkline({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = values.length > 1 ? (W - PAD * 2) / (values.length - 1) : 0;
  const coords = values.map((v, i) => [PAD + i * step, H - PAD - ((v - min) / span) * (H - PAD * 2)] as const);
  const d = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const [lx, ly] = coords[coords.length - 1];
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden className="shrink-0 overflow-visible">
      <path d={d} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" className="text-muted-foreground/70" />
      <circle cx={lx} cy={ly} r={2.5} className="fill-foreground" />
    </svg>
  );
}

const METRICS: Array<{ key: keyof Omit<TrendPoint, "at">; label: string; format: (v: number) => string }> = [
  { key: "firstCrackS", label: "First crack", format: (v) => formatClock(v) },
  { key: "devPercent", label: "Development", format: (v) => formatPercent(v) },
  { key: "lossPercent", label: "Loss", format: (v) => formatPercent(v) },
];

/** Last 10 roasts: first crack time, development %, loss %. Neutral sparklines with the latest value. */
export function TrendStrip({ points }: TrendStripProps) {
  const recent = [...points].sort((a, b) => a.at.localeCompare(b.at)).slice(-10);
  if (recent.length < 3) return null;

  return (
    <section aria-labelledby="trend-heading" className="rounded-lg border bg-card p-4 sm:p-5">
      <h2 id="trend-heading" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Last {recent.length} roasts
      </h2>
      <dl className="mt-3 grid gap-4 sm:grid-cols-3">
        {METRICS.map((m) => {
          const values = recent.map((p) => p[m.key]).filter((v): v is number => typeof v === "number" && Number.isFinite(v));
          const latest = values[values.length - 1];
          return (
            <div key={m.key} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{m.label}</dt>
                <dd className="mt-0.5 font-mono text-lg tabular-nums">
                  {latest !== undefined ? m.format(latest) : <span className="text-muted-foreground/60">—</span>}
                  {values.length >= 2 && (
                    <span className="sr-only">
                      {` latest; ${values.length} roasts ranged from ${m.format(Math.min(...values))} to ${m.format(Math.max(...values))}`}
                    </span>
                  )}
                </dd>
              </div>
              {values.length >= 2 && <Sparkline values={values} />}
            </div>
          );
        })}
      </dl>
    </section>
  );
}
