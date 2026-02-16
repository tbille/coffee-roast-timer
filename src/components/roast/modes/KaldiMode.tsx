import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Play, Pause, Square, RotateCcw } from "lucide-react";
import { TimerDisplay } from "@/components/roast/shared/TimerDisplay";
import { CrackEventButtons } from "@/components/roast/shared/CrackEventButtons";
import { BatchCapacityBadge } from "@/components/roast/shared/BatchCapacityBadge";
import { RoasterTips } from "@/components/roast/shared/RoasterTips";
import { AutoRecordTimer } from "@/components/roast/kaldi/AutoRecordTimer";
import { EnvironmentalTracker } from "@/components/roast/kaldi/EnvironmentalTracker";
import { VoiceInput, type VoiceCommand } from "@/components/roast/kaldi/VoiceInput";
import type { 
  ManualRoastData,
  ManualTempDataPoint,
  CrackEvent,
  EnvironmentalData
} from "@/types/roast-data.types";

interface KaldiModeProps {
  onSave: (data: ManualRoastData) => void;
  initialBatchSize?: number;
}

export function KaldiMode({
  onSave,
  initialBatchSize = 250
}: KaldiModeProps) {
  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Roast data
  const [currentTemp, setCurrentTemp] = useState<string>('');
  const [temperatureData, setTemperatureData] = useState<ManualTempDataPoint[]>([]);
  const [crackEvents, setCrackEvents] = useState<CrackEvent[]>([]);
  const [batchSize, setBatchSize] = useState(initialBatchSize);
  const [environmental, setEnvironmental] = useState<Partial<EnvironmentalData>>({
    location: 'indoor'
  });

  // Auto-record state
  const [autoRecordEnabled, setAutoRecordEnabled] = useState(false);
  const [autoRecordInterval, setAutoRecordInterval] = useState(60); // seconds

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

  const handleRecordTemp = () => {
    const temp = parseFloat(currentTemp);
    if (isNaN(temp) || temp < 0 || temp > 300) {
      // Invalid temperature
      return;
    }

    const dataPoint: ManualTempDataPoint = {
      time: elapsedTime,
      temp,
      recordMethod: 'manual',
      timestamp: Date.now()
    };

    setTemperatureData(prev => [...prev, dataPoint]);
    // Clear input for next entry
    setCurrentTemp('');
  };

  const handleAutoRecordTrigger = () => {
    // Auto-record using current temperature
    const temp = parseFloat(currentTemp);
    if (!isNaN(temp) && temp >= 0 && temp <= 300) {
      const dataPoint: ManualTempDataPoint = {
        time: elapsedTime,
        temp,
        recordMethod: 'auto',
        timestamp: Date.now()
      };
      setTemperatureData(prev => [...prev, dataPoint]);
    }
  };

  const handleVoiceTemperature = (temp: number) => {
    // Update current temp display
    setCurrentTemp(temp.toString());
    
    // Record temperature with voice method
    const dataPoint: ManualTempDataPoint = {
      time: elapsedTime,
      temp,
      recordMethod: 'voice',
      timestamp: Date.now()
    };
    setTemperatureData(prev => [...prev, dataPoint]);
  };

  const handleVoiceCommand = (command: VoiceCommand) => {
    if (command === 'first-crack') {
      handleFirstCrack();
    } else if (command === 'second-crack') {
      handleSecondCrack();
    }
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

    const roastData: ManualRoastData = {
      mode: 'manual-simple',
      startTime: startTimeRef.current,
      endTime: Date.now(),
      temperatureData,
      crackEvents,
      environmental: environmental.location ? environmental as EnvironmentalData : undefined
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

  const lastRecordedData = temperatureData[temperatureData.length - 1];

  // Add reset handler
  const handleReset = () => {
    setElapsedTime(0);
    setIsRunning(false);
    setIsPaused(false);
    setCurrentTemp('');
    setTemperatureData([]);
    setCrackEvents([]);
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
                <h2 className="text-lg font-semibold">KALDI Wide</h2>
                <p className="text-sm text-muted-foreground">Manual Temperature Tracking</p>
              </div>
            </div>
            <BatchCapacityBadge 
              roasterType="kaldi-wide"
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

            {/* Current Temperature Display */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                🌡️ Current Temperature
              </Label>
              <div className="flex items-center justify-center">
                <div className="text-4xl font-bold font-mono text-primary">
                  {currentTemp || '---'}°C
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* RIGHT COLUMN: Temperature Tracking */}
        <Card>
          <CardContent className="p-6 space-y-4">
            
            {/* Voice Input */}
            <div>
              <VoiceInput
                onTemperature={handleVoiceTemperature}
                onCommand={handleVoiceCommand}
                disabled={isPaused || !isRunning}
              />
            </div>

            <Separator />

            {/* Temperature Input */}
            <div className="space-y-2">
              <Label htmlFor="temp-input" className="text-sm font-medium">
                Temperature Reading (°C)
              </Label>
              <Input
                id="temp-input"
                type="number"
                placeholder="192"
                value={currentTemp}
                onChange={(e) => setCurrentTemp(e.target.value)}
                disabled={isPaused || !isRunning}
                className="text-3xl font-bold font-mono text-center h-16"
                min="0"
                max="300"
                step="1"
              />
              <Button
                onClick={handleRecordTemp}
                className="w-full"
                disabled={!currentTemp || isPaused || !isRunning}
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

            {/* Auto-Record Timer */}
            <div>
              <h3 className="text-sm font-medium mb-3">⏱️ Auto-Record</h3>
              <AutoRecordTimer
                isEnabled={autoRecordEnabled}
                onToggle={setAutoRecordEnabled}
                interval={autoRecordInterval}
                onIntervalChange={setAutoRecordInterval}
                onTrigger={handleAutoRecordTrigger}
                lastRecordedTime={lastRecordedData?.time}
                lastRecordedTemp={lastRecordedData?.temp}
                isPaused={isPaused || !isRunning}
              />
            </div>

            <Separator />

            {/* Environmental Tracker */}
            <div>
              <h3 className="text-sm font-medium mb-3">🌤️ Environment</h3>
              <EnvironmentalTracker
                data={environmental}
                onChange={setEnvironmental}
              />
            </div>

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
        roasterType="kaldi-wide"
        defaultCollapsed={true}
      />
    </div>
  );
}
