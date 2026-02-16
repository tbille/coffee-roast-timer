/**
 * CrackEventButtons Component
 * Reusable buttons for recording first and second crack events
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface CrackEvent {
  time: number;
  type: 'first' | 'second';
  timestamp: number;
}

interface CrackEventButtonsProps {
  onFirstCrack: () => void;
  onSecondCrack: () => void;
  firstCrackRecorded: boolean;
  secondCrackRecorded: boolean;
  disabled?: boolean;
  variant?: 'default' | 'inline';
  crackEvents?: CrackEvent[];
  baseDuration?: number;
}

export function CrackEventButtons({
  onFirstCrack,
  onSecondCrack,
  firstCrackRecorded,
  secondCrackRecorded,
  disabled = false,
  variant = 'default',
  crackEvents = [],
  baseDuration = 0
}: CrackEventButtonsProps) {
  // Helper to format time elapsed from countdown
  const formatTimeElapsed = (timeRemaining: number) => {
    const elapsed = baseDuration - timeRemaining;
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };
  
  const firstCrackEvent = crackEvents.find(e => e.type === 'first');
  const secondCrackEvent = crackEvents.find(e => e.type === 'second');
  
  // Inline variant - vertical list with status
  if (variant === 'inline') {
    return (
      <div className="space-y-3">
        {/* First Crack */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">🔊 First Crack</span>
          </div>
          {firstCrackRecorded && firstCrackEvent ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pl-5">
              <Check className="w-3 h-3 text-green-600" />
              <span>Recorded at {formatTimeElapsed(firstCrackEvent.time)}</span>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={onFirstCrack}
              disabled={disabled || firstCrackRecorded}
              className="w-full"
            >
              Record First Crack
            </Button>
          )}
        </div>
        
        {/* Second Crack */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">🔊 Second Crack</span>
          </div>
          {secondCrackRecorded && secondCrackEvent ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pl-5">
              <Check className="w-3 h-3 text-green-600" />
              <span>Recorded at {formatTimeElapsed(secondCrackEvent.time)}</span>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={onSecondCrack}
              disabled={disabled || secondCrackRecorded || !firstCrackRecorded}
              className="w-full"
            >
              {!firstCrackRecorded ? 'Record 1st crack first' : 'Record Second Crack'}
            </Button>
          )}
        </div>
        
        {firstCrackRecorded && (
          <p className="text-xs text-muted-foreground pt-1">
            ✓ Development phase started
          </p>
        )}
      </div>
    );
  }
  
  // Default variant - original card layout
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <label className="text-sm font-medium block">
          🔊 Crack Events
        </label>
        <p className="text-sm text-muted-foreground">
          Record when you hear the characteristic popping sounds
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          {/* First Crack Button */}
          <Button
            size="lg"
            variant={firstCrackRecorded ? 'secondary' : 'default'}
            onClick={onFirstCrack}
            disabled={disabled || firstCrackRecorded}
            className="h-20 flex flex-col gap-1"
          >
            <span className="text-lg">First Crack</span>
            {firstCrackRecorded && (
              <span className="flex items-center gap-1 text-xs">
                <Check className="w-4 h-4" />
                Recorded
              </span>
            )}
          </Button>
          
          {/* Second Crack Button */}
          <Button
            size="lg"
            variant={secondCrackRecorded ? 'secondary' : 'outline'}
            onClick={onSecondCrack}
            disabled={disabled || secondCrackRecorded || !firstCrackRecorded}
            className="h-20 flex flex-col gap-1"
          >
            <span className="text-lg">Second Crack</span>
            {secondCrackRecorded ? (
              <span className="flex items-center gap-1 text-xs">
                <Check className="w-4 h-4" />
                Recorded
              </span>
            ) : !firstCrackRecorded ? (
              <span className="text-xs text-muted-foreground">
                Record 1st first
              </span>
            ) : null}
          </Button>
        </div>
        
        {firstCrackRecorded && (
          <p className="text-xs text-muted-foreground text-center">
            ✓ Development phase started
          </p>
        )}
      </div>
    </Card>
  );
}
