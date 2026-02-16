import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TimerDisplay } from "@/components/roast/shared/TimerDisplay";
import { CrackEventButtons } from "@/components/roast/shared/CrackEventButtons";
import { BatchCapacityIndicator } from "@/components/roast/shared/BatchCapacityIndicator";
import { RoasterTips } from "@/components/roast/shared/RoasterTips";
import { ManualControlSliders, type ManualControl } from "@/components/roast/hottop/ManualControlSliders";
import { AdvancedMetrics, calculateRoR, type AdvancedMetricsData } from "@/components/roast/hottop/AdvancedMetrics";
import type {
  HottopRoastData,
  HottopMode as HottopModeType,
  HottopTempDataPoint,
  HottopManualControl,
  CrackEvent
} from "@/types/roast-data.types";

interface HottopModeProps {
  onSave: (data: HottopRoastData) => void;
  initialBatchSize?: number;
}

export function HottopMode({
  onSave,
  initialBatchSize = 250
}: HottopModeProps) {
  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Roast mode
  const [roastMode, setRoastMode] = useState<HottopModeType>('manual');
  
  // Roast data
  const [batchSize, setBatchSize] = useState(initialBatchSize);
  const [beanTemp, setBeanTemp] = useState<string>('');
  const [environmentalTemp, setEnvironmentalTemp] = useState<string>('');
  const [temperatureData, setTemperatureData] = useState<HottopTempDataPoint[]>([]);
  const [crackEvents, setCrackEvents] = useState<CrackEvent[]>([]);
  
  // Manual controls (only for manual mode)
  const [heatPercent, setHeatPercent] = useState(50);
  const [fanPercent, setFanPercent] = useState(50);
  const [manualControls, setManualControls] = useState<HottopManualControl[]>([]);
  const [hasRecordedInitialControl, setHasRecordedInitialControl] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current - pausedTimeRef.current) / 1000);
        setElapsedTime(elapsed);
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isPaused]);

  // Start roast automatically
  useEffect(() => {
    if (!isRunning) {
      startTimeRef.current = Date.now();
      setIsRunning(true);
    }
  }, []);

  // Record initial manual control settings
  useEffect(() => {
    if (roastMode === 'manual' && elapsedTime > 0 && !hasRecordedInitialControl) {
      const initialControl: HottopManualControl = {
        time: 0,
        heatPercent,
        fanPercent,
        timestamp: Date.now()
      };
      setManualControls([initialControl]);
      setHasRecordedInitialControl(true);
    }
  }, [roastMode, elapsedTime, hasRecordedInitialControl, heatPercent, fanPercent]);

  const handleRecordTemp = () => {
    const temp = parseFloat(beanTemp);
    if (isNaN(temp) || temp < 0 || temp > 300) {
      return;
    }

    const envTemp = parseFloat(environmentalTemp);
    const previousData = temperatureData[temperatureData.length - 1];
    
    // Calculate RoR if we have previous data
    let ror: number | undefined;
    if (previousData) {
      const timeInterval = elapsedTime - previousData.time;
      ror = calculateRoR(temp, previousData.beanTemp, timeInterval);
    }

    const dataPoint: HottopTempDataPoint = {
      time: elapsedTime,
      beanTemp: temp,
      environmentalTemp: !isNaN(envTemp) ? envTemp : undefined,
      rateOfRise: ror,
      timestamp: Date.now()
    };

    setTemperatureData(prev => [...prev, dataPoint]);
    setBeanTemp('');
  };

  const handleRecordManualControl = () => {
    const control: HottopManualControl = {
      time: elapsedTime,
      heatPercent,
      fanPercent,
      timestamp: Date.now()
    };
    
    setManualControls(prev => [...prev, control]);
  };

  const handlePause = () => {
    if (isPaused) {
      // Resume
      pausedTimeRef.current += Date.now() - (startTimeRef.current + elapsedTime * 1000);
      setIsPaused(false);
    } else {
      // Pause
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);

    const roastData: HottopRoastData = {
      mode: 'hottop-advanced',
      roastMode,
      startTime: startTimeRef.current,
      endTime: Date.now(),
      temperatureData,
      manualControls: roastMode === 'manual' ? manualControls : undefined,
      crackEvents
    };

    onSave(roastData);
  };

  const handleCrackEvent = (event: CrackEvent) => {
    setCrackEvents(prev => [...prev, event]);
  };

  // Check if manual controls have unsaved changes
  const hasUnsavedControlChanges = () => {
    if (manualControls.length === 0) return true;
    const lastControl = manualControls[manualControls.length - 1];
    return lastControl.heatPercent !== heatPercent || lastControl.fanPercent !== fanPercent;
  };

  // Calculate advanced metrics for display
  const lastTempData = temperatureData[temperatureData.length - 1];
  const previousTempData = temperatureData[temperatureData.length - 2];
  
  const advancedMetrics: AdvancedMetricsData = {
    rateOfRise: lastTempData?.rateOfRise,
    tempDelta: lastTempData && previousTempData 
      ? lastTempData.beanTemp - previousTempData.beanTemp 
      : undefined,
    environmentalTemp: lastTempData?.environmentalTemp,
    beanTemp: lastTempData?.beanTemp,
    timeElapsed: elapsedTime
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
        <CardContent className="p-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground mb-1">
              Hottop KN-8828B-2K+ Mode
            </h2>
            <p className="text-sm text-muted-foreground">
              Premium Roaster • Advanced Metrics • Artisan Compatible
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Roast Mode Selection */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <Label className="text-sm font-medium">Roast Mode</Label>
          <RadioGroup
            value={roastMode}
            onValueChange={(value) => setRoastMode(value as HottopModeType)}
            disabled={isPaused}
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted">
                <RadioGroupItem value="auto-light" id="auto-light" />
                <Label htmlFor="auto-light" className="font-normal cursor-pointer flex-1">
                  ☀️ Automatic Light
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted">
                <RadioGroupItem value="auto-medium" id="auto-medium" />
                <Label htmlFor="auto-medium" className="font-normal cursor-pointer flex-1">
                  🌤️ Automatic Medium
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted">
                <RadioGroupItem value="auto-dark" id="auto-dark" />
                <Label htmlFor="auto-dark" className="font-normal cursor-pointer flex-1">
                  🌑 Automatic Dark
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual" className="font-normal cursor-pointer flex-1">
                  🎛️ Manual Mode (full control)
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Timer */}
      <TimerDisplay 
        time={elapsedTime}
        mode="count-up"
        label="TIME ELAPSED"
      />

      {/* Bean Temperature */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-center mb-4 text-muted-foreground">
            BEAN TEMPERATURE
          </h3>
          <div className="text-center space-y-2">
            <div className="text-5xl font-bold text-orange-600 dark:text-orange-400 font-mono">
              {lastTempData?.beanTemp.toFixed(0) || '---'}°C
            </div>
            <p className="text-xs text-muted-foreground">
              Current bean temperature
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Temperature Input */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bean-temp" className="text-sm font-medium">
                Bean Temp (°C) *
              </Label>
              <Input
                id="bean-temp"
                type="number"
                placeholder="e.g., 205"
                value={beanTemp}
                onChange={(e) => setBeanTemp(e.target.value)}
                disabled={isPaused}
                className="text-lg h-12 text-center font-mono"
                min="0"
                max="300"
                step="1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="env-temp" className="text-sm font-medium">
                Environmental Temp (°C)
              </Label>
              <Input
                id="env-temp"
                type="number"
                placeholder="e.g., 24"
                value={environmentalTemp}
                onChange={(e) => setEnvironmentalTemp(e.target.value)}
                disabled={isPaused}
                className="text-lg h-12 text-center font-mono"
                min="0"
                max="100"
                step="1"
              />
            </div>
          </div>

          <Button
            onClick={handleRecordTemp}
            className="w-full h-12 text-base font-semibold"
            disabled={!beanTemp || isPaused}
            size="lg"
          >
            📝 Record Temperature
          </Button>

          {temperatureData.length > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              {temperatureData.length} reading{temperatureData.length !== 1 ? 's' : ''} recorded
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Metrics */}
      <AdvancedMetrics data={advancedMetrics} />

      {/* Manual Controls (only in manual mode) */}
      {roastMode === 'manual' && (
        <ManualControlSliders
          heatPercent={heatPercent}
          fanPercent={fanPercent}
          onHeatChange={setHeatPercent}
          onFanChange={setFanPercent}
          onRecordChange={handleRecordManualControl}
          disabled={isPaused}
          hasUnsavedChanges={hasUnsavedControlChanges()}
        />
      )}

      {/* Crack Events */}
      <CrackEventButtons
        elapsedTime={elapsedTime}
        onCrackEvent={handleCrackEvent}
        disabled={isPaused}
      />

      {/* Batch Capacity */}
      {batchSize && (
        <BatchCapacityIndicator
          batchSize={batchSize}
          roasterType="hottop-kn8828"
        />
      )}

      {/* Tips */}
      <RoasterTips roasterType="hottop-kn8828" />

      {/* Control Buttons */}
      <div className="flex gap-4 pt-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePause}
          className="flex-1"
        >
          {isPaused ? '▶️ Resume' : '⏸️ Pause'}
        </Button>
        <Button
          variant="destructive"
          size="lg"
          onClick={handleStop}
          className="flex-1"
        >
          ⏹️ Stop & Save
        </Button>
      </div>
    </div>
  );
}
