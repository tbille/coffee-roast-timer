import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Wind } from "lucide-react";
import { TimerDisplay } from "@/components/roast/shared/TimerDisplay";
import { CrackEventButtons } from "@/components/roast/shared/CrackEventButtons";
import { BatchCapacityIndicator } from "@/components/roast/shared/BatchCapacityIndicator";
import { RoasterTips } from "@/components/roast/shared/RoasterTips";
import { HeatFanControls } from "@/components/roast/freshroast/HeatFanControls";
import { SettingChangeHistory } from "@/components/roast/shared/SettingChangeHistory";
import type { 
  HeatLevel, 
  FanSpeed, 
  SettingChange, 
  CrackEvent,
  HeatFanRoastData 
} from "@/types/roast-data.types";

interface FreshRoastModeProps {
  onSave: (data: HeatFanRoastData) => void;
  initialBatchSize?: number;
}

export function FreshRoastMode({
  onSave,
  initialBatchSize = 120
}: FreshRoastModeProps) {
  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Roast settings
  const [heatLevel, setHeatLevel] = useState<HeatLevel>('Medium');
  const [fanSpeed, setFanSpeed] = useState<FanSpeed>('Medium');
  const [settingChanges, setSettingChanges] = useState<SettingChange[]>([]);
  const [crackEvents, setCrackEvents] = useState<CrackEvent[]>([]);
  const [batchSize, setBatchSize] = useState(initialBatchSize);
  const [hasRecordedInitial, setHasRecordedInitial] = useState(false);

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

  // Record initial settings when roast starts
  useEffect(() => {
    if (elapsedTime > 0 && !hasRecordedInitial) {
      const initialChange: SettingChange = {
        time: 0,
        heatLevel,
        fanSpeed,
        timestamp: Date.now()
      };
      setSettingChanges([initialChange]);
      setHasRecordedInitial(true);
    }
  }, [elapsedTime, hasRecordedInitial, heatLevel, fanSpeed]);

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

    const roastData: HeatFanRoastData = {
      mode: 'heat-fan-control',
      startTime: startTimeRef.current,
      endTime: Date.now(),
      settingChanges,
      crackEvents
    };

    onSave(roastData);
  };

  const handleRecordChange = () => {
    const change: SettingChange = {
      time: elapsedTime,
      heatLevel,
      fanSpeed,
      timestamp: Date.now()
    };
    
    setSettingChanges(prev => [...prev, change]);
  };

  const handleHeatChange = (newHeat: HeatLevel | FanSpeed) => {
    setHeatLevel(newHeat as HeatLevel);
  };

  const handleFanChange = (newFan: HeatLevel | FanSpeed) => {
    setFanSpeed(newFan as FanSpeed);
  };

  const handleCrackEvent = (event: CrackEvent) => {
    setCrackEvents(prev => [...prev, event]);
  };

  // Check if current settings differ from last recorded
  const hasUnsavedChanges = () => {
    if (settingChanges.length === 0) return true;
    const lastChange = settingChanges[settingChanges.length - 1];
    return lastChange.heatLevel !== heatLevel || lastChange.fanSpeed !== fanSpeed;
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <CardContent className="p-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground mb-1">
              FreshRoast SR800 Mode
            </h2>
            <p className="text-sm text-muted-foreground">
              Heat/Fan Control Tracking • Fast Roasts (6-10 min)
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

      {/* Current Settings Display */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-center mb-4 text-muted-foreground">
            CURRENT SETTINGS
          </h3>
          <div className="flex justify-center items-center gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-xs font-medium text-muted-foreground">HEAT</span>
              </div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {heatLevel}
              </div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Wind className="h-5 w-5 text-cyan-500" />
                <span className="text-xs font-medium text-muted-foreground">FAN</span>
              </div>
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                {fanSpeed}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Heat Control */}
      <HeatFanControls
        type="heat"
        value={heatLevel}
        onChange={handleHeatChange}
        label="HEAT LEVEL"
        icon={<Flame className="h-4 w-4" />}
      />

      {/* Fan Control */}
      <HeatFanControls
        type="fan"
        value={fanSpeed}
        onChange={handleFanChange}
        label="FAN SPEED"
        icon={<Wind className="h-4 w-4" />}
      />

      {/* Record Change Button */}
      <Button
        onClick={handleRecordChange}
        className="w-full h-14 text-lg font-semibold"
        disabled={!hasUnsavedChanges() || isPaused}
        variant={hasUnsavedChanges() ? "default" : "secondary"}
      >
        📝 Record Heat/Fan Change
      </Button>

      {/* Setting Change History */}
      <SettingChangeHistory changes={settingChanges} maxDisplay={8} />

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
          roasterType="freshroast-sr800"
        />
      )}

      {/* Tips */}
      <RoasterTips roasterType="freshroast-sr800" />

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
