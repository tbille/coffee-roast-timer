import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VisualCue {
  time: number;
  color: string;
  notes?: string;
  timestamp: number;
}

interface VisualCueTrackerProps {
  elapsedTime: number;
  onAddCue: (cue: VisualCue) => void;
  cues: VisualCue[];
  disabled?: boolean;
}

const COLOR_OPTIONS = [
  { value: 'green', label: 'Green', color: 'bg-green-600', border: 'border-green-600' },
  { value: 'yellow-green', label: 'Yellow-Green', color: 'bg-lime-500', border: 'border-lime-500' },
  { value: 'yellow', label: 'Yellow', color: 'bg-yellow-500', border: 'border-yellow-500' },
  { value: 'light-brown', label: 'Light Brown', color: 'bg-amber-600', border: 'border-amber-600' },
  { value: 'medium-brown', label: 'Medium Brown', color: 'bg-orange-700', border: 'border-orange-700' },
  { value: 'dark-brown', label: 'Dark Brown', color: 'bg-amber-900', border: 'border-amber-900' },
  { value: 'very-dark', label: 'Very Dark', color: 'bg-neutral-800', border: 'border-neutral-800' },
];

/**
 * Visual cue tracker for popcorn poppers
 * Allows users without thermometers to track roast progression by color
 */
export const VisualCueTracker = ({
  elapsedTime,
  onAddCue,
  cues,
  disabled = false
}: VisualCueTrackerProps) => {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleAddCue = () => {
    if (!selectedColor) return;

    const cue: VisualCue = {
      time: elapsedTime,
      color: selectedColor,
      notes: notes.trim() || undefined,
      timestamp: Date.now()
    };

    onAddCue(cue);
    
    // Reset form
    setSelectedColor('');
    setNotes('');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getColorLabel = (colorValue: string): string => {
    return COLOR_OPTIONS.find(c => c.value === colorValue)?.label || colorValue;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Visual Cues (Color Progression)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Color Selector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Current Bean Color</Label>
          <div className="grid grid-cols-2 gap-2">
            {COLOR_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={selectedColor === option.value ? "default" : "outline"}
                onClick={() => setSelectedColor(option.value)}
                disabled={disabled}
                className={cn(
                  "h-12 font-medium transition-all",
                  selectedColor === option.value && [
                    option.color,
                    "text-white",
                    "hover:opacity-90"
                  ]
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded-full mr-2 border-2",
                  option.color,
                  "border-white shadow-xs"
                )} />
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="visual-notes" className="text-sm font-medium">
            Observations (Optional)
          </Label>
          <Textarea
            id="visual-notes"
            placeholder="e.g., Beans starting to expand, chaff appearing..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={disabled}
            className="min-h-16 resize-none text-sm"
          />
        </div>

        {/* Record Button */}
        <Button
          onClick={handleAddCue}
          disabled={!selectedColor || disabled}
          className="w-full"
          size="lg"
        >
          <Camera className="h-4 w-4 mr-2" />
          Record Color Change
        </Button>

        {/* Color History */}
        {cues.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <h4 className="text-xs font-semibold text-muted-foreground">
              Color Progression History
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cues.slice().reverse().map((cue, index) => {
                const colorOption = COLOR_OPTIONS.find(c => c.value === cue.color);
                return (
                  <div
                    key={cue.timestamp}
                    className="flex items-start gap-3 p-2 rounded-lg bg-muted/50 text-sm"
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 border-border shrink-0 mt-0.5",
                      colorOption?.color
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-foreground">
                          {getColorLabel(cue.color)}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {formatTime(cue.time)}
                        </span>
                      </div>
                      {cue.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {cue.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Helper Text */}
        {cues.length === 0 && (
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-xs text-muted-foreground">
              💡 No thermometer? Track roast progress by bean color. Record changes as
              beans progress from green to your desired roast level.
            </p>
          </div>
        )}

        {/* Color Guide */}
        <div className="p-3 rounded-lg bg-muted space-y-2">
          <p className="text-xs font-semibold text-foreground">Quick Reference:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <div>🟢 Green: Raw beans</div>
            <div>🟡 Yellow: Drying phase</div>
            <div>🟤 Light Brown: Light roast</div>
            <div>🟫 Medium Brown: Medium roast</div>
            <div>⚫ Dark Brown: Dark roast</div>
            <div>⬛ Very Dark: French/Italian</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
