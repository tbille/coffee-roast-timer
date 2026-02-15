import { RoastStatistics, formatDuration, formatTemperature, formatPercentage } from '@/utils/roastStatistics';
import { COMPARISON_COLORS } from '@/types/comparison.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ComparisonStatsProps {
  stats: [RoastStatistics, RoastStatistics | null];
  profileNames: [string, string | null];
}

interface StatRow {
  label: string;
  value1: string;
  value2: string | null;
  diff?: string;
  isDifferent?: boolean;
}

export const ComparisonStats = ({ stats, profileNames }: ComparisonStatsProps) => {
  const [stats1, stats2] = stats;
  const [name1, name2] = profileNames;

  const formatStat = (value: number | undefined, formatter: (v: number) => string): string => {
    return value !== undefined ? formatter(value) : 'N/A';
  };

  const calculateDiff = (val1: number | undefined, val2: number | undefined): string | null => {
    if (val1 === undefined || val2 === undefined) return null;
    const diff = val2 - val1;
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff.toFixed(1)}`;
  };

  const rows: StatRow[] = [
    {
      label: 'Total Duration',
      value1: formatDuration(stats1.duration),
      value2: stats2 ? formatDuration(stats2.duration) : null,
      diff: stats2 ? calculateDiff(stats1.duration, stats2.duration) + 's' : undefined,
      isDifferent: stats2 ? Math.abs(stats1.duration - stats2.duration) > 5 : false,
    },
    {
      label: 'First Crack Time',
      value1: stats1.firstCrackTime ? formatDuration(stats1.firstCrackTime) : 'N/A',
      value2: stats2?.firstCrackTime ? formatDuration(stats2.firstCrackTime) : stats2 ? 'N/A' : null,
      diff: stats2 && stats1.firstCrackTime && stats2.firstCrackTime 
        ? calculateDiff(stats1.firstCrackTime, stats2.firstCrackTime) + 's' 
        : undefined,
      isDifferent: stats2 && stats1.firstCrackTime && stats2.firstCrackTime
        ? Math.abs(stats1.firstCrackTime - stats2.firstCrackTime) > 5
        : false,
    },
    {
      label: 'First Crack Temp',
      value1: formatStat(stats1.firstCrackTemp, (v) => formatTemperature(v)),
      value2: stats2 ? formatStat(stats2.firstCrackTemp, (v) => formatTemperature(v)) : null,
      diff: stats2 && stats1.firstCrackTemp && stats2.firstCrackTemp
        ? calculateDiff(stats1.firstCrackTemp, stats2.firstCrackTemp) + '°'
        : undefined,
      isDifferent: stats2 && stats1.firstCrackTemp && stats2.firstCrackTemp
        ? Math.abs(stats1.firstCrackTemp - stats2.firstCrackTemp) > 5
        : false,
    },
    {
      label: 'Final Temperature',
      value1: formatTemperature(stats1.finalTemp),
      value2: stats2 ? formatTemperature(stats2.finalTemp) : null,
      diff: stats2 ? calculateDiff(stats1.finalTemp, stats2.finalTemp) + '°' : undefined,
      isDifferent: stats2 ? Math.abs(stats1.finalTemp - stats2.finalTemp) > 5 : false,
    },
    {
      label: 'Development Time',
      value1: stats1.developmentTime ? formatDuration(stats1.developmentTime) : 'N/A',
      value2: stats2?.developmentTime ? formatDuration(stats2.developmentTime) : stats2 ? 'N/A' : null,
      diff: stats2 && stats1.developmentTime && stats2.developmentTime
        ? calculateDiff(stats1.developmentTime, stats2.developmentTime) + 's'
        : undefined,
      isDifferent: stats2 && stats1.developmentTime && stats2.developmentTime
        ? Math.abs(stats1.developmentTime - stats2.developmentTime) > 5
        : false,
    },
    {
      label: 'Development Ratio',
      value1: formatPercentage(stats1.developmentRatio),
      value2: stats2 ? formatPercentage(stats2.developmentRatio) : null,
      diff: stats2 && stats1.developmentRatio && stats2.developmentRatio
        ? calculateDiff(stats1.developmentRatio, stats2.developmentRatio) + '%'
        : undefined,
      isDifferent: stats2 && stats1.developmentRatio && stats2.developmentRatio
        ? Math.abs(stats1.developmentRatio - stats2.developmentRatio) > 2
        : false,
    },
    {
      label: 'Weight Loss',
      value1: formatPercentage(stats1.weightLossPercent),
      value2: stats2 ? formatPercentage(stats2.weightLossPercent) : null,
      diff: stats2 && stats1.weightLossPercent && stats2.weightLossPercent
        ? calculateDiff(stats1.weightLossPercent, stats2.weightLossPercent) + '%'
        : undefined,
      isDifferent: stats2 && stats1.weightLossPercent && stats2.weightLossPercent
        ? Math.abs(stats1.weightLossPercent - stats2.weightLossPercent) > 1
        : false,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Statistics Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop: Table Layout */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Metric</th>
                <th className="text-center py-2 font-medium" style={{ color: COMPARISON_COLORS[0] }}>
                  {name1}
                </th>
                {name2 && (
                  <>
                    <th className="text-center py-2 font-medium" style={{ color: COMPARISON_COLORS[1] }}>
                      {name2}
                    </th>
                    <th className="text-center py-2 font-medium text-muted-foreground">Difference</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="py-3 font-medium">{row.label}</td>
                  <td className="text-center py-3">{row.value1}</td>
                  {name2 && (
                    <>
                      <td className="text-center py-3">{row.value2}</td>
                      <td className={`text-center py-3 ${row.isDifferent ? 'font-semibold text-amber-600' : 'text-muted-foreground'}`}>
                        {row.diff || '-'}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: Card Layout */}
        <div className="md:hidden space-y-3">
          {rows.map((row, idx) => (
            <div key={idx} className="border rounded-lg p-3">
              <div className="font-medium text-sm mb-2">{row.label}</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-muted-foreground mb-1" style={{ color: COMPARISON_COLORS[0] }}>
                    {name1}
                  </div>
                  <div className="font-semibold">{row.value1}</div>
                </div>
                {name2 && row.value2 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1" style={{ color: COMPARISON_COLORS[1] }}>
                      {name2}
                    </div>
                    <div className="font-semibold">{row.value2}</div>
                  </div>
                )}
              </div>
              {row.diff && (
                <div className={`mt-2 pt-2 border-t text-sm ${row.isDifferent ? 'font-semibold text-amber-600' : 'text-muted-foreground'}`}>
                  Difference: {row.diff}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
