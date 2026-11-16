import { formatClock, formatClockDelta, formatPercent } from "@/lib/format";
import { COMPARE_COLORS, COMPARE_LABELS, type CompareRoast } from "@/types/comparison.types";

interface ComparisonStatsProps {
  a?: CompareRoast | null;
  b?: CompareRoast | null;
}

interface Row {
  label: string;
  a?: string;
  b?: string;
  delta?: string;
}

const clock = (s?: number) => (s !== undefined ? formatClock(s) : undefined);
const pct = (v?: number) => (v !== undefined ? formatPercent(v) : undefined);
const clockDelta = (x?: number, y?: number) => (x !== undefined && y !== undefined ? formatClockDelta(y - x) : undefined);
const pctDelta = (x?: number, y?: number) => {
  if (x === undefined || y === undefined) return undefined;
  const d = y - x;
  const r = Math.round(d * 10) / 10;
  return `${r > 0 ? "+" : r < 0 ? "-" : ""}${Math.abs(r).toFixed(1)} pts`;
};

/** Side-by-side numbers with the difference B − A. Facts only, no judgement. */
export function ComparisonStats({ a, b }: ComparisonStatsProps) {
  const fa = a?.facts;
  const fb = b?.facts;
  const rows: Row[] = [
    { label: "Total", a: clock(fa?.totalSeconds || undefined), b: clock(fb?.totalSeconds || undefined), delta: clockDelta(fa?.totalSeconds, fb?.totalSeconds) },
    { label: "Yellowing", a: clock(fa?.yellowing), b: clock(fb?.yellowing), delta: clockDelta(fa?.yellowing, fb?.yellowing) },
    { label: "First crack", a: clock(fa?.firstCrack?.time), b: clock(fb?.firstCrack?.time), delta: clockDelta(fa?.firstCrack?.time, fb?.firstCrack?.time) },
    { label: "Dev time", a: clock(fa?.developmentSeconds), b: clock(fb?.developmentSeconds), delta: clockDelta(fa?.developmentSeconds, fb?.developmentSeconds) },
    { label: "Dev", a: pct(fa?.developmentPercent), b: pct(fb?.developmentPercent), delta: pctDelta(fa?.developmentPercent, fb?.developmentPercent) },
    { label: "Loss", a: pct(fa?.weightLossPercent), b: pct(fb?.weightLossPercent), delta: pctDelta(fa?.weightLossPercent, fb?.weightLossPercent) },
    { label: "Batch", a: fa?.weightIn ? `${fa.weightIn} g` : undefined, b: fb?.weightIn ? `${fb.weightIn} g` : undefined },
    { label: "Level", a: a?.card.levelLabel, b: b?.card.levelLabel },
  ].filter((r) => r.a || r.b);

  const dash = <span className="text-muted-foreground/60">—</span>;

  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full min-w-[22rem] text-sm">
        <caption className="sr-only">Roast numbers side by side, with the difference B minus A</caption>
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="px-4 py-3 font-medium">
              <span className="sr-only">Measure</span>
            </th>
            {(["a", "b"] as const).map((slot) => (
              <th key={slot} scope="col" className="px-4 py-3 text-right font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-0.5 w-3 rounded" style={{ background: COMPARE_COLORS[slot] }} aria-hidden />
                  {COMPARE_LABELS[slot]}
                </span>
              </th>
            ))}
            <th scope="col" className="px-4 py-3 text-right font-medium">B − A</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b last:border-0">
              <th scope="row" className="px-4 py-2.5 text-left font-normal text-muted-foreground">{row.label}</th>
              <td className="px-4 py-2.5 text-right font-mono font-semibold tabular-nums">{row.a ?? dash}</td>
              <td className="px-4 py-2.5 text-right font-mono font-semibold tabular-nums">{row.b ?? dash}</td>
              <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">{row.delta ?? dash}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
