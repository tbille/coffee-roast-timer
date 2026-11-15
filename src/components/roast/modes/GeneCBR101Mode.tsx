/**
 * GeneCBR101Mode Component
 * Dual-temperature tracking (target + current) for the Gene Cafe CBR-101.
 * Temperatures are always stored in Celsius; the unit toggle only affects display/input.
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { RoasterHeader } from '../shared/RoasterHeader';
import { RoastControls } from '../shared/RoastControls';
import { CrackEventButtons } from '../shared/CrackEventButtons';
import { RoasterTips } from '../shared/RoasterTips';
import { useRoastSession } from '@/hooks/useRoastSession';
import { getRoasterSpec } from '@/utils/roasterRegistry';
import { convertTemperature, type TemperatureUnit } from '@/utils/temperatureConversion';
import type { CrackEvent, DualTempRoastData, TemperatureDataPoint } from '@/types/roast-data.types';
import type { RoastModeProps } from './types';

const ROASTER = 'gene-cbr-101';
const MAX_TARGET_C = 300;

interface GeneSettings {
  batchSize: number;
  temperatureUnit: TemperatureUnit;
  targetTemp: string;
  currentTemp: string;
}

interface GeneLog {
  temperatureData: TemperatureDataPoint[];
  crackEvents: CrackEvent[];
}

const toCelsius = (value: string, unit: TemperatureUnit) => {
  const n = parseFloat(value) || 0;
  return unit === 'F' ? convertTemperature(n, 'F', 'C') : n;
};

const convertInput = (value: string, from: TemperatureUnit, to: TemperatureUnit) => {
  const n = parseFloat(value);
  return Number.isNaN(n) ? value : String(Math.round(convertTemperature(n, from, to)));
};

export function GeneCBR101Mode(props: RoastModeProps) {
  const session = useRoastSession<GeneSettings, GeneLog>(
    'roast_session:gene-cbr-101',
    {
      batchSize: getRoasterSpec(ROASTER).recommendedBatchSize,
      temperatureUnit: 'C',
      targetTemp: '200',
      currentTemp: '20',
    },
    { temperatureData: [], crackEvents: [] },
  );
  const { settings, updateSettings, log, canRecord } = session;
  const unit = settings.temperatureUnit;

  const temperaturesInCelsius = () => ({
    targetTemp: toCelsius(settings.targetTemp, unit),
    currentTemp: toCelsius(settings.currentTemp, unit),
  });

  const changeUnit = (next: TemperatureUnit) => {
    if (!next || next === unit) return;
    updateSettings({
      temperatureUnit: next,
      targetTemp: convertInput(settings.targetTemp, unit, next),
      currentTemp: convertInput(settings.currentTemp, unit, next),
    });
  };

  const adjustTargetTemp = (delta: number) => {
    const max = unit === 'F' ? convertTemperature(MAX_TARGET_C, 'C', 'F') : MAX_TARGET_C;
    const next = Math.max(0, Math.min(max, (parseFloat(settings.targetTemp) || 0) + delta));
    updateSettings({ targetTemp: String(next) });
  };

  const recordTemperature = () => {
    const temps = temperaturesInCelsius();
    session.record((l, time) => ({
      ...l,
      temperatureData: [...l.temperatureData, { time, ...temps, timestamp: Date.now() }],
    }));
  };

  const buildData = (): DualTempRoastData => ({
    mode: 'dual-temperature',
    startTime: session.startTime ?? Date.now(),
    endTime: session.endTime ?? Date.now(),
    temperatureData: log.temperatureData,
    crackEvents: log.crackEvents,
  });

  const readings = log.temperatureData.length;

  return (
    <div className="space-y-4">
      <RoasterHeader
        roasterType={ROASTER}
        subtitle="Dual Temperature Tracking"
        batchSize={settings.batchSize}
        onBatchSizeChange={batchSize => updateSettings({ batchSize })}
        batchLocked={session.status !== 'idle'}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <RoastControls session={session} modeProps={props} buildData={buildData} temperatureUnit={unit} />
            <Separator />
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium" id="gene-unit-label">Temperature unit</span>
              <ToggleGroup
                type="single"
                value={unit}
                onValueChange={v => changeUnit(v as TemperatureUnit)}
                aria-labelledby="gene-unit-label"
              >
                <ToggleGroupItem value="C" aria-label="Celsius">°C</ToggleGroupItem>
                <ToggleGroupItem value="F" aria-label="Fahrenheit">°F</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">🎯 Target Temperature</Label>
              <div className="text-4xl font-bold font-mono text-center">
                {settings.targetTemp}°{unit}
              </div>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => adjustTargetTemp(-5)}>
                  -5°
                </Button>
                <Button variant="outline" onClick={() => adjustTargetTemp(5)}>
                  +5°
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="gene-current-temp" className="text-sm font-medium">
                🌡️ Current Temperature (°{unit})
              </Label>
              <Input
                id="gene-current-temp"
                type="number"
                value={settings.currentTemp}
                onChange={e => updateSettings({ currentTemp: e.target.value })}
                className="text-3xl font-bold font-mono text-center h-16"
                disabled={!canRecord}
                placeholder="0"
              />
              <Button className="w-full" onClick={recordTemperature} disabled={!canRecord}>
                📝 Record Temperature
              </Button>
              {readings > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  {readings} reading{readings !== 1 ? 's' : ''} recorded
                </p>
              )}
            </div>

            <Separator />

            <CrackEventButtons
              firstCrack={session.firstCrack}
              secondCrack={session.secondCrack}
              onRecord={type => session.recordCrack(type, temperaturesInCelsius())}
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
