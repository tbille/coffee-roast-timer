import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { type RoasterType } from "@/types/roaster.types";
import { ROASTER_SPECS } from "@/utils/roasterRegistry";

interface QuickStatsCardProps {
  beansName: string;
  origin?: string;
  farmName?: string;
  roastProcess?: string;
  coffeeRoaster?: string;
  roasterType?: RoasterType;
  durationSeconds: number;
  initialWeight?: number;
  finalWeight?: number;
  developmentPercent: number;
  className?: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getRoasterDisplayName(roasterType: RoasterType): string {
  const spec = ROASTER_SPECS[roasterType];
  return spec?.name || roasterType;
}

export function QuickStatsCard({
  beansName,
  origin,
  farmName,
  roastProcess,
  coffeeRoaster,
  roasterType,
  durationSeconds,
  initialWeight,
  finalWeight,
  developmentPercent,
  className,
}: QuickStatsCardProps) {
  const calculateWeightLoss = () => {
    if (initialWeight && finalWeight && initialWeight > 0) {
      return ((initialWeight - finalWeight) / initialWeight * 100).toFixed(1);
    }
    return null;
  };

  const weightLoss = calculateWeightLoss();

  // Determine if development is in ideal range (20-25%)
  const isIdealDevelopment = developmentPercent >= 20 && developmentPercent <= 25;
  const developmentStatus = developmentPercent < 20 
    ? "underdeveloped" 
    : developmentPercent > 25 
    ? "overdeveloped" 
    : "ideal";

  return (
    <Card className={cn("shadow-coffee", className)}>
      <CardHeader>
        <CardTitle as="h2">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Bean Name</Label>
          <p className="text-sm font-medium">{beansName}</p>
        </div>

        {origin && (
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Origin</Label>
            <p className="text-sm">{origin}</p>
          </div>
        )}

        {farmName && (
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Farm</Label>
            <p className="text-sm">{farmName}</p>
          </div>
        )}

        {roastProcess && (
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Process</Label>
            <p className="text-sm">{roastProcess}</p>
          </div>
        )}

        <div>
          <Label className="text-xs font-medium text-muted-foreground">Roaster</Label>
          <p className="text-sm font-semibold text-primary">
            {roasterType ? getRoasterDisplayName(roasterType) : (coffeeRoaster || "Not specified")}
          </p>
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground">Duration</Label>
          <p className="text-sm font-mono">{formatTime(durationSeconds)}</p>
        </div>

        {initialWeight && finalWeight && (
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Weight</Label>
            <p className="text-sm">
              {initialWeight}g → {finalWeight}g
              {weightLoss && (
                <span className="text-muted-foreground ml-2">(-{weightLoss}%)</span>
              )}
            </p>
          </div>
        )}

        <div className="pt-2 border-t">
          <Label className="text-xs font-medium text-muted-foreground">Development</Label>
          <div className="flex items-baseline gap-2 mt-1">
            <p className={cn(
              "text-2xl font-bold",
              isIdealDevelopment ? "text-green-600 dark:text-green-500" : "text-primary"
            )}>
              {developmentPercent.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              (Ideal: 20-25%)
            </p>
          </div>
          {!isIdealDevelopment && (
            <p className="text-xs text-muted-foreground mt-1 italic">
              {developmentStatus === "underdeveloped" 
                ? "May benefit from longer development time" 
                : "Extended development - may taste more developed"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
