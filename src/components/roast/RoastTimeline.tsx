import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Droplet, Flame, Zap, AlertCircle } from "lucide-react";
import { type RoastMilestone } from "@/types/roast.types";
import { cn } from "@/lib/utils";

interface RoastTimelineProps {
  duration_seconds: number;
  milestones?: RoastMilestone[];
  className?: string;
  onMilestoneClick?: (milestoneIndex: number) => void;
}

const MILESTONE_ICONS = {
  yellowing: Droplet,
  first_crack: Zap,
  development_start: Flame,
  second_crack: Zap,
  drop: AlertCircle,
  custom: Clock,
} as const;

const MILESTONE_COLORS = {
  yellowing: "bg-yellow-500",
  first_crack: "bg-orange-500",
  development_start: "bg-amber-600",
  second_crack: "bg-red-500",
  drop: "bg-green-600",
  custom: "bg-blue-500",
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

// Detect if milestones are too close together (within 10% of total duration)
function areMilestonesTooClose(milestones: any[], duration: number): boolean {
  if (milestones.length <= 2) return false;
  
  const threshold = duration * 0.1; // 10% of total duration
  for (let i = 1; i < milestones.length; i++) {
    const timeDiff = milestones[i].time_seconds - milestones[i - 1].time_seconds;
    if (timeDiff < threshold) {
      return true;
    }
  }
  return false;
}

export function RoastTimeline({ duration_seconds, milestones = [], className, onMilestoneClick }: RoastTimelineProps) {
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(null);
  const [hoveredMilestone, setHoveredMilestone] = useState<number | null>(null);

  // Build complete milestone list with start and end (if not already present)
  const hasStartMilestone = milestones.some(m => m.time_seconds === 0);
  const hasEndMilestone = milestones.some(m => m.time_seconds === duration_seconds || m.event_type === 'drop');
  
  const allMilestones = [
    ...(hasStartMilestone ? [] : [{ time_seconds: 0, event_type: 'custom' as const, label: 'Start' }]),
    ...milestones,
    ...(hasEndMilestone ? [] : [{ time_seconds: duration_seconds, event_type: 'drop' as const, label: 'Drop' }]),
  ];

  // Sort by time and remove duplicates at the same time
  const sortedMilestones = allMilestones
    .sort((a, b) => a.time_seconds - b.time_seconds)
    .filter((milestone, index, array) => {
      // Keep if it's the first occurrence at this time
      return index === 0 || milestone.time_seconds !== array[index - 1].time_seconds;
    });
  
  // Detect if we need compact mode (milestones too close)
  const useCompactMode = areMilestonesTooClose(sortedMilestones, duration_seconds);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Roast Timeline
          </CardTitle>
          <Badge variant="secondary">{formatTime(duration_seconds)} total</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Visual Timeline Bar */}
        <div className="relative" style={{ height: useCompactMode ? '100px' : '80px' }}>
          {/* Background line - positioned vertically centered */}
          <div className="absolute left-0 right-0 h-1 bg-muted rounded-full" style={{ top: useCompactMode ? '50px' : '40px' }} />
          
          {/* Milestone dots */}
          {sortedMilestones.map((milestone, index) => {
            const Icon = MILESTONE_ICONS[milestone.event_type] || Clock;
            const color = MILESTONE_COLORS[milestone.event_type] || "bg-gray-500";
            const position = (milestone.time_seconds / duration_seconds) * 100;
            
            // Smart positioning: alternate above/below for compact mode
            const isAbove = useCompactMode && index % 2 === 1;
            
            // Show full label on hover or when expanded
            const showFullLabel = hoveredMilestone === index || expandedMilestone === index;
            
            // Line is at 50px (compact) or 40px (normal) from top
            // Dot is 8px radius (32px / 4 for center)
            const lineTop = useCompactMode ? 50 : 40;
            const dotSize = 32; // 8 * 4 (w-8 h-8)
            const dotCenterOffset = dotSize / 2; // 16px
            
            return (
              <div
                key={index}
                className="absolute cursor-pointer group"
                style={{ 
                  left: `${position}%`,
                  transform: 'translateX(-50%)',
                  height: '100%',
                }}
                onClick={() => {
                  setExpandedMilestone(expandedMilestone === index ? null : index);
                  // Call the callback to scroll to checkpoint details
                  if (onMilestoneClick) {
                    onMilestoneClick(index);
                  }
                }}
                onMouseEnter={() => setHoveredMilestone(index)}
                onMouseLeave={() => setHoveredMilestone(null)}
              >
                {/* Label above (for alternating layout) */}
                {isAbove && (
                  <div 
                    className="text-center absolute left-1/2 -translate-x-1/2" 
                    style={{ 
                      top: 0,
                      paddingBottom: '4px'
                    }}
                  >
                    {useCompactMode && !showFullLabel ? (
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(milestone.time_seconds)}
                      </div>
                    ) : (
                      <>
                        <div className="text-xs font-medium whitespace-nowrap">
                          {milestone.label || MILESTONE_LABELS[milestone.event_type] || 'Event'}
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTime(milestone.time_seconds)}
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                {/* Dot - centered on the line with absolute positioning */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md transition-all absolute left-1/2 -translate-x-1/2",
                    color,
                    expandedMilestone === index && "ring-4 ring-primary/20 scale-110",
                    "group-hover:scale-110"
                  )}
                  style={{
                    top: `${lineTop - dotCenterOffset}px`
                  }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                
                {/* Label below (default position) */}
                {!isAbove && (
                  <div 
                    className="text-center absolute left-1/2 -translate-x-1/2" 
                    style={{ 
                      top: `${lineTop + dotCenterOffset + 4}px`
                    }}
                  >
                    {useCompactMode && !showFullLabel ? (
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(milestone.time_seconds)}
                      </div>
                    ) : (
                      <>
                        <div className="text-xs font-medium whitespace-nowrap">
                          {milestone.label || MILESTONE_LABELS[milestone.event_type] || 'Event'}
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTime(milestone.time_seconds)}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Expanded Milestone Details */}
        {expandedMilestone !== null && sortedMilestones[expandedMilestone] && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/50 space-y-3">
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = MILESTONE_ICONS[sortedMilestones[expandedMilestone].event_type] || Clock;
                const color = MILESTONE_COLORS[sortedMilestones[expandedMilestone].event_type] || "bg-gray-500";
                return (
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white", color)}>
                    <Icon className="h-3 w-3" />
                  </div>
                );
              })()}
              <h4 className="font-semibold">
                {sortedMilestones[expandedMilestone].label || 
                 MILESTONE_LABELS[sortedMilestones[expandedMilestone].event_type] || 'Event'}
                {' @ '}
                {formatTime(sortedMilestones[expandedMilestone].time_seconds)}
              </h4>
            </div>

            {sortedMilestones[expandedMilestone].visual_cue && (
              <div className="text-sm">
                <span className="font-medium">👀 Look:</span> {sortedMilestones[expandedMilestone].visual_cue}
              </div>
            )}

            {sortedMilestones[expandedMilestone].audio_cue && (
              <div className="text-sm">
                <span className="font-medium">👂 Sound:</span> {sortedMilestones[expandedMilestone].audio_cue}
              </div>
            )}

            {sortedMilestones[expandedMilestone].aroma_cue && (
              <div className="text-sm">
                <span className="font-medium">👃 Smell:</span> {sortedMilestones[expandedMilestone].aroma_cue}
              </div>
            )}

            {sortedMilestones[expandedMilestone].action_required && (
              <div className="text-sm font-medium text-primary">
                <span className="font-bold">🎬 Action:</span> {sortedMilestones[expandedMilestone].action_required}
              </div>
            )}

            {/* Show what's next */}
            {expandedMilestone < sortedMilestones.length - 1 && (
              <div className="text-xs text-muted-foreground pt-2 border-t">
                ⏱️ Next: {sortedMilestones[expandedMilestone + 1].label || 
                         MILESTONE_LABELS[sortedMilestones[expandedMilestone + 1].event_type] || 'Event'} in{' '}
                {formatTime(
                  sortedMilestones[expandedMilestone + 1].time_seconds - 
                  sortedMilestones[expandedMilestone].time_seconds
                )}
              </div>
            )}
          </div>
        )}

        {/* Instruction text */}
        {!expandedMilestone && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            {useCompactMode ? 'Hover over milestones to see labels, click for details' : 'Click any milestone to see detailed guidance'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
