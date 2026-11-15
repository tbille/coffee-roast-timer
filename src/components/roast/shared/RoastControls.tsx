/**
 * RoastControls Component
 * Timer display plus Start / Pause / Resume / Stop / Save / New roast buttons,
 * shared by every roaster mode. Also bridges the session to RoastMonitor
 * (save requests and in-progress state).
 */

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, RotateCcw, Save } from 'lucide-react';
import { TimerDisplay } from './TimerDisplay';
import type { RoastSession } from '@/hooks/useRoastSession';
import type { CrackEvent, RoastData } from '@/types/roast-data.types';
import type { TemperatureUnit } from '@/utils/temperatureConversion';
import type { RoastModeProps } from '../modes/types';

interface RoastControlsProps<S extends { batchSize: number }, L extends { crackEvents: CrackEvent[] }> {
  session: RoastSession<S, L>;
  modeProps: RoastModeProps;
  /** Builds the roast record from the current session */
  buildData: () => RoastData;
  temperatureUnit?: TemperatureUnit;
  /** When set, Start is disabled and this reason is shown */
  startBlockedReason?: string;
  /** Override the default count-up timer (e.g. Behmor countdown) */
  timer?: { label: string; seconds: number; mode: 'count-up' | 'countdown' };
}

export function RoastControls<S extends { batchSize: number }, L extends { crackEvents: CrackEvent[] }>({
  session,
  modeProps,
  buildData,
  temperatureUnit = 'C',
  startBlockedReason,
  timer,
}: RoastControlsProps<S, L>) {
  const { onSave, onInProgressChange } = modeProps;
  const { inProgress } = session;

  useEffect(() => {
    onInProgressChange?.(inProgress);
  }, [inProgress, onInProgressChange]);

  useEffect(() => () => onInProgressChange?.(false), [onInProgressChange]);

  const requestSave = (durationSeconds: number) => {
    onSave({
      data: buildData(),
      durationSeconds,
      batchSize: session.settings.batchSize,
      temperatureUnit,
      clear: session.reset,
    });
  };

  const handleStop = () => {
    const duration = session.currentElapsed();
    session.stop();
    requestSave(duration);
  };

  const { label, seconds, mode } = timer ?? {
    label: 'Roast Timer',
    seconds: session.elapsedSeconds,
    mode: 'count-up' as const,
  };

  const bigButton = 'flex items-center gap-2';

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground text-center uppercase tracking-wide">
          {label}
        </h3>
        <TimerDisplay seconds={seconds} mode={mode} size="large" />
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          {session.status === 'idle' && (
            <Button
              onClick={session.start}
              size="lg"
              className={`${bigButton} flex-1`}
              disabled={!!startBlockedReason}
            >
              <Play className="h-5 w-5" />
              Start Roast
            </Button>
          )}

          {session.inProgress && (
            <>
              {session.isRunning ? (
                <Button onClick={session.pause} variant="secondary" size="lg" className={`${bigButton} flex-1`}>
                  <Pause className="h-5 w-5" />
                  Pause
                </Button>
              ) : (
                <Button onClick={session.resume} size="lg" className={`${bigButton} flex-1`}>
                  <Play className="h-5 w-5" />
                  Resume
                </Button>
              )}
              <Button onClick={handleStop} variant="destructive" size="lg" className={bigButton}>
                <Square className="h-5 w-5" />
                Stop
              </Button>
            </>
          )}

          {session.status === 'stopped' && (
            <>
              <Button
                onClick={() => requestSave(session.elapsedSeconds)}
                size="lg"
                className={`${bigButton} flex-1`}
              >
                <Save className="h-5 w-5" />
                Save Roast
              </Button>
              <Button onClick={session.reset} variant="outline" size="lg" className={bigButton}>
                <RotateCcw className="h-5 w-5" />
                New Roast
              </Button>
            </>
          )}
        </div>

        {session.status === 'idle' && startBlockedReason && (
          <p className="text-xs text-destructive text-center" role="alert">
            {startBlockedReason}
          </p>
        )}
      </div>
    </div>
  );
}
