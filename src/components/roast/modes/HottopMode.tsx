/**
 * HottopMode Component
 * Bean/environment temperature tracking with RoR for the Hottop KN-8828B-2K+,
 * plus heat/fan logging in manual mode.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { RoasterHeader } from "../shared/RoasterHeader";
import { RoastControls } from "../shared/RoastControls";
import { CrackEventButtons } from "../shared/CrackEventButtons";
import { RoasterTips } from "../shared/RoasterTips";
import { ManualControlSliders } from "../hottop/ManualControlSliders";
import { AdvancedMetrics, calculateRoR, type AdvancedMetricsData } from "../hottop/AdvancedMetrics";
import { useRoastSession } from "@/hooks/useRoastSession";
import { getRoasterSpec } from "@/utils/roasterRegistry";
import type {
  CrackEvent,
  HottopManualControl,
  HottopMode as HottopModeType,
  HottopRoastData,
  HottopTempDataPoint,
} from "@/types/roast-data.types";
import type { RoastModeProps } from "./types";

const ROASTER = 'hottop-kn8828';

const ROAST_MODES: { value: HottopModeType; label: string }[] = [
  { value: 'auto-light', label: '☀️ Auto Light' },
  { value: 'auto-medium', label: '🌤️ Auto Medium' },
  { value: 'auto-dark', label: '🌑 Auto Dark' },
  { value: 'manual', label: '🎛️ Manual' },
];

interface HottopSettings {
  batchSize: number;
  roastMode: HottopModeType;
  heatPercent: number;
  fanPercent: number;
}

interface HottopLog {
  temperatureData: HottopTempDataPoint[];
  crackEvents: CrackEvent[];
  manualControls: HottopManualControl[];
}

export function HottopMode(props: RoastModeProps) {
  const session = useRoastSession<HottopSettings, HottopLog>(
    'roast_session:hottop-kn8828',
    { batchSize: getRoasterSpec(ROASTER).recommendedBatchSize, roastMode: 'manual', heatPercent: 50, fanPercent: 50 },
    { temperatureData: [], crackEvents: [], manualControls: [] },
    {
      // Record the starting heat/fan settings at 0:00 in manual mode
      seedLogOnStart: ({ roastMode, heatPercent, fanPercent }) => ({
        manualControls: roastMode === 'manual' ? [{ time: 0, heatPercent, fanPercent, timestamp: Date.now() }] : [],
      }),
    },
  );
  const { settings, updateSettings, log, canRecord } = session;
  const { roastMode, heatPercent, fanPercent } = settings;
  const [beanTemp, setBeanTemp] = useState('');
  const [environmentalTemp, setEnvironmentalTemp] = useState('');

  const handleRecordTemp = () => {
    const temp = parseFloat(beanTemp);
    if (Number.isNaN(temp) || temp < 0 || temp > 300) return;
    const envTemp = parseFloat(environmentalTemp);

    const recorded = session.record((l, time) => {
      const previous = l.temperatureData[l.temperatureData.length - 1];
      const point: HottopTempDataPoint = {
        time,
        beanTemp: temp,
        environmentalTemp: Number.isNaN(envTemp) ? undefined : envTemp,
        rateOfRise: previous ? calculateRoR(temp, previous.beanTemp, time - previous.time) : undefined,
        timestamp: Date.now(),
      };
      return { ...l, temperatureData: [...l.temperatureData, point] };
    });
    if (recorded) setBeanTemp('');
  };

  const handleRecordManualControl = () => {
    session.record((l, time) => ({
      ...l,
      manualControls: [...l.manualControls, { time, heatPercent, fanPercent, timestamp: Date.now() }],
    }));
  };

  const lastControl = log.manualControls[log.manualControls.length - 1];
  const hasUnrecordedControlChange =
    !lastControl || lastControl.heatPercent !== heatPercent || lastControl.fanPercent !== fanPercent;

  const lastTempData = log.temperatureData[log.temperatureData.length - 1];
  const previousTempData = log.temperatureData[log.temperatureData.length - 2];
  const advancedMetrics: AdvancedMetricsData = {
    rateOfRise: lastTempData?.rateOfRise,
    tempDelta: lastTempData && previousTempData ? lastTempData.beanTemp - previousTempData.beanTemp : undefined,
    environmentalTemp: lastTempData?.environmentalTemp,
    beanTemp: lastTempData?.beanTemp,
    timeElapsed: session.elapsedSeconds,
  };

  const buildData = (): HottopRoastData => ({
    mode: 'hottop-advanced',
    roastMode,
    startTime: session.startTime ?? Date.now(),
    endTime: session.endTime ?? Date.now(),
    temperatureData: log.temperatureData,
    manualControls: roastMode === 'manual' ? log.manualControls : undefined,
    crackEvents: log.crackEvents,
  });

  const readings = log.temperatureData.length;

  return (
    <div className="space-y-4">
      <RoasterHeader
        roasterType={ROASTER}
        subtitle="Advanced Temperature Tracking"
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
              <Label className="text-sm font-medium" id="hottop-roast-mode">Roast Mode</Label>
              <RadioGroup
                value={roastMode}
                onValueChange={value => updateSettings({ roastMode: value as HottopModeType })}
                disabled={session.isPaused || session.status === 'stopped'}
                aria-labelledby="hottop-roast-mode"
                className="space-y-2"
              >
                {ROAST_MODES.map(({ value, label }) => (
                  <div key={value} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted">
                    <RadioGroupItem value={value} id={`hottop-${value}`} />
                    <Label htmlFor={`hottop-${value}`} className="font-normal cursor-pointer flex-1">
                      {label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">🌡️ Bean Temperature</Label>
              <div className="text-4xl font-bold font-mono text-center text-orange-600 dark:text-orange-400">
                {lastTempData ? lastTempData.beanTemp.toFixed(0) : '---'}°C
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="hottop-bean-temp" className="text-sm font-medium">Bean Temp (°C) *</Label>
                  <Input
                    id="hottop-bean-temp"
                    type="number"
                    placeholder="205"
                    value={beanTemp}
                    onChange={e => setBeanTemp(e.target.value)}
                    disabled={!canRecord}
                    className="text-2xl font-bold font-mono text-center h-14"
                    min="0"
                    max="300"
                    step="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hottop-env-temp" className="text-sm font-medium">Env Temp (°C)</Label>
                  <Input
                    id="hottop-env-temp"
                    type="number"
                    placeholder="24"
                    value={environmentalTemp}
                    onChange={e => setEnvironmentalTemp(e.target.value)}
                    disabled={!canRecord}
                    className="text-2xl font-bold font-mono text-center h-14"
                    min="0"
                    max="100"
                    step="1"
                  />
                </div>
              </div>

              <Button onClick={handleRecordTemp} className="w-full" disabled={!beanTemp || !canRecord}>
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
              <h3 className="text-sm font-medium mb-3">📊 Advanced Metrics</h3>
              <AdvancedMetrics data={advancedMetrics} />
            </div>

            {roastMode === 'manual' && (
              <>
                <Separator />
                <ManualControlSliders
                  heatPercent={heatPercent}
                  fanPercent={fanPercent}
                  onHeatChange={value => updateSettings({ heatPercent: value })}
                  onFanChange={value => updateSettings({ fanPercent: value })}
                  onRecordChange={handleRecordManualControl}
                  disabled={!canRecord}
                  hasUnsavedChanges={hasUnrecordedControlChange}
                />
              </>
            )}

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
