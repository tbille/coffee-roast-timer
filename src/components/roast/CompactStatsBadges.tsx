import { Badge } from "@/components/ui/badge";
import { Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompactStatsBadgesProps {
  durationSeconds: number;
  developmentPercent: number;
  className?: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function CompactStatsBadges({
  durationSeconds,
  developmentPercent,
  className,
}: CompactStatsBadgesProps) {
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
    </div>
  );
}
