/**
 * TimerDisplay Component
 * Displays elapsed time or countdown timer with formatting
 * Supports both count-up and countdown modes
 */

import { cn } from '@/lib/utils';

interface TimerDisplayProps {
  seconds: number;
  mode: 'count-up' | 'countdown';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function TimerDisplay({ 
  seconds, 
  mode, 
  size = 'medium',
  className 
}: TimerDisplayProps) {
  /**
   * Format seconds into MM:SS display
   * Handles negative values for overtime countdown
   */
  const formatTime = (secs: number): string => {
    const absSeconds = Math.abs(secs);
    const mins = Math.floor(absSeconds / 60);
    const remainingSecs = absSeconds % 60;
    
    const formatted = `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
    
    // Show negative sign for overtime in countdown mode
    if (mode === 'countdown' && secs < 0) {
      return `-${formatted}`;
    }
    
    return formatted;
  };
  
  const displayTime = formatTime(seconds);
  
  // Size classes for responsive typography
  const sizeClasses = {
    small: 'text-3xl',
    medium: 'text-4xl md:text-5xl',
    large: 'text-5xl md:text-7xl'
  };
  
  // Warning states for countdown mode
  const isWarning = mode === 'countdown' && seconds > 0 && seconds < 120; // Last 2 minutes
  const isOvertime = mode === 'countdown' && seconds < 0;
  
  return (
    <div 
      className={cn(
        'font-mono font-bold text-center tabular-nums',
        sizeClasses[size],
        isOvertime && 'text-destructive animate-pulse',
        isWarning && 'text-orange-500',
        className
      )}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${mode === 'countdown' ? 'Time remaining' : 'Elapsed time'}: ${displayTime}`}
    >
      {displayTime}
    </div>
  );
}
