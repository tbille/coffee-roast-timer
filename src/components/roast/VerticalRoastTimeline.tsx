import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Droplet, Flame, Zap, AlertCircle, Eye, Ear, Wind as Nose, ArrowDown, Thermometer, ArrowUp, ArrowDown as TempDown } from "lucide-react";
import { type RoastMilestone, type RoasterSettings } from "@/types/roast.types";
import { cn } from "@/lib/utils";

interface VerticalRoastTimelineProps {
  duration_seconds: number;
  milestones?: RoastMilestone[];
  roaster_settings?: RoasterSettings;
  className?: string;
}

const MILESTONE_ICONS = {
  yellowing: Droplet,
  first_crack: Zap,
  development_start: Flame,
  second_crack: Zap,
  drop: AlertCircle,
  custom: Clock,
  temperature_up: ArrowUp,
  temperature_down: TempDown,
  temperature_adjust: Thermometer,
  control_adjust: Flame,
} as const;

const MILESTONE_COLORS = {
  yellowing: "bg-yellow-500",
  first_crack: "bg-orange-500",
  development_start: "bg-amber-600",
  second_crack: "bg-red-500",
  drop: "bg-green-600",
  custom: "bg-blue-500",
  temperature_up: "bg-red-600",
  temperature_down: "bg-blue-600",
  temperature_adjust: "bg-purple-600",
  control_adjust: "bg-indigo-600",
} as const;

const MILESTONE_LABELS = {
  yellowing: "Yellowing",
  first_crack: "First Crack",
  development_start: "Development",
  second_crack: "Second Crack",
  drop: "Drop",
  custom: "Event",
} as const;

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function VerticalRoastTimeline({ 
  duration_seconds, 
  milestones = [], 
  roaster_settings,
  className 
}: VerticalRoastTimelineProps) {
  // Build complete milestone list with start and end (if not already present)
  const hasStartMilestone = milestones.some(m => m.time_seconds === 0);
  const hasEndMilestone = milestones.some(m => m.time_seconds === duration_seconds || m.event_type === 'drop');
  
  // Convert temperature schedule to milestones if present
  const temperatureMilestones = roaster_settings?.temperature_schedule?.map((temp, index, array) => {
    // Determine if temperature is going up or down
    let tempChangeType: keyof typeof MILESTONE_ICONS = 'temperature_adjust';
    if (index > 0) {
      const prevTemp = array[index - 1].target_temp_c;
      tempChangeType = temp.target_temp_c > prevTemp ? 'temperature_up' : 'temperature_down';
    }
    
    return {
      time_seconds: temp.time_seconds,
      event_type: tempChangeType,
      label: `${temp.target_temp_c}°C`,
      temperature_value: temp.target_temp_c,
      action_required: `Set roaster temperature to ${temp.target_temp_c}°C${temp.note ? ` - ${temp.note}` : ''}`,
      isTemperatureAdjustment: true,
    };
  }) || [];
  
  // Convert control schedule to milestones if present (for FreshRoast, KALDI, etc.)
  const controlMilestones = roaster_settings?.control_schedule?.map((control) => {
    const changes: string[] = [];
    if (control.heat_level !== undefined) {
      changes.push(`Heat: ${control.heat_level}`);
    }
    if (control.fan_level !== undefined) {
      changes.push(`Fan: ${control.fan_level}`);
    }
    if (control.drum_speed_rpm !== undefined) {
      changes.push(`Drum: ${control.drum_speed_rpm} RPM`);
    }
    
    return {
      time_seconds: control.time_seconds,
      event_type: 'control_adjust' as keyof typeof MILESTONE_ICONS,
      label: changes.join(' • '),
      control_settings: changes,
      action_required: `Set ${changes.join(', ')}${control.note ? ` - ${control.note}` : ''}`,
      isControlAdjustment: true,
    };
  }) || [];
  
  const allMilestones = [
    ...(hasStartMilestone ? [] : [{ time_seconds: 0, event_type: 'custom' as const, label: 'Start' }]),
    ...milestones,
    ...temperatureMilestones,
    ...controlMilestones,
    ...(hasEndMilestone ? [] : [{ time_seconds: duration_seconds, event_type: 'drop' as const, label: 'Drop' }]),
  ];

  // Sort by time and remove duplicates at the same time
  const sortedMilestones = allMilestones
    .sort((a, b) => a.time_seconds - b.time_seconds)
    .filter((milestone, index, array) => {
      // Keep if it's the first occurrence at this time
      return index === 0 || milestone.time_seconds !== array[index - 1].time_seconds;
    });

  return (
    <Card className={cn("shadow-coffee", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Step-by-Step Roast Guide
          </CardTitle>
          <Badge variant="secondary" className="font-mono">
            {formatTime(duration_seconds)} total
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Follow these milestones in order during your roast
        </p>
      </CardHeader>
      <CardContent>
        {/* Vertical Timeline */}
        <div className="relative">
          {sortedMilestones.map((milestone, index) => {
            const Icon = MILESTONE_ICONS[milestone.event_type] || Clock;
            const color = MILESTONE_COLORS[milestone.event_type] || "bg-gray-500";
            const isLast = index === sortedMilestones.length - 1;
            const nextMilestone = !isLast ? sortedMilestones[index + 1] : null;
            const timeDelta = nextMilestone 
              ? nextMilestone.time_seconds - milestone.time_seconds 
              : 0;

            // Check if milestone has any content (sensory cues or action)
            const hasSensoryCues = milestone.visual_cue || milestone.audio_cue || milestone.aroma_cue;
            const hasAction = milestone.action_required;
            const hasContent = hasSensoryCues || hasAction;

            return (
              <div key={index} className="relative flex gap-4 pb-8">
                {/* Left: Vertical Line + Dot */}
                <div className="relative flex flex-col items-center" style={{ width: '40px' }}>
                  {/* Milestone Dot */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md z-10 flex-shrink-0",
                      color
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Vertical Line + Time Delta */}
                  {!isLast && (
                    <div className="flex-1 flex flex-col items-center pt-2">
                      {/* Line */}
                      <div className="w-0.5 bg-border flex-1 min-h-[40px]" />
                      
                      {/* Time Delta Badge */}
                      {timeDelta > 0 && (
                        <div className="py-2">
                          <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md">
                            <ArrowDown className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-mono text-muted-foreground">
                              {formatTime(timeDelta)}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Continue line after badge */}
                      <div className="w-0.5 bg-border flex-1 min-h-[40px]" />
                    </div>
                  )}
                </div>

                {/* Right: Milestone Content */}
                <div className="flex-1 pt-1 pb-4">
                  {/* Time + Label */}
                  <div className="mb-2">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <Badge variant="outline" className="font-mono text-base px-2.5 py-0.5">
                        {formatTime(milestone.time_seconds)}
                      </Badge>
                      
                      {/* Temperature adjustments get special display */}
                      {(milestone as any).isTemperatureAdjustment ? (
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold">Set Temperature</h3>
                          <Badge className="text-xl font-bold px-3 py-1 bg-red-600 hover:bg-red-700 text-white">
                            {milestone.label}
                          </Badge>
                        </div>
                      ) : (milestone as any).isControlAdjustment ? (
                        <div className="flex flex-col gap-1">
                          <h3 className="text-lg font-semibold">Adjust Controls</h3>
                          <div className="flex gap-2 flex-wrap">
                            {(milestone as any).control_settings?.map((setting: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-sm font-semibold px-2.5 py-1">
                                {setting}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <h3 className="text-lg font-semibold">
                          {milestone.label || MILESTONE_LABELS[milestone.event_type] || 'Event'}
                        </h3>
                      )}
                    </div>
                  </div>

                  {/* Sensory Cues - Inline with Icons (Compact) */}
                  {hasSensoryCues && (
                    <div className="space-y-1.5 text-sm mb-3">
                      {milestone.visual_cue && (
                        <div className="flex items-start gap-2">
                          <Eye className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">
                            <span className="font-medium text-foreground">Look:</span> {milestone.visual_cue}
                          </span>
                        </div>
                      )}
                      {milestone.audio_cue && (
                        <div className="flex items-start gap-2">
                          <Ear className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">
                            <span className="font-medium text-foreground">Sound:</span> {milestone.audio_cue}
                          </span>
                        </div>
                      )}
                      {milestone.aroma_cue && (
                        <div className="flex items-start gap-2">
                          <Nose className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">
                            <span className="font-medium text-foreground">Smell:</span> {milestone.aroma_cue}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Alert - Banner Style */}
                  {hasAction && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-md">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-900 dark:text-amber-400">ACTION:</span>
                        <span className="text-amber-900 dark:text-amber-300 ml-1">{milestone.action_required}</span>
                      </div>
                    </div>
                  )}

                  {/* Empty state - minimal display for milestones without details */}
                  {!hasContent && index !== 0 && !isLast && (
                    <p className="text-sm text-muted-foreground italic">
                      Continue roasting...
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Tip */}
        <div className="text-xs text-muted-foreground border-t pt-4 mt-2">
          💡 <span className="font-medium">Tip:</span> Use your senses to stay on track. The times are guidelines—adjust based on what you observe.
        </div>
      </CardContent>
    </Card>
  );
}
