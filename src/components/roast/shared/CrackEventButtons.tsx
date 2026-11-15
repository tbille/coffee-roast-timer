/**
 * CrackEventButtons Component
 * Records first/second crack, shows when each was recorded,
 * and the development phase once first crack has happened.
 */

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Check } from 'lucide-react';
import { DevelopmentStats } from './DevelopmentStats';
import type { CrackEvent } from '@/types/roast-data.types';

interface CrackEventButtonsProps {
  firstCrack: CrackEvent | undefined;
  secondCrack: CrackEvent | undefined;
  onRecord: (type: CrackEvent['type']) => void;
  /** Current elapsed roast time, for development stats */
  elapsedSeconds: number;
  disabled?: boolean;
}

function formatElapsed(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function Recorded({ event }: { event: CrackEvent }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground pl-5">
      <Check className="w-3 h-3 text-green-600" aria-hidden="true" />
      <span>Recorded at {formatElapsed(event.time)}</span>
    </div>
  );
}

export function CrackEventButtons({
  firstCrack,
  secondCrack,
  onRecord,
  elapsedSeconds,
  disabled = false,
}: CrackEventButtonsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">🔊 Crack Events</h3>

      <div className="space-y-2">
        <span className="text-sm">First Crack</span>
        {firstCrack ? (
          <Recorded event={firstCrack} />
        ) : (
          <Button size="sm" onClick={() => onRecord('first')} disabled={disabled} className="w-full">
            Record First Crack
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <span className="text-sm">Second Crack</span>
        {secondCrack ? (
          <Recorded event={secondCrack} />
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRecord('second')}
            disabled={disabled || !firstCrack}
            className="w-full"
          >
            {firstCrack ? 'Record Second Crack' : 'Record 1st crack first'}
          </Button>
        )}
      </div>

      {firstCrack && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-medium mb-3">📊 Development Phase</h3>
            <DevelopmentStats elapsedSeconds={elapsedSeconds} firstCrackTime={firstCrack.time} variant="compact" />
          </div>
        </>
      )}
    </div>
  );
}
