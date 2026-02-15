import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ComparisonProfile, ComparisonChartDataPoint } from '@/types/comparison.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDuration } from '@/utils/roastStatistics';

interface ComparisonChartProps {
  profiles: ComparisonProfile[];
}

export function ComparisonChart({ profiles }: ComparisonChartProps) {
  const chartData = useMemo(() => {
    if (profiles.length === 0) return [];

    const maxLength = Math.max(
      ...profiles.map((p) => p.profile.temperature_data?.length || 0)
    );

    return Array.from({ length: maxLength }, (_, i): ComparisonChartDataPoint => {
      const dataPoint: ComparisonChartDataPoint = { time: i };
      
      profiles.forEach((cp, index) => {
        const tempData = cp.profile.temperature_data?.[i];
        if (tempData) {
          const key = `profile${index + 1}` as keyof ComparisonChartDataPoint;
          dataPoint[key] = tempData.currentTemp;
        }
      });

      return dataPoint;
    });
  }, [profiles]);

  if (profiles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Temperature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Select profiles to compare
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Temperature Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--foreground))"
              label={{
                value: 'Time (seconds)',
                position: 'insideBottom',
                offset: -5
              }}
            />
            <YAxis 
              stroke="hsl(var(--foreground))"
              label={{
                value: 'Temperature (°C)',
                angle: -90,
                position: 'insideLeft'
              }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)"
              }}
              labelFormatter={(value) => `Time: ${formatDuration(value as number)}`}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            {profiles.map((cp, index) => {
              const key = `profile${index + 1}` as keyof ComparisonChartDataPoint;
              return (
                <Line
                  key={cp.profile.id}
                  type="monotone"
                  dataKey={key}
                  stroke={cp.color}
                  strokeWidth={2}
                  dot={false}
                  name={cp.profile.beans_name}
                />
              );
            })}

            {/* Crack event markers */}
            {profiles.map((cp, index) => {
              const crackEvents = cp.profile.crack_events || [];
              return crackEvents.map((crack, crackIndex) => (
                <ReferenceLine
                  key={`${cp.profile.id}-${crack.type}-${crackIndex}`}
                  x={crack.time}
                  stroke={cp.color}
                  strokeDasharray={crack.type === 'first' ? '5 5' : '3 3'}
                  strokeWidth={1.5}
                  opacity={0.6}
                  label={{
                    value: crack.type === 'first' ? 'FC' : 'SC',
                    position: 'top',
                    style: {
                      fontSize: '10px',
                      fill: cp.color
                    }
                  }}
                />
              ));
            })}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
