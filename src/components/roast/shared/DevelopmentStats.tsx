/**
 * DevelopmentStats Component
 * Shows development time and ratio after first crack
 */

import { Card } from '@/components/ui/card';

interface DevelopmentStatsProps {
  elapsedSeconds: number;
  firstCrackTime: number;
  variant?: 'default' | 'compact';
}

export function DevelopmentStats({
  elapsedSeconds,
  firstCrackTime,
  variant = 'default'
}: DevelopmentStatsProps) {
  // Calculate development time (time since first crack)
  const developmentTime = Math.max(0, elapsedSeconds - firstCrackTime);
  
  // Calculate development ratio (dev time / total time)
  const developmentRatio = elapsedSeconds > 0 
    ? (developmentTime / elapsedSeconds) * 100 
    : 0;
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Determine if development ratio is in good range (15-25%)
  const isGoodRatio = developmentRatio >= 15 && developmentRatio <= 25;
  const ratioColor = isGoodRatio 
    ? 'text-green-600' 
    : developmentRatio < 15 
      ? 'text-orange-500' 
      : 'text-red-500';
  
  const ratioEmoji = isGoodRatio 
    ? '🟢' 
    : developmentRatio < 15 
      ? '🟠' 
      : '🔴';
  
  // Compact variant - inline display
  if (variant === 'compact') {
    return (
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs text-muted-foreground">Time:</span>
          <span className="text-sm font-mono font-semibold">{formatTime(developmentTime)}</span>
        </div>
        
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs text-muted-foreground">Ratio:</span>
          <span className={`text-sm font-mono font-semibold ${ratioColor}`}>
            {developmentRatio.toFixed(1)}% {ratioEmoji}
          </span>
        </div>
        
        <div className="text-xs">
          {isGoodRatio ? (
            <span className="text-green-600">
              ✓ Good development (15-25%)
            </span>
          ) : developmentRatio < 15 ? (
            <span className="text-orange-500">
              ⚠ Short development
            </span>
          ) : (
            <span className="text-red-500">
              ⚠ Long development
            </span>
          )}
        </div>
      </div>
    );
  }
  
  // Default variant - original card layout
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <label className="text-sm font-medium block">
          📊 Development Phase
        </label>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Development Time */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              Time Since 1st Crack
            </div>
            <div className="text-2xl font-bold font-mono">
              {formatTime(developmentTime)}
            </div>
          </div>
          
          {/* Development Ratio */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              Development Ratio
            </div>
            <div className={`text-2xl font-bold font-mono ${ratioColor}`}>
              {developmentRatio.toFixed(1)}%
            </div>
          </div>
        </div>
        
        {/* Guidance */}
        <div className="text-xs text-muted-foreground">
          {isGoodRatio ? (
            <span className="text-green-600">
              ✓ Good development ratio (15-25% is typical)
            </span>
          ) : developmentRatio < 15 ? (
            <span className="text-orange-500">
              ⚠ Short development - consider extending roast
            </span>
          ) : (
            <span className="text-red-500">
              ⚠ Long development - may be past peak flavor
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
