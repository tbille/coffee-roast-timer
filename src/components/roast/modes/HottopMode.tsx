import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { TimerDisplay } from "@/components/roast/shared/TimerDisplay";
import { CrackEventButtons } from "@/components/roast/shared/CrackEventButtons";
import { BatchCapacityBadge } from "@/components/roast/shared/BatchCapacityBadge";
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

  const handleFirstCrack = () => {
    if (crackEvents.some(e => e.type === 'first')) return;
    
    const event: CrackEvent = {
      time: elapsedTime,
      type: 'first',
      timestamp: Date.now()
    };
    setCrackEvents(prev => [...prev, event]);
  };

  const handleSecondCrack = () => {
    if (crackEvents.some(e => e.type === 'second')) return;
    if (!crackEvents.some(e => e.type === 'first')) return;
    
    const event: CrackEvent = {
      time: elapsedTime,
      type: 'second',
      timestamp: Date.now()
    };
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

  // Add reset handler
  const handleReset = () => {
    setElapsedTime(0);
    setIsRunning(false);
    setIsPaused(false);
    setBeanTemp('');
    setEnvironmentalTemp('');
    setTemperatureData([]);
    setCrackEvents([]);
    setManualControls([]);
    setHasRecordedInitialControl(false);
    startTimeRef.current = 0;
    pausedTimeRef.current = 0;
  };

  return (
    <div className="space-y-4">
      {/* Roaster Header */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl">☕</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Hottop KN-8828B-2K+</h2>
                <p className="text-sm text-muted-foreground">Advanced Temperature Tracking</p>
              </div>
            </div>
            <BatchCapacityBadge 
              roasterType="hottop-kn8828"
              currentWeight={batchSize}
            />
          </div>
        </CardContent>
      </Card>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        
        {/* LEFT COLUMN: Timer & Controls */}
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Timer */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground text-center uppercase tracking-wide">
                Roast Timer
              </h3>
              <TimerDisplay 
                seconds={elapsedTime} 
                mode="count-up" 
                size="large"
              />
            </div>
            
            {/* Control buttons */}
            <div className="space-y-2">
              <div className="flex gap-2">
                {!isRunning ? (
                  <Button 
                    onClick={() => {
                      startTimeRef.current = Date.now();
                      setIsRunning(true);
                    }} 
                    size="lg"
                    className="flex items-center gap-2 flex-1"
                  >
                    <Play className="h-5 w-5" />
                    Start Roast
                  </Button>
                ) : (
                  <>
                    {!isPaused ? (
                      <Button 
                        onClick={handlePause} 
                        variant="secondary"
                        size="lg"
                        className="flex items-center gap-2 flex-1"
                      >
                        <Pause className="h-5 w-5" />
                        Pause
                      </Button>
                    ) : (
                      <Button 
                        onClick={handlePause} 
                        variant="default"
                        size="lg"
                        className="flex items-center gap-2 flex-1"
                      >
                        <Play className="h-5 w-5" />
                        Resume
                      </Button>
                    )}
                    <Button 
                      onClick={handleStop} 
                      variant="destructive"
                      size="lg"
                      className="flex items-center gap-2"
                    >
                      <Square className="h-5 w-5" />
                      Stop
                    </Button>
                  </>
                )}
              </div>
              
              {!isRunning && elapsedTime > 0 && (
                <Button 
                  onClick={handleReset} 
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>

            <Separator />

            {/* Roast Mode Selection */}
            <div className="space-y-3">
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
                      ☀️ Auto Light
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted">
                    <RadioGroupItem value="auto-medium" id="auto-medium" />
                    <Label htmlFor="auto-medium" className="font-normal cursor-pointer flex-1">
                      🌤️ Auto Medium
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted">
                    <RadioGroupItem value="auto-dark" id="auto-dark" />
                    <Label htmlFor="auto-dark" className="font-normal cursor-pointer flex-1">
                      🌑 Auto Dark
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted">
                    <RadioGroupItem value="manual" id="manual" />
                    <Label htmlFor="manual" className="font-normal cursor-pointer flex-1">
                      🎛️ Manual
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
        
        {/* RIGHT COLUMN: Temperature & Tracking */}
        <Card>
          <CardContent className="p-6 space-y-4">
            
            {/* Bean Temperature Display */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                🌡️ Bean Temperature
              </Label>
              <div className="flex items-center justify-center">
                <div className="text-4xl font-bold font-mono text-orange-600 dark:text-orange-400">
                  {lastTempData?.beanTemp.toFixed(0) || '---'}°C
                </div>
              </div>
            </div>

            <Separator />

            {/* Temperature Input */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="bean-temp" className="text-sm font-medium">
                    Bean Temp (°C) *
                  </Label>
                  <Input
                    id="bean-temp"
                    type="number"
                    placeholder="205"
                    value={beanTemp}
                    onChange={(e) => setBeanTemp(e.target.value)}
                    disabled={isPaused || !isRunning}
                    className="text-2xl font-bold font-mono text-center h-14"
                    min="0"
                    max="300"
                    step="1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="env-temp" className="text-sm font-medium">
                    Env Temp (°C)
                  </Label>
                  <Input
                    id="env-temp"
                    type="number"
                    placeholder="24"
                    value={environmentalTemp}
                    onChange={(e) => setEnvironmentalTemp(e.target.value)}
                    disabled={isPaused || !isRunning}
                    className="text-2xl font-bold font-mono text-center h-14"
                    min="0"
                    max="100"
                    step="1"
                  />
                </div>
              </div>

              <Button
                onClick={handleRecordTemp}
                className="w-full"
                size="default"
                disabled={!beanTemp || isPaused || !isRunning}
              >
                📝 Record Temperature
              </Button>

              {temperatureData.length > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  {temperatureData.length} reading{temperatureData.length !== 1 ? 's' : ''} recorded
                </p>
              )}
            </div>

            <Separator />

            {/* Advanced Metrics */}
            <div>
              <h3 className="text-sm font-medium mb-3">📊 Advanced Metrics</h3>
              <AdvancedMetrics data={advancedMetrics} />
            </div>

            {/* Manual Controls (only in manual mode) */}
            {roastMode === 'manual' && (
              <>
                <Separator />
                <div>
                  <ManualControlSliders
                    heatPercent={heatPercent}
                    fanPercent={fanPercent}
                    onHeatChange={setHeatPercent}
                    onFanChange={setFanPercent}
                    onRecordChange={handleRecordManualControl}
                    disabled={isPaused || !isRunning}
                    hasUnsavedChanges={hasUnsavedControlChanges()}
                  />
                </div>
              </>
            )}

            <Separator />

            {/* Crack Events */}
            <div>
              <h3 className="text-sm font-medium mb-3">🔊 Crack Events</h3>
              <CrackEventButtons
                onFirstCrack={handleFirstCrack}
                onSecondCrack={handleSecondCrack}
                firstCrackRecorded={crackEvents.some(e => e.type === 'first')}
                secondCrackRecorded={crackEvents.some(e => e.type === 'second')}
                disabled={isPaused || !isRunning}
                variant="inline"
              />
            </div>
            
          </CardContent>
        </Card>
        
      </div>
      
      {/* Tips - Collapsible */}
      <RoasterTips
        roasterType="hottop-kn8828"
        defaultCollapsed={true}
      />
    </div>
  );
}
