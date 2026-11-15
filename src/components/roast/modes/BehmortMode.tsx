/**
 * BehmortMode Component
 * Profile-based countdown mode for Behmor 2000AB Plus
 * Features: P1-P5 profiles, 30-second extensions, optional temperature tracking.
 * All recorded times (cracks, extensions, readings) are seconds elapsed since start.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RoasterHeader } from '../shared/RoasterHeader';
import { RoastControls } from '../shared/RoastControls';
import { CrackEventButtons } from '../shared/CrackEventButtons';
import { RoasterTips } from '../shared/RoasterTips';
import { BehmortProfileDropdown } from '../behmor/BehmortProfileDropdown';
import { ExtensionTracker } from '../behmor/ExtensionTracker';
import { useRoastSession } from '@/hooks/useRoastSession';
import { getRoasterSpec } from '@/utils/roasterRegistry';
import type {
  BehmortProfile,
  CrackEvent,
  Extension,
  OptionalTempDataPoint,
  ProfileBasedRoastData,
} from '@/types/roast-data.types';
import type { RoastModeProps } from './types';

const ROASTER = 'behmor-2000ab';
const EXTENSION_SECONDS = 30;
const MAX_EXTENSIONS = 6;

/** Profile durations in seconds */
const PROFILE_DURATIONS: Record<BehmortProfile, number> = {
  P1: 14 * 60,
  P2: 16 * 60,
  P3: 18 * 60,
  P4: 20 * 60,
  P5: 22 * 60,
  Manual: 0,
};

interface BehmorSettings {
  batchSize: number;
  profile: BehmortProfile;
}

interface BehmorLog {
  extensions: Extension[];
  crackEvents: CrackEvent[];
  temperatureData: OptionalTempDataPoint[];
}

export function BehmortMode(props: RoastModeProps) {
  const session = useRoastSession<BehmorSettings, BehmorLog>(
    'roast_session:behmor-2000ab',
    { batchSize: getRoasterSpec(ROASTER).recommendedBatchSize, profile: 'P3' },
    { extensions: [], crackEvents: [], temperatureData: [] },
  );
  const { settings, updateSettings, log, canRecord, elapsedSeconds } = session;
  const [probeTemp, setProbeTemp] = useState('');

  const baseDuration = PROFILE_DURATIONS[settings.profile];
  const totalDuration = baseDuration + log.extensions.reduce((sum, ext) => sum + ext.duration, 0);
  const secondsRemaining = totalDuration - elapsedSeconds;

  const addExtension = () => {
    session.record((l, time) =>
      l.extensions.length >= MAX_EXTENSIONS
        ? l
        : { ...l, extensions: [...l.extensions, { time, duration: EXTENSION_SECONDS, timestamp: Date.now() }] },
    );
  };

  const recordTemperature = () => {
    const temp = parseFloat(probeTemp);
    if (!(temp > 0)) return;
    const recorded = session.record((l, time) => ({
      ...l,
      temperatureData: [...l.temperatureData, { time, temp, timestamp: Date.now() }],
    }));
    if (recorded) setProbeTemp('');
  };

  const buildData = (): ProfileBasedRoastData => ({
    mode: 'profile-based',
    startTime: session.startTime ?? Date.now(),
    endTime: session.endTime ?? Date.now(),
    profile: settings.profile,
    baseDuration,
    extensions: log.extensions,
    crackEvents: log.crackEvents,
    temperatureData: log.temperatureData.length > 0 ? log.temperatureData : undefined,
  });

  const readings = log.temperatureData.length;

  return (
    <div className="space-y-4">
      <RoasterHeader
        roasterType={ROASTER}
        subtitle="Profile-Based Countdown"
        batchSize={settings.batchSize}
        onBatchSizeChange={batchSize => updateSettings({ batchSize })}
        batchLocked={session.status !== 'idle'}
      >
        <BehmortProfileDropdown
          selectedProfile={settings.profile}
          onProfileChange={profile => updateSettings({ profile })}
          disabled={session.status !== 'idle'}
          variant="compact"
        />
      </RoasterHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-6">
            <RoastControls
              session={session}
              modeProps={props}
              buildData={buildData}
              timer={{ label: 'Time Remaining', seconds: secondsRemaining, mode: 'countdown' }}
              startBlockedReason={
                settings.profile === 'Manual' ? 'Manual mode is not supported yet. Select a profile (P1–P5).' : undefined
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <ExtensionTracker
              extensions={log.extensions}
              onAddExtension={addExtension}
              disabled={!canRecord}
              maxExtensions={MAX_EXTENSIONS}
              variant="compact"
            />

            <Separator />

            <CrackEventButtons
              firstCrack={session.firstCrack}
              secondCrack={session.secondCrack}
              onRecord={type => session.recordCrack(type)}
              elapsedSeconds={elapsedSeconds}
              disabled={!canRecord}
            />

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="behmor-probe-temp" className="text-sm font-medium">
                🌡️ External Thermometer
              </Label>
              <p className="text-xs text-muted-foreground">Optional - most users don't need this</p>
              <div className="flex gap-2">
                <Input
                  id="behmor-probe-temp"
                  type="number"
                  value={probeTemp}
                  onChange={e => setProbeTemp(e.target.value)}
                  placeholder="Temp (°C)"
                  disabled={!canRecord}
                  className="flex-1"
                />
                <Button onClick={recordTemperature} disabled={!canRecord || !probeTemp} size="sm">
                  Record
                </Button>
              </div>
              {readings > 0 && (
                <p className="text-xs text-muted-foreground">
                  {readings} reading{readings !== 1 ? 's' : ''} recorded
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <RoasterTips
        roasterType={ROASTER}
        elapsedSeconds={elapsedSeconds}
        firstCrackRecorded={!!session.firstCrack}
        profile={settings.profile}
        extensions={log.extensions.length}
        defaultCollapsed
      />
    </div>
  );
}
