import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_COLORS, CHART_TOOLTIP_STYLE, minuteTicks, signedClock } from "@/components/profile/chartTheme";
import { COMPARE_COLORS, COMPARE_LABELS, type CompareRoast } from "@/types/comparison.types";
import { deriveChartPoints } from "@/utils/roastProfileView";
import type { TemperatureUnit } from "@/utils/temperatureConversion";

interface ComparisonChartProps {
  roasts: CompareRoast[];
  unit: TemperatureUnit;
  /** Shift each roast so its first crack is at 0:00 */
  alignOnFirstCrack: boolean;
}

interface Series {
  roast: CompareRoast;
  offset: number;
  points: Array<{ time: number; bean: number }>;
}

/** Bean temperature of up to two roasts on a real time axis (seconds since charge, or since first crack). */
export function ComparisonChart({ roasts, unit, alignOnFirstCrack }: ComparisonChartProps) {
  const series = useMemo<Series[]>(
    () =>
      roasts.map((roast) => {
        const offset = alignOnFirstCrack ? roast.facts.firstCrack?.time ?? 0 : 0;
        const points = deriveChartPoints(roast.row, unit)
          .filter((p): p is { time: number; bean: number } => p.bean !== undefined)
          .map((p) => ({ time: p.time - offset, bean: p.bean }));
        return { roast, offset, points };
      }),
    [roasts, unit, alignOnFirstCrack],
  );

  const withData = series.filter((s) => s.points.length >= 3);

  const domain = useMemo(() => {
    const starts = series.map((s) => -s.offset);
    const ends = series.map((s) => Math.max(s.roast.facts.totalSeconds - s.offset, s.points[s.points.length - 1]?.time ?? 0));
    return [Math.min(0, ...starts), Math.max(60, ...ends)] as const;
  }, [series]);

  const yTicks = useMemo(() => {
    const values = withData.flatMap((s) => s.points.map((p) => p.bean));
    if (!values.length) return [0, 100];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const step = [10, 20, 25, 50, 100].find((st) => (max - min) / st <= 5) ?? 100;
    const ticks: number[] = [];
    for (let t = Math.floor(min / step) * step; t <= Math.ceil(max / step) * step; t += step) ticks.push(t);
    return ticks;
  }, [withData]);

  const summary = withData
    .map((s) => `${COMPARE_LABELS[s.roast.slot]}, ${s.roast.card.title}: ${s.points.length} readings`)
    .join(". ");

  return (
    <div className="h-64 w-full sm:h-80" role="img" aria-label={`Bean temperature over time${alignOnFirstCrack ? ", aligned on first crack" : ""}. ${summary}.`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart margin={{ top: 22, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey="time"
            type="number"
            domain={[domain[0], domain[1]]}
            ticks={minuteTicks(domain[0], domain[1])}
            tickFormatter={signedClock}
            allowDuplicatedCategory={false}
            stroke={CHART_COLORS.axis}
            fontSize={12}
            fontFamily="var(--font-mono)"
            tickLine={false}
          />
          <YAxis
            domain={[yTicks[0], yTicks[yTicks.length - 1]]}
            ticks={yTicks}
            stroke={CHART_COLORS.axis}
            fontSize={12}
            fontFamily="var(--font-mono)"
            width={44}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}°`}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            labelFormatter={(v) => `${signedClock(Number(v))}${alignOnFirstCrack ? " from first crack" : ""}`}
            formatter={(value, name) => [`${Math.round(Number(value))} °${unit}`, String(name)]}
          />
          {alignOnFirstCrack ? (
            <ReferenceLine x={0} stroke={CHART_COLORS.development} strokeWidth={1.5} label={{ value: "FC", position: "top", fill: CHART_COLORS.label, fontSize: 11 }} />
          ) : (
            series.map((s) =>
              s.roast.facts.firstCrack ? (
                <ReferenceLine
                  key={`fc-${s.roast.slot}`}
                  x={s.roast.facts.firstCrack.time}
                  stroke={COMPARE_COLORS[s.roast.slot]}
                  strokeDasharray="4 3"
                  label={{ value: `FC ${s.roast.slot.toUpperCase()}`, position: "top", fill: CHART_COLORS.label, fontSize: 11 }}
                />
              ) : null,
            )
          )}
          {series.map((s) =>
            s.roast.facts.totalSeconds > 0 ? (
              <ReferenceLine
                key={`drop-${s.roast.slot}`}
                x={s.roast.facts.totalSeconds - s.offset}
                stroke={COMPARE_COLORS[s.roast.slot]}
                strokeOpacity={0.6}
                strokeDasharray="2 3"
              />
            ) : null,
          )}
          {withData.map((s) => (
            <Line
              key={s.roast.slot}
              data={s.points}
              dataKey="bean"
              name={`${COMPARE_LABELS[s.roast.slot]} · ${s.roast.card.title}`}
              type="linear"
              stroke={COMPARE_COLORS[s.roast.slot]}
              strokeWidth={2.5}
              strokeDasharray={s.roast.slot === "b" ? "6 3" : undefined}
              dot={{ r: 2.5, fill: COMPARE_COLORS[s.roast.slot], strokeWidth: 0 }}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
