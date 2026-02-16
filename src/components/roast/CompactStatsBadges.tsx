import { Badge } from "@/components/ui/badge";
import { Clock, Flame, Weight, Bean } from "lucide-react";
import { cn } from "@/lib/utils";
import { type RoasterType } from "@/types/roaster.types";
import { ROASTER_SPECS } from "@/utils/roasterRegistry";

interface CompactStatsBadgesProps {
  origin?: string;
  farmName?: string;
  roastProcess?: string;
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

export function CompactStatsBadges({
  origin,
  farmName,
  roastProcess,
  roasterType,
  durationSeconds,
  initialWeight,
  finalWeight,
  developmentPercent,
  className,
}: CompactStatsBadgesProps) {
  const calculateWeightLoss = () => {
    if (initialWeight && finalWeight && initialWeight > 0) {
      return ((initialWeight - finalWeight) / initialWeight * 100).toFixed(1);
    }
    return null;
  };

  const weightLoss = calculateWeightLoss();

  // Determine if development is in ideal range (20-25%)
  const isIdealDevelopment = developmentPercent >= 20 && developmentPercent <= 25;
  const isUnderdeveloped = developmentPercent < 20;
  const isOverdeveloped = developmentPercent > 25;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Duration */}
      <Badge variant="secondary" className="flex items-center gap-1.5 text-sm px-3 py-1">
        <Clock className="h-3.5 w-3.5" />
        <span className="font-mono">{formatTime(durationSeconds)}</span>
      </Badge>

      {/* Development Percentage */}
      <Badge 
        variant={isIdealDevelopment ? "default" : "secondary"}
        className={cn(
          "flex items-center gap-1.5 text-sm px-3 py-1 font-semibold",
          isIdealDevelopment && "bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700",
          isUnderdeveloped && "bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700",
          isOverdeveloped && "bg-orange-500 hover:bg-orange-600 text-white dark:bg-orange-600 dark:hover:bg-orange-700"
        )}
      >
        <Flame className="h-3.5 w-3.5" />
        {developmentPercent.toFixed(1)}% dev
      </Badge>

      {/* Weight Loss */}
      {initialWeight && finalWeight && weightLoss && (
        <Badge variant="outline" className="flex items-center gap-1.5 text-xs px-2.5 py-1">
          <Weight className="h-3 w-3" />
          {initialWeight}g → {finalWeight}g (-{weightLoss}%)
        </Badge>
      )}

      {/* Origin */}
      {origin && (
        <Badge variant="outline" className="flex items-center gap-1.5 text-xs px-2.5 py-1">
          <Bean className="h-3 w-3" />
          {origin}
        </Badge>
      )}

      {/* Farm */}
      {farmName && (
        <Badge variant="outline" className="text-xs px-2.5 py-1">
          {farmName}
        </Badge>
      )}

      {/* Process */}
      {roastProcess && (
        <Badge variant="outline" className="text-xs px-2.5 py-1">
          {roastProcess}
        </Badge>
      )}
    </div>
  );
}
