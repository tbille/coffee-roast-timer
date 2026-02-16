import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Thermometer, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdvancedMetricsData {
  rateOfRise?: number;           // °C/min
  tempDelta?: number;             // °C change from last reading
  environmentalTemp?: number;     // Ambient temperature
  beanTemp?: number;              // Current bean temp
  timeElapsed?: number;           // For context
}

interface AdvancedMetricsProps {
  data: AdvancedMetricsData;
  className?: string;
}

/**
 * Calculate Rate of Rise (RoR) from temperature data
 * RoR = temperature change per minute
 */
export const calculateRoR = (
  currentTemp: number,
  previousTemp: number,
  timeInterval: number // in seconds
): number => {
  if (timeInterval === 0) return 0;
  
  const tempChange = currentTemp - previousTemp;
  const timeInMinutes = timeInterval / 60;
  const ror = tempChange / timeInMinutes;
  
  return Math.round(ror * 10) / 10; // Round to 1 decimal
};

/**
 * Get RoR status indicator
 */
const getRoRStatus = (ror: number | undefined): {
  label: string;
  color: string;
  description: string;
} => {
  if (ror === undefined) {
    return {
      label: 'N/A',
      color: 'text-muted-foreground',
      description: 'Waiting for data'
    };
  }
  
  if (ror > 15) {
    return {
      label: 'Too Fast',
      color: 'text-red-600 dark:text-red-400',
      description: 'Roast accelerating too quickly'
    };
  } else if (ror > 10) {
    return {
      label: 'Fast',
      color: 'text-orange-600 dark:text-orange-400',
      description: 'Rapid development'
    };
  } else if (ror >= 5) {
    return {
      label: 'Optimal',
      color: 'text-green-600 dark:text-green-400',
      description: 'Good rate of rise'
    };
  } else if (ror >= 2) {
    return {
      label: 'Slow',
      color: 'text-yellow-600 dark:text-yellow-400',
      description: 'Development slowing'
    };
  } else {
    return {
      label: 'Stalling',
      color: 'text-red-600 dark:text-red-400',
      description: 'Roast may be stalling'
    };
  }
};

/**
 * Advanced metrics display for Hottop roaster
 * Shows RoR, temperature delta, and environmental conditions
 */
export const AdvancedMetrics = ({
  data,
  className
}: AdvancedMetricsProps) => {
  const rorStatus = getRoRStatus(data.rateOfRise);
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Advanced Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rate of Rise */}
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Rate of Rise (RoR)</span>
            </div>
            <span className={cn("text-xs font-semibold", rorStatus.color)}>
              {rorStatus.label}
            </span>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground font-mono">
              {data.rateOfRise !== undefined ? data.rateOfRise.toFixed(1) : '--'}
            </span>
            <span className="text-sm text-muted-foreground">°C/min</span>
          </div>
          
          {data.rateOfRise !== undefined && (
            <p className="text-xs text-muted-foreground mt-2">
              {rorStatus.description}
            </p>
          )}
        </div>

        {/* Temperature Delta */}
        {data.tempDelta !== undefined && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Bean Temp Delta</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={cn(
                "text-lg font-bold font-mono",
                data.tempDelta > 0 ? "text-orange-600 dark:text-orange-400" : "text-cyan-600 dark:text-cyan-400"
              )}>
                {data.tempDelta > 0 ? '+' : ''}{data.tempDelta.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">°C</span>
            </div>
          </div>
        )}

        {/* Current Bean Temperature */}
        {data.beanTemp !== undefined && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Bean Temperature</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold font-mono text-orange-600 dark:text-orange-400">
                {data.beanTemp.toFixed(0)}
              </span>
              <span className="text-xs text-muted-foreground">°C</span>
            </div>
          </div>
        )}

        {/* Environmental Temperature */}
        {data.environmentalTemp !== undefined && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-cyan-500" />
              <span className="text-sm font-medium">Environmental Temp</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold font-mono text-cyan-600 dark:text-cyan-400">
                {data.environmentalTemp.toFixed(0)}
              </span>
              <span className="text-xs text-muted-foreground">°C</span>
            </div>
          </div>
        )}

        {/* RoR Guidelines */}
        <div className="p-3 rounded-lg bg-muted space-y-2">
          <p className="text-xs font-semibold text-foreground">RoR Guidelines:</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Early roast:</span>
              <span className="font-medium">8-12°C/min</span>
            </div>
            <div className="flex justify-between">
              <span>Mid roast:</span>
              <span className="font-medium">5-8°C/min</span>
            </div>
            <div className="flex justify-between">
              <span>Approaching 1C:</span>
              <span className="font-medium">3-5°C/min</span>
            </div>
            <div className="flex justify-between">
              <span>Development:</span>
              <span className="font-medium">2-4°C/min</span>
            </div>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-900 dark:text-blue-300">
            💡 <strong>Pro Tip:</strong> RoR should gradually decrease approaching
            first crack. A declining RoR indicates proper roast development.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
