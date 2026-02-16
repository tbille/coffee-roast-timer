/**
 * ExtensionTracker Component
 * Visual tracker for Behmor 30-second extensions (max 6)
 * Shows filled circles for added extensions
 */

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface Extension {
  time: number;
  duration: number;
  timestamp: number;
}

interface ExtensionTrackerProps {
  extensions: Extension[];
  onAddExtension: () => void;
  disabled?: boolean;
  maxExtensions?: number;
  variant?: 'default' | 'compact';
}

export function ExtensionTracker({
  extensions,
  onAddExtension,
  disabled = false,
  maxExtensions = 6,
  variant = 'default'
}: ExtensionTrackerProps) {
  const totalTimeAdded = extensions.reduce((sum, ext) => sum + ext.duration, 0);
  const minutes = Math.floor(totalTimeAdded / 60);
  const seconds = totalTimeAdded % 60;
  const atMaxExtensions = extensions.length >= maxExtensions;
  
  // Compact variant - inline dots display
  if (variant === 'compact') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            ⏰ Extensions
          </label>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: maxExtensions }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  'w-2.5 h-2.5 rounded-full transition-all',
                  index < extensions.length
                    ? 'bg-orange-500'
                    : 'bg-muted-foreground/20'
                )}
                aria-label={`Extension ${index + 1}${index < extensions.length ? ' added' : ' available'}`}
              />
            ))}
          </div>
        </div>
        
        {extensions.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Total added: <span className="font-mono text-orange-600">+{minutes}:{String(seconds).padStart(2, '0')}</span>
          </p>
        )}
        
        <Button
          className="w-full"
          size="default"
          onClick={onAddExtension}
          disabled={disabled || atMaxExtensions}
          variant={atMaxExtensions ? 'secondary' : 'default'}
        >
          <Plus className="h-4 w-4 mr-2" />
          {atMaxExtensions ? 'Max Reached' : 'Add 30 Seconds'}
        </Button>
        
        {/* Warnings */}
        {extensions.length >= 4 && !atMaxExtensions && (
          <p className="text-xs text-orange-500">
            ⚠ Many extensions - roast getting dark
          </p>
        )}
        
        {atMaxExtensions && (
          <p className="text-xs text-destructive">
            ⚠ Maximum reached - consider stopping
          </p>
        )}
      </div>
    );
  }
  
  // Default variant - original large circles
  return (
    <div className="space-y-4">
      <label className="text-sm font-medium flex items-center gap-2">
        ⏰ Time Extensions
        <span className="text-xs text-muted-foreground font-normal">
          ({extensions.length}/{maxExtensions})
        </span>
      </label>
      
      {/* Visual circles */}
      <div className="flex gap-2 justify-center flex-wrap">
        {Array.from({ length: maxExtensions }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'w-10 h-10 rounded-full border-2 transition-all duration-300 flex items-center justify-center text-xs font-semibold',
              index < extensions.length
                ? 'bg-orange-500 border-orange-500 text-white scale-100' // Filled
                : 'bg-transparent border-muted-foreground/30 text-muted-foreground/50 scale-90' // Empty
            )}
            aria-label={`Extension ${index + 1}${index < extensions.length ? ' added' : ' available'}`}
          >
            {index < extensions.length ? '✓' : index + 1}
          </div>
        ))}
      </div>
      
      {/* Summary text */}
      <div className="text-center space-y-1">
        <p className="text-sm font-medium">
          {extensions.length === 0 ? (
            <span className="text-muted-foreground">No extensions added yet</span>
          ) : (
            <span>
              {extensions.length} × 30s = <span className="font-mono text-orange-600">+{minutes}:{String(seconds).padStart(2, '0')}</span>
            </span>
          )}
        </p>
        {extensions.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Total time added to roast
          </p>
        )}
      </div>
      
      {/* Add extension button */}
      <Button
        className="w-full"
        size="lg"
        onClick={onAddExtension}
        disabled={disabled || atMaxExtensions}
        variant={atMaxExtensions ? 'secondary' : 'default'}
      >
        <Plus className="h-5 w-5 mr-2" />
        {atMaxExtensions ? 'Maximum Extensions Reached' : 'Add 30 Seconds'}
      </Button>
      
      {/* Warnings/tips */}
      {extensions.length >= 4 && !atMaxExtensions && (
        <p className="text-xs text-center text-orange-500">
          ⚠ Many extensions - roast may be getting quite dark
        </p>
      )}
      
      {atMaxExtensions && (
        <p className="text-xs text-center text-destructive">
          ⚠ Maximum 6 extensions reached - consider stopping soon
        </p>
      )}
    </div>
  );
}
