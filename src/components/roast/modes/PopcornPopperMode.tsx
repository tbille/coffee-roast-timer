import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Play, Pause, Square, RotateCcw, Bell } from "lucide-react";
import { TimerDisplay } from "@/components/roast/shared/TimerDisplay";
import { CrackEventButtons } from "@/components/roast/shared/CrackEventButtons";
import { BatchCapacityBadge } from "@/components/roast/shared/BatchCapacityBadge";
import { RoasterTips } from "@/components/roast/shared/RoasterTips";
import { BatchSizeWarning } from "@/components/roast/popcorn/BatchSizeWarning";
import { VisualCueTracker, type VisualCue } from "@/components/roast/popcorn/VisualCueTracker";
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

  const handleAddVisualCue = (cue: VisualCue) => {
    setVisualCues(prev => [...prev, cue]);
  };

  // Add reset handler
  const handleReset = () => {
    setElapsedTime(0);
    setIsRunning(false);
    setIsPaused(false);
    setCurrentTemp('');
    setTemperatureData([]);
    setCrackEvents([]);
    setVisualCues([]);
    setShowFirstCrackAlert(false);
    alertShownRef.current = false;
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
                <h2 className="text-lg font-semibold">Popcorn Popper</h2>
                <p className="text-sm text-muted-foreground">Ultra-Fast Roasting (4-6 min)</p>
              </div>
            </div>
            <BatchCapacityBadge 
              roasterType="popcorn-popper"
              currentWeight={batchSize}
            />
          </div>
        </CardContent>
      </Card>

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

            {/* Batch Size Warning - CRITICAL */}
            <div>
              <BatchSizeWarning
                batchSize={batchSize}
                onBatchSizeChange={setBatchSize}
                maxSize={100}
                disabled={isPaused || isRunning}
              />
            </div>

            {/* Roast Progress Info */}
            {elapsedTime >= 240 && elapsedTime < 360 && (
              <>
                <Separator />
                <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                  <AlertDescription className="text-sm text-blue-600 dark:text-blue-400">
                    ℹ️ Most roasts complete in 4-6 minutes
                  </AlertDescription>
                </Alert>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* RIGHT COLUMN: Tracking */}
        <Card>
          <CardContent className="p-6 space-y-4">
            
            {/* Machine Model (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="machine-model" className="text-sm font-medium">
                Popcorn Popper Model (Optional)
              </Label>
              <Input
                id="machine-model"
                type="text"
                placeholder="West Bend Poppery, Presto PopLite"
                value={machineModel}
                onChange={(e) => setMachineModel(e.target.value)}
                disabled={isPaused || isRunning}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Track which model works best
              </p>
            </div>

            <Separator />

            {/* Temperature (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="temp-input" className="text-sm font-medium">
                🌡️ Temperature (Optional)
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                If you have a thermometer
              </p>
              <Input
                id="temp-input"
                type="number"
                placeholder="185"
                value={currentTemp}
                onChange={(e) => setCurrentTemp(e.target.value)}
                disabled={isPaused || !isRunning}
                className="text-2xl font-bold font-mono text-center h-14"
                min="0"
                max="300"
                step="5"
              />
              <Button
                onClick={handleRecordTemp}
                className="w-full"
                disabled={!currentTemp || isPaused || !isRunning}
                variant="outline"
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

            {/* Visual Cue Tracker */}
            <div>
              <h3 className="text-sm font-medium mb-3">👁️ Visual Cues</h3>
              <VisualCueTracker
                elapsedTime={elapsedTime}
                onAddCue={handleAddVisualCue}
                cues={visualCues}
                disabled={isPaused || !isRunning}
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

      {/* Safety Reminder */}
      <div className="p-4 rounded-lg bg-destructive/10 border-2 border-destructive text-center">
        <p className="text-sm font-bold text-destructive">
          ⚠️ SAFETY REMINDER
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Cool beans immediately after roasting. Never leave machine unattended.
          Roast outdoors or with excellent ventilation.
        </p>
      </div>
      
      {/* Tips - Collapsible */}
      <RoasterTips
        roasterType="popcorn-popper"
        defaultCollapsed={true}
      />
    </div>
  );
}
