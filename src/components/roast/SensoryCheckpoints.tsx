import { forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Ear, Wind as Nose, AlertCircle } from "lucide-react";
import { type RoastMilestone } from "@/types/roast.types";
import { cn } from "@/lib/utils";

interface SensoryCheckpointsProps {
  milestones?: RoastMilestone[];
  className?: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const MILESTONE_LABELS = {
  yellowing: "Yellowing",
  first_crack: "First Crack",
  development_start: "Development",
  second_crack: "Second Crack",
  drop: "End Roast",
  custom: "Checkpoint",
} as const;

export const SensoryCheckpoints = forwardRef<HTMLDivElement, SensoryCheckpointsProps>(
  ({ milestones = [], className }, ref) => {
    // Filter out milestones that have sensory cues or actions
    const checkpointsWithCues = milestones.filter(
      m => m.visual_cue || m.audio_cue || m.aroma_cue || m.action_required
    );

    if (checkpointsWithCues.length === 0) {
      return null;
    }

    return (
      <Card className={className} ref={ref} id="sensory-checkpoints">
        <CardHeader>
          <CardTitle>👂 Sensory Checkpoints - What You Should Notice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {checkpointsWithCues.map((milestone, idx) => (
            <div 
              key={idx} 
              className="border-l-4 border-primary/30 pl-4 space-y-2 transition-colors duration-500"
              id={`checkpoint-${idx}`}
            >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="font-mono">
                {formatTime(milestone.time_seconds)}
              </Badge>
              <h4 className="font-semibold">
                {milestone.label || MILESTONE_LABELS[milestone.event_type] || 'Checkpoint'}
              </h4>
            </div>

            {/* Visual Cue */}
            {milestone.visual_cue && (
              <div className="flex gap-2 text-sm">
                <Eye className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Look: </span>
                  <span className="text-muted-foreground">{milestone.visual_cue}</span>
                </div>
              </div>
            )}

            {/* Audio Cue */}
            {milestone.audio_cue && (
              <div className="flex gap-2 text-sm">
                <Ear className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Sound: </span>
                  <span className="text-muted-foreground">{milestone.audio_cue}</span>
                </div>
              </div>
            )}

            {/* Aroma Cue */}
            {milestone.aroma_cue && (
              <div className="flex gap-2 text-sm">
                <Nose className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Smell: </span>
                  <span className="text-muted-foreground">{milestone.aroma_cue}</span>
                </div>
              </div>
            )}

            {/* Action Required */}
            {milestone.action_required && (
              <div className="flex gap-2 text-sm mt-2 p-2 bg-primary/5 rounded border border-primary/20">
                <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-primary">ACTION: </span>
                  <span className="font-medium">{milestone.action_required}</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Helpful tip */}
        <div className="text-xs text-muted-foreground border-t pt-4 mt-4">
          💡 <span className="font-medium">Tip:</span> These sensory cues help you stay on track even without looking at the timer. 
          Trust your senses and adjust as needed based on what you observe.
        </div>
      </CardContent>
    </Card>
  );
});

SensoryCheckpoints.displayName = "SensoryCheckpoints";
