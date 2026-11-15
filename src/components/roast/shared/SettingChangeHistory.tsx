import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { SettingChange } from "@/types/roast-data.types";

interface SettingChangeHistoryProps {
  changes: SettingChange[];
  maxDisplay?: number;
}

export const SettingChangeHistory = ({ 
  changes, 
  maxDisplay = 10 
}: SettingChangeHistoryProps) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Show most recent changes first
  const displayChanges = [...changes]
    .sort((a, b) => b.time - a.time)
    .slice(0, maxDisplay);

  if (changes.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Setting Change History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No changes recorded yet. Adjust heat or fan to start tracking.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Setting Change History
          <span className="text-xs font-normal text-muted-foreground">
            ({changes.length} {changes.length === 1 ? 'change' : 'changes'})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {displayChanges.map((change, index) => (
            <div
              key={`${change.time}-${index}`}
              className="flex items-center gap-3 p-2 rounded-md bg-accent/50 text-sm"
            >
              <span className="font-mono font-semibold text-primary min-w-12">
                {formatTime(change.time)}
              </span>
              <span className="text-muted-foreground">→</span>
              <div className="flex gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <span className="text-muted-foreground text-xs">Heat:</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">
                    {change.heatLevel}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="text-muted-foreground text-xs">Fan:</span>
                  <span className="font-medium text-cyan-600 dark:text-cyan-400">
                    {change.fanSpeed}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {changes.length > maxDisplay && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            Showing {maxDisplay} of {changes.length} changes
          </p>
        )}
      </CardContent>
    </Card>
  );
};
