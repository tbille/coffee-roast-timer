import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { TemperatureUnit } from "@/utils/temperatureConversion";
import { formatClock } from "@/lib/format";
import { CHART_COLORS, CHART_TOOLTIP_STYLE, minuteTicks } from "./chartTheme";
import type { ChartPoint, RoastEventMark, RoastFacts } from "@/utils/roastProfileView";

interface RoastCurveChartProps {
  points: ChartPoint[];
  facts: RoastFacts;
  /** Marked moments drawn as reference lines (yellowing, FC, SC, drop) */
  marks?: RoastEventMark[];
  unit: TemperatureUnit;
  onUnitChange: (unit: TemperatureUnit) => void;
  /** Explains where temperatures come from on roasters without a display */
  contextNote?: string | null;
}

export function RoastCurveChart({ points, facts, marks = [], unit, onUnitChange, contextNote }: RoastCurveChartProps) {
  const total = Math.max(facts.totalSeconds, points[points.length - 1]?.time ?? 0);
  const hasSetpoint = points.some((p) => p.setpoint !== undefined);
  const fc = facts.firstCrack?.time;

  const yTicks = useMemo(() => {
    const values = points.flatMap((p) => [p.bean, p.setpoint]).filter((v): v is number => v !== undefined);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const step = [10, 20, 25, 50, 100].find((s) => (max - min) / s <= 5) ?? 100;
    const lo = Math.floor(min / step) * step;
    const hi = Math.ceil(max / step) * step;
    const ticks: number[] = [];
    for (let t = lo; t <= hi; t += step) ticks.push(t);
    return ticks;
  }, [points]);

  const beanCount = points.filter((p) => p.bean !== undefined).length;
  const summary = `Temperature curve with ${beanCount} readings over ${formatClock(total)}. ${marks
    .map((m) => `${m.label} at ${formatClock(m.s)}`)
    .join(", ")}.`;

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle as="h2" className="text-lg">Temperature curve</CardTitle>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-hidden>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded" style={{ background: CHART_COLORS.bean }} /> Bean
            </span>
            {hasSetpoint && (
              <span className="flex items-center gap-1.5">
                <span className="h-0 w-4 border-t-2 border-dashed" style={{ borderColor: CHART_COLORS.setpoint }} /> Setpoint
              </span>
            )}
            {fc !== undefined && (
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-4 rounded-sm opacity-20" style={{ background: CHART_COLORS.development }} /> Development
              </span>
            )}
          </div>
        </div>
        <ToggleGroup
          type="single"
          size="sm"
          variant="outline"
          value={unit}
          onValueChange={(v) => v && onUnitChange(v as TemperatureUnit)}
          aria-label="Temperature unit"
        >
          <ToggleGroupItem value="C" aria-label="Celsius" className="h-8 px-2.5 font-mono">°C</ToggleGroupItem>
          <ToggleGroupItem value="F" aria-label="Fahrenheit" className="h-8 px-2.5 font-mono">°F</ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent className="px-2 pb-4 sm:px-6">
        <div className="h-64 w-full sm:h-80" role="img" aria-label={summary}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 22, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
              {fc !== undefined && (
                <ReferenceArea x1={fc} x2={total} fill={CHART_COLORS.development} fillOpacity={0.1} ifOverflow="extendDomain" />
              )}
              <XAxis
                dataKey="time"
                type="number"
                domain={[0, total]}
                ticks={minuteTicks(0, total)}
                tickFormatter={formatClock}
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
                labelFormatter={(v) => formatClock(Number(v))}
                formatter={(value, name) => [`${Math.round(Number(value))} °${unit}`, String(name)]}
              />
              {marks.map((m) => (
                <ReferenceLine
                  key={m.kind}
                  x={m.s}
                  stroke={m.kind === "first_crack" ? CHART_COLORS.development : CHART_COLORS.mark}
                  strokeWidth={m.kind === "first_crack" ? 1.5 : 1}
                  strokeDasharray={m.kind === "first_crack" ? undefined : "4 3"}
                  ifOverflow="extendDomain"
                  label={{ value: m.short, position: "top", fill: CHART_COLORS.label, fontSize: 11 }}
                />
              ))}
              {hasSetpoint && (
                <Line
                  type="stepAfter"
                  dataKey="setpoint"
                  name="Setpoint"
                  stroke={CHART_COLORS.setpoint}
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                />
              )}
              <Line
                type="linear"
                dataKey="bean"
                name="Bean"
                stroke={CHART_COLORS.bean}
                strokeWidth={2.5}
                dot={{ r: 3, fill: CHART_COLORS.bean, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                connectNulls
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {contextNote && <p className="mt-3 px-2 text-xs leading-relaxed text-muted-foreground sm:px-0">{contextNote}</p>}
      </CardContent>
    </Card>
  );
}
