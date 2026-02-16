import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TimerDisplay } from "@/components/roast/shared/TimerDisplay";
import { CrackEventButtons } from "@/components/roast/shared/CrackEventButtons";
import { RoasterTips } from "@/components/roast/shared/RoasterTips";
import { BatchSizeWarning } from "@/components/roast/popcorn/BatchSizeWarning";
import { VisualCueTracker, type VisualCue } from "@/components/roast/popcorn/VisualCueTracker";
import { Bell } from "lucide-react";
import type {
  PopcornPopperData,
  ManualTempDataPoint,
  CrackEvent
} from "@/types/roast-data.types";

interface PopcornPopperModeProps {
  onSave: (data: PopcornPopperData) => void;
  initialBatchSize?: number;
}

export function PopcornPopperMode({
  onSave,
  initialBatchSize = 75
}: PopcornPopperModeProps) {
  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Roast data
  const [batchSize, setBatchSize] = useState(initialBatchSize);
  const [currentTemp, setCurrentTemp] = useState<string>('');
  const [temperatureData, setTemperatureData] = useState<ManualTempDataPoint[]>([]);
  const [crackEvents, setCrackEvents] = useState<CrackEvent[]>([]);
  const [visualCues, setVisualCues] = useState<VisualCue[]>([]);
  const [showFirstCrackAlert, setShowFirstCrackAlert] = useState(false);
  const [machineModel, setMachineModel] = useState<string>('');

  // 3-minute alert flag
  const alertShownRef = useRef(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current - pausedTimeRef.current) / 1000);
        setElapsedTime(elapsed);

        // Show first crack alert at 3 minutes
        if (elapsed >= 180 && !alertShownRef.current) {
          setShowFirstCrackAlert(true);
          alertShownRef.current = true;
          playAlertBeep();
          
          // Auto-hide after 5 seconds
          setTimeout(() => {
            setShowFirstCrackAlert(false);
          }, 5000);
        }
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

  const playAlertBeep = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1000;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Audio alert not available');
    }
  };

  const handleRecordTemp = () => {
    const temp = parseFloat(currentTemp);
    if (isNaN(temp) || temp < 0 || temp > 300) {
      return;
    }

    const dataPoint: ManualTempDataPoint = {
      time: elapsedTime,
      temp,
      recordMethod: 'manual',
      timestamp: Date.now()
    };

    setTemperatureData(prev => [...prev, dataPoint]);
    setCurrentTemp('');
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
    // Validate batch size before allowing stop
    if (batchSize > 100) {
      alert('⚠️ Batch size exceeds safe maximum! This roast cannot be saved. Please reduce batch size for future roasts.');
      return;
    }

    if (batchSize === 0) {
      alert('⚠️ Please enter your batch size before saving.');
      return;
    }

    setIsRunning(false);
    setIsPaused(false);

    const roastData: PopcornPopperData = {
      mode: 'manual-simple',
      startTime: startTimeRef.current,
      endTime: Date.now(),
      temperatureData: temperatureData.length > 0 ? temperatureData : undefined,
      crackEvents,
      visualCues: visualCues.length > 0 ? visualCues : undefined,
      machineModel: machineModel.trim() || undefined
    };

    onSave(roastData);
  };

  const handleCrackEvent = (event: CrackEvent) => {
    setCrackEvents(prev => [...prev, event]);
  };

  const handleAddVisualCue = (cue: VisualCue) => {
    setVisualCues(prev => [...prev, cue]);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800">
        <CardContent className="p-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground mb-1">
              Popcorn Popper Mode ⚡
            </h2>
            <p className="text-sm text-muted-foreground">
              Ultra-Fast Roasts (4-6 min) • Safety First
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

      {/* 3-Minute Alert */}
      {showFirstCrackAlert && (
        <Alert className="border-2 border-orange-500 bg-orange-50 dark:bg-orange-950/20 animate-pulse">
          <Bell className="h-4 w-4 text-orange-600" />
          <AlertTitle className="font-bold text-orange-600">
            First Crack Alert!
          </AlertTitle>
          <AlertDescription className="text-sm text-orange-600 dark:text-orange-400">
            3 minutes elapsed - First crack typically occurs around this time. Listen closely!
          </AlertDescription>
        </Alert>
      )}

      {/* Batch Size Warning - CRITICAL */}
      <BatchSizeWarning
        batchSize={batchSize}
        onBatchSizeChange={setBatchSize}
        maxSize={100}
        disabled={isPaused}
      />

      {/* Machine Model (Optional) */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <Label htmlFor="machine-model" className="text-sm font-medium">
            Popcorn Popper Model (Optional)
          </Label>
          <Input
            id="machine-model"
            type="text"
            placeholder="e.g., West Bend Poppery, Presto PopLite"
            value={machineModel}
            onChange={(e) => setMachineModel(e.target.value)}
            disabled={isPaused}
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Track which model works best for your roasting style
          </p>
        </CardContent>
      </Card>

      {/* Current Temperature (Optional) */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="text-center">
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
              CURRENT TEMPERATURE (Optional)
            </h3>
            <div className="text-4xl font-bold text-primary font-mono mb-2">
              {currentTemp || '---'}°C
            </div>
            <p className="text-xs text-muted-foreground">
              If you have a thermometer
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="temp-input" className="text-sm font-medium">
              Temperature Reading (°C)
            </Label>
            <Input
              id="temp-input"
              type="number"
              placeholder="e.g., 185"
              value={currentTemp}
              onChange={(e) => setCurrentTemp(e.target.value)}
              disabled={isPaused}
              className="text-lg h-12 text-center font-mono"
              min="0"
              max="300"
              step="5"
            />
          </div>

          <Button
            onClick={handleRecordTemp}
            className="w-full"
            disabled={!currentTemp || isPaused}
            variant="outline"
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

      {/* Visual Cue Tracker */}
      <VisualCueTracker
        elapsedTime={elapsedTime}
        onAddCue={handleAddVisualCue}
        cues={visualCues}
        disabled={isPaused}
      />

      {/* Crack Events */}
      <CrackEventButtons
        elapsedTime={elapsedTime}
        onCrackEvent={handleCrackEvent}
        disabled={isPaused}
      />

      {/* Roast Progress Info */}
      {elapsedTime >= 240 && elapsedTime < 360 && (
        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
          <AlertDescription className="text-sm text-blue-600 dark:text-blue-400">
            ℹ️ Most popcorn popper roasts complete between 4-6 minutes. Watch and listen closely!
          </AlertDescription>
        </Alert>
      )}

      {/* Tips */}
      <RoasterTips roasterType="popcorn-popper" />

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

      {/* Bottom Safety Reminder */}
      <div className="p-4 rounded-lg bg-destructive/10 border-2 border-destructive text-center">
        <p className="text-sm font-bold text-destructive">
          ⚠️ SAFETY REMINDER
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Cool beans immediately after roasting. Never leave machine unattended.
          Roast outdoors or with excellent ventilation.
        </p>
      </div>
    </div>
  );
}
