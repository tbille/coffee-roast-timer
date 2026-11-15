import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { TemperatureUnit } from "@/utils/temperatureConversion";
import { formatClock, type ChartPoint, type RoastFacts } from "@/utils/roastProfileView";

interface RoastCurveChartProps {
  points: ChartPoint[];
  facts: RoastFacts;
  unit: TemperatureUnit;
  onUnitChange: (unit: TemperatureUnit) => void;
  /** Explains where temperatures come from on roasters without a display */
  contextNote?: string | null;
}

const BEAN = "hsl(var(--primary))";
const SETPOINT = "hsl(var(--temperature-hot))";
const DEVELOPMENT = "hsl(var(--phase-development))";

function minuteTicks(total: number): number[] {
  const step = total > 16 * 60 ? 180 : total > 8 * 60 ? 120 : 60;
  const ticks: number[] = [];
  for (let t = 0; t <= total; t += step) ticks.push(t);
  return ticks;
}

export function RoastCurveChart({ points, facts, unit, onUnitChange, contextNote }: RoastCurveChartProps) {
  const total = Math.max(facts.totalSeconds, points[points.length - 1]?.time ?? 0);
  const hasSetpoint = points.some((p) => p.setpoint !== undefined);
  const fc = facts.firstCrack?.time;
  const sc = facts.secondCrack?.time;

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

  return (
    <Card className="shadow-coffee">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle as="h2" className="text-lg">Temperature curve</CardTitle>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-hidden>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded" style={{ background: BEAN }} /> Measured
            </span>
            {hasSetpoint && (
              <span className="flex items-center gap-1.5">
                <span className="h-0 w-4 border-t-2 border-dashed" style={{ borderColor: SETPOINT }} /> Setpoint
              </span>
            )}
            {fc !== undefined && (
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-4 rounded-sm opacity-30" style={{ background: DEVELOPMENT }} /> Development
              </span>
            )}
            {fc !== undefined && (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-px" style={{ background: DEVELOPMENT }} /> FC / SC: first and second crack
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
          <ToggleGroupItem value="C" aria-label="Celsius" className="h-8 px-2.5">°C</ToggleGroupItem>
          <ToggleGroupItem value="F" aria-label="Fahrenheit" className="h-8 px-2.5">°F</ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent className="px-2 pb-4 sm:px-6">
        <div className="h-64 w-full sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 22, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              {fc !== undefined && (
                <ReferenceArea x1={fc} x2={total} fill={DEVELOPMENT} fillOpacity={0.12} ifOverflow="extendDomain" />
              )}
              <XAxis
                dataKey="time"
                type="number"
                domain={[0, total]}
                ticks={minuteTicks(total)}
                tickFormatter={formatClock}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                domain={[yTicks[0], yTicks[yTicks.length - 1]]}
                ticks={yTicks}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                width={44}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}°`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  color: "hsl(var(--popover-foreground))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  fontSize: 13,
                }}
                labelFormatter={(v) => formatClock(Number(v))}
                formatter={(value: number, name: string) => [`${Math.round(value)}°${unit}`, name]}
              />
              {fc !== undefined && (
                <ReferenceLine
                  x={fc}
                  stroke={DEVELOPMENT}
                  strokeWidth={1.5}
                  label={{ value: "FC", position: "top", fill: "hsl(var(--foreground))", fontSize: 11 }}
                />
              )}
              {sc !== undefined && (
                <ReferenceLine
                  x={sc}
                  stroke="hsl(var(--foreground))"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  label={{ value: "SC", position: "top", fill: "hsl(var(--foreground))", fontSize: 11 }}
                />
              )}
              {hasSetpoint && (
                <Line
                  type="stepAfter"
                  dataKey="setpoint"
                  name="Setpoint"
                  stroke={SETPOINT}
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
                name="Measured"
                stroke={BEAN}
                strokeWidth={2.5}
                dot={{ r: 3, fill: BEAN, strokeWidth: 0 }}
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
