/**
 * KaldiMode Component
 * Manual temperature tracking for the KALDI Wide, with voice input,
 * auto-record reminders and environmental conditions.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RoasterHeader } from "../shared/RoasterHeader";
import { RoastControls } from "../shared/RoastControls";
import { CrackEventButtons } from "../shared/CrackEventButtons";
import { RoasterTips } from "../shared/RoasterTips";
import { AutoRecordTimer } from "../kaldi/AutoRecordTimer";
import { EnvironmentalTracker } from "../kaldi/EnvironmentalTracker";
import { VoiceInput, type VoiceCommand } from "../kaldi/VoiceInput";
import { useRoastSession } from "@/hooks/useRoastSession";
import { getRoasterSpec } from "@/utils/roasterRegistry";
import type {
  CrackEvent,
  EnvironmentalData,
  ManualRoastData,
  ManualTempDataPoint,
} from "@/types/roast-data.types";
import type { RoastModeProps } from "./types";

const ROASTER = 'kaldi-wide';

interface KaldiSettings {
  batchSize: number;
  environmental: Partial<EnvironmentalData>;
  autoRecordEnabled: boolean;
  autoRecordInterval: number;
}

interface KaldiLog {
  temperatureData: ManualTempDataPoint[];
  crackEvents: CrackEvent[];
}

const isValidTemp = (temp: number) => !Number.isNaN(temp) && temp >= 0 && temp <= 300;

export function KaldiMode(props: RoastModeProps) {
  const session = useRoastSession<KaldiSettings, KaldiLog>(
    'roast_session:kaldi-wide',
    {
      batchSize: getRoasterSpec(ROASTER).recommendedBatchSize,
      environmental: { location: 'indoor' },
      autoRecordEnabled: false,
      autoRecordInterval: 60,
    },
    { temperatureData: [], crackEvents: [] },
  );
  const { settings, updateSettings, log, canRecord } = session;
  const [currentTemp, setCurrentTemp] = useState('');

  const recordTemp = (temp: number, recordMethod: ManualTempDataPoint['recordMethod']) => {
    if (!isValidTemp(temp)) return false;
    return session.record((l, time) => ({
      ...l,
      temperatureData: [...l.temperatureData, { time, temp, recordMethod, timestamp: Date.now() }],
    }));
  };

  const handleManualRecord = () => {
    if (recordTemp(parseFloat(currentTemp), 'manual')) setCurrentTemp('');
  };

  const handleVoiceTemperature = (temp: number) => {
    setCurrentTemp(temp.toString());
    recordTemp(temp, 'voice');
  };

  const handleVoiceCommand = (command: VoiceCommand) => {
    if (command === 'first-crack') session.recordCrack('first');
    else if (command === 'second-crack') session.recordCrack('second');
  };

  const buildData = (): ManualRoastData => ({
    mode: 'manual-simple',
    startTime: session.startTime ?? Date.now(),
    endTime: session.endTime ?? Date.now(),
    temperatureData: log.temperatureData,
    crackEvents: log.crackEvents,
    environmental: settings.environmental.location ? (settings.environmental as EnvironmentalData) : undefined,
  });

  const lastReading = log.temperatureData[log.temperatureData.length - 1];
  const readings = log.temperatureData.length;

  return (
    <div className="space-y-4">
      <RoasterHeader
        roasterType={ROASTER}
        subtitle="Manual Temperature Tracking"
        batchSize={settings.batchSize}
        onBatchSizeChange={batchSize => updateSettings({ batchSize })}
        batchLocked={session.status !== 'idle'}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <RoastControls session={session} modeProps={props} buildData={buildData} />

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">🌡️ Last Recorded Temperature</Label>
              <div className="text-4xl font-bold font-mono text-primary text-center">
                {lastReading ? lastReading.temp : '---'}°C
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <VoiceInput
              onTemperature={handleVoiceTemperature}
              onCommand={handleVoiceCommand}
              disabled={!canRecord}
            />

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="kaldi-temp-input" className="text-sm font-medium">
                Temperature Reading (°C)
              </Label>
              <Input
                id="kaldi-temp-input"
                type="number"
                placeholder="192"
                value={currentTemp}
                onChange={e => setCurrentTemp(e.target.value)}
                disabled={!canRecord}
                className="text-3xl font-bold font-mono text-center h-16"
                min="0"
                max="300"
                step="1"
              />
              <Button onClick={handleManualRecord} className="w-full" disabled={!currentTemp || !canRecord}>
                📝 Record Temperature
              </Button>
              {readings > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  {readings} reading{readings !== 1 ? 's' : ''} recorded
                </p>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-3">⏱️ Auto-Record</h3>
              <AutoRecordTimer
                isEnabled={settings.autoRecordEnabled}
                onToggle={autoRecordEnabled => updateSettings({ autoRecordEnabled })}
                interval={settings.autoRecordInterval}
                onIntervalChange={autoRecordInterval => updateSettings({ autoRecordInterval })}
                onTrigger={() => recordTemp(parseFloat(currentTemp), 'auto')}
                lastRecordedTime={lastReading?.time}
                lastRecordedTemp={lastReading?.temp}
                isPaused={!canRecord}
              />
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-3">🌤️ Environment</h3>
              <EnvironmentalTracker
                data={settings.environmental}
                onChange={environmental => updateSettings({ environmental })}
              />
            </div>

            <Separator />

            <CrackEventButtons
              firstCrack={session.firstCrack}
              secondCrack={session.secondCrack}
              onRecord={type => session.recordCrack(type)}
              elapsedSeconds={session.elapsedSeconds}
              disabled={!canRecord}
            />
          </CardContent>
        </Card>
      </div>

      <RoasterTips
        roasterType={ROASTER}
        elapsedSeconds={session.elapsedSeconds}
        firstCrackRecorded={!!session.firstCrack}
        defaultCollapsed
      />
    </div>
  );
}
