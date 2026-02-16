import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Flame, Wind } from "lucide-react";

export interface ManualControl {
  time: number;
  heatPercent: number;
  fanPercent: number;
  timestamp: number;
}

interface ManualControlSlidersProps {
  heatPercent: number;
  fanPercent: number;
  onHeatChange: (value: number) => void;
  onFanChange: (value: number) => void;
  onRecordChange: () => void;
  disabled?: boolean;
  hasUnsavedChanges: boolean;
}

/**
 * Manual control sliders for Hottop roaster
 * Provides 0-100% control over heat and fan speed
 */
export const ManualControlSliders = ({
  heatPercent,
  fanPercent,
  onHeatChange,
  onFanChange,
  onRecordChange,
  disabled = false,
  hasUnsavedChanges
}: ManualControlSlidersProps) => {
  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="text-center mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-1">
            MANUAL CONTROLS
          </h3>
          <p className="text-xs text-muted-foreground">
            Adjust heat and fan speed for precise control
          </p>
        </div>

        {/* Heat Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Heat Power
            </Label>
            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400 font-mono">
              {heatPercent}%
            </span>
          </div>
          
          <Slider
            value={[heatPercent]}
            onValueChange={(values) => onHeatChange(values[0])}
            min={0}
            max={100}
            step={5}
            disabled={disabled}
            className="cursor-pointer"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Off (0%)</span>
            <span>Low (25%)</span>
            <span>Med (50%)</span>
            <span>High (75%)</span>
            <span>Max (100%)</span>
          </div>
        </div>

        {/* Fan Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Wind className="h-4 w-4 text-cyan-500" />
              Fan Speed
            </Label>
            <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 font-mono">
              {fanPercent}%
            </span>
          </div>
          
          <Slider
            value={[fanPercent]}
            onValueChange={(values) => onFanChange(values[0])}
            min={0}
            max={100}
            step={5}
            disabled={disabled}
            className="cursor-pointer"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Off (0%)</span>
            <span>Low (25%)</span>
            <span>Med (50%)</span>
            <span>High (75%)</span>
            <span>Max (100%)</span>
          </div>
        </div>

        {/* Record Button */}
        <Button
          onClick={onRecordChange}
          disabled={!hasUnsavedChanges || disabled}
          variant={hasUnsavedChanges ? "default" : "secondary"}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          📝 Record Setting Change
        </Button>

        {/* Quick Preset Buttons */}
        <div className="space-y-2 pt-2 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground">Quick Presets:</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onHeatChange(50);
                onFanChange(50);
              }}
              disabled={disabled}
              className="text-xs"
            >
              🎯 Medium (50/50)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onHeatChange(75);
                onFanChange(60);
              }}
              disabled={disabled}
              className="text-xs"
            >
              🔥 High Heat (75/60)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onHeatChange(40);
                onFanChange(70);
              }}
              disabled={disabled}
              className="text-xs"
            >
              💨 High Fan (40/70)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onHeatChange(30);
                onFanChange(40);
              }}
              disabled={disabled}
              className="text-xs"
            >
              🐢 Slow Roast (30/40)
            </Button>
          </div>
        </div>

        {/* Help Text */}
        <div className="p-3 rounded-lg bg-muted text-xs text-muted-foreground">
          💡 <strong>Tip:</strong> Higher heat speeds up roast, higher fan cools beans.
          Record changes before adjusting to track your profile.
        </div>
      </CardContent>
    </Card>
  );
};
