import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Flame, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface BatchSizeWarningProps {
  batchSize: number;
  onBatchSizeChange: (size: number) => void;
  maxSize: number;
  disabled?: boolean;
}

/**
 * Prominent batch size warning component for popcorn poppers
 * Emphasizes fire risk with clear visual hierarchy
 */
export const BatchSizeWarning = ({
  batchSize,
  onBatchSizeChange,
  maxSize = 100,
  disabled = false
}: BatchSizeWarningProps) => {
  const percentage = (batchSize / maxSize) * 100;
  const isWarningLevel = batchSize > 80; // 80% capacity
  const isDangerLevel = batchSize > 95; // 95% capacity
  const isCritical = batchSize > maxSize; // Over maximum

  const getStatusColor = () => {
    if (isCritical) return "text-red-600 dark:text-red-400";
    if (isDangerLevel) return "text-orange-600 dark:text-orange-400";
    if (isWarningLevel) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const getStatusIcon = () => {
    if (isCritical) return <Flame className="h-5 w-5 text-red-600 animate-pulse" />;
    if (isDangerLevel) return <AlertTriangle className="h-5 w-5 text-orange-600" />;
    if (isWarningLevel) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <Shield className="h-5 w-5 text-green-600" />;
  };

  const getStatusText = () => {
    if (isCritical) return "CRITICAL - FIRE RISK!";
    if (isDangerLevel) return "DANGER - Too High!";
    if (isWarningLevel) return "Warning - Near Maximum";
    return "Safe Range";
  };

  const getProgressColor = () => {
    if (isCritical) return "bg-red-600";
    if (isDangerLevel) return "bg-orange-600";
    if (isWarningLevel) return "bg-yellow-600";
    return "bg-green-600";
  };

  return (
    <Card className={cn(
      "border-2",
      isCritical && "border-red-500 bg-red-50 dark:bg-red-950/20",
      isDangerLevel && !isCritical && "border-orange-500 bg-orange-50 dark:bg-orange-950/20",
      isWarningLevel && !isDangerLevel && "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
    )}>
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            BATCH SIZE - CRITICAL!
          </h3>
          {getStatusIcon()}
        </div>

        {/* Input */}
        <div className="space-y-2">
          <Label htmlFor="batch-size" className="text-sm font-medium">
            Initial Weight (grams) *
          </Label>
          <Input
            id="batch-size"
            type="number"
            placeholder="e.g., 75"
            value={batchSize || ''}
            onChange={(e) => onBatchSizeChange(parseInt(e.target.value) || 0)}
            disabled={disabled}
            className={cn(
              "text-lg h-14 text-center font-mono font-bold",
              isCritical && "border-red-500 text-red-600 dark:text-red-400",
              isDangerLevel && !isCritical && "border-orange-500"
            )}
            min="0"
            max={maxSize}
            step="5"
          />
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-muted-foreground">
              {batchSize}g / {maxSize}g max
            </span>
            <span className={cn("text-xs font-bold", getStatusColor())}>
              {percentage.toFixed(0)}%
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={Math.min(percentage, 100)} 
              className="h-3"
            />
            <div 
              className={cn(
                "absolute inset-0 h-3 rounded-full transition-all",
                getProgressColor()
              )}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Safe</span>
            <span>Warning (80g)</span>
            <span>Max (100g)</span>
          </div>
        </div>

        {/* Status Message */}
        <div className={cn(
          "p-3 rounded-lg border-2 flex items-center gap-2",
          isCritical && "border-red-500 bg-red-100 dark:bg-red-950/40",
          isDangerLevel && !isCritical && "border-orange-500 bg-orange-100 dark:bg-orange-950/40",
          isWarningLevel && !isDangerLevel && "border-yellow-500 bg-yellow-100 dark:bg-yellow-950/40",
          !isWarningLevel && "border-green-500 bg-green-100 dark:bg-green-950/40"
        )}>
          {getStatusIcon()}
          <span className={cn("text-sm font-bold", getStatusColor())}>
            {getStatusText()}
          </span>
        </div>

        {/* Critical Warning */}
        {isCritical && (
          <Alert variant="destructive" className="border-2 border-red-600">
            <Flame className="h-4 w-4 animate-pulse" />
            <AlertTitle className="font-bold">FIRE HAZARD!</AlertTitle>
            <AlertDescription className="text-xs">
              Your batch size exceeds the safe maximum. This creates a serious fire risk!
              Reduce to {maxSize}g or less immediately.
            </AlertDescription>
          </Alert>
        )}

        {/* Warning Alert */}
        {isDangerLevel && !isCritical && (
          <Alert variant="default" className="border-2 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="font-bold text-orange-600">Too Close to Maximum</AlertTitle>
            <AlertDescription className="text-xs text-orange-600 dark:text-orange-400">
              You're very close to the {maxSize}g limit. Consider reducing batch size for safety.
            </AlertDescription>
          </Alert>
        )}

        {/* General Warning */}
        <div className="p-3 rounded-lg bg-muted border border-border">
          <p className="text-xs font-semibold text-destructive mb-1">
            ⚠️ DO NOT EXCEED {maxSize}g - SERIOUS FIRE RISK!
          </p>
          <p className="text-xs text-muted-foreground">
            Popcorn poppers are not designed for coffee roasting. Overloading can cause
            overheating, smoke, and fire. Always roast outdoors or with excellent ventilation.
          </p>
        </div>

        {/* Safety Recommendations */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-foreground">Recommended Batch Sizes:</p>
          <ul className="text-xs text-muted-foreground space-y-1 ml-4">
            <li>• First-time users: <strong>50-60g</strong></li>
            <li>• Experienced users: <strong>75-85g</strong></li>
            <li>• Maximum safe: <strong>100g</strong></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
