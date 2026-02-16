import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Thermometer } from "lucide-react";
import { TimerDisplay } from "@/components/roast/shared/TimerDisplay";
import { CrackEventButtons } from "@/components/roast/shared/CrackEventButtons";
import { BatchCapacityIndicator } from "@/components/roast/shared/BatchCapacityIndicator";
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

  // Start roast automatically
  useEffect(() => {
    if (!isRunning) {
      startTimeRef.current = Date.now();
      setIsRunning(true);
    }
  }, []);

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
      handleCrackEvent({
        type: 'first',
        time: elapsedTime,
        timestamp: Date.now()
      });
    } else if (command === 'second-crack') {
      handleCrackEvent({
        type: 'second',
        time: elapsedTime,
        timestamp: Date.now()
      });
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

  const handleCrackEvent = (event: CrackEvent) => {
    setCrackEvents(prev => [...prev, event]);
  };

  const lastRecordedData = temperatureData[temperatureData.length - 1];

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200 dark:border-emerald-800">
        <CardContent className="p-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground mb-1">
              KALDI Wide Mode
            </h2>
            <p className="text-sm text-muted-foreground">
              Hands-Free Temperature Tracking • Manual Roasting
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Timer */}
      <TimerDisplay 
        time={elapsedTime}
        mode="count-up"
        label="TIME ELAPSED"
      />

      {/* Current Temperature Display */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-center mb-4 text-muted-foreground">
            CURRENT TEMPERATURE
          </h3>
          <div className="text-center space-y-4">
            <div className="text-5xl font-bold text-primary font-mono">
              {currentTemp || '---'}°C
            </div>
            <p className="text-xs text-muted-foreground">
              Enter manually or use auto-record
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Voice Input */}
      <VoiceInput
        onTemperature={handleVoiceTemperature}
        onCommand={handleVoiceCommand}
        disabled={isPaused}
      />

      {/* Temperature Input */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="temp-input" className="text-sm font-medium">
              Temperature Reading (°C)
            </Label>
            <div className="flex gap-2">
              <Input
                id="temp-input"
                type="number"
                placeholder="e.g., 192"
                value={currentTemp}
                onChange={(e) => setCurrentTemp(e.target.value)}
                disabled={isPaused}
                className="text-lg h-14 text-center font-mono"
                min="0"
                max="300"
                step="1"
              />
            </div>
          </div>

          <Button
            onClick={handleRecordTemp}
            className="w-full h-14 text-lg font-semibold"
            disabled={!currentTemp || isPaused}
            size="lg"
          >
            📝 Record Temperature
          </Button>

          {temperatureData.length > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              {temperatureData.length} temperature reading{temperatureData.length !== 1 ? 's' : ''} recorded
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto-Record Timer */}
      <AutoRecordTimer
        isEnabled={autoRecordEnabled}
        onToggle={setAutoRecordEnabled}
        interval={autoRecordInterval}
        onIntervalChange={setAutoRecordInterval}
        onTrigger={handleAutoRecordTrigger}
        lastRecordedTime={lastRecordedData?.time}
        lastRecordedTemp={lastRecordedData?.temp}
        isPaused={isPaused}
      />

      {/* Environmental Tracker */}
      <EnvironmentalTracker
        data={environmental}
        onChange={setEnvironmental}
      />

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
          roasterType="kaldi-wide"
        />
      )}

      {/* Tips */}
      <RoasterTips roasterType="kaldi-wide" />

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
