import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Play, Pause, Square, RotateCcw, Flame, Wind } from "lucide-react";
import { TimerDisplay } from "@/components/roast/shared/TimerDisplay";
import { CrackEventButtons } from "@/components/roast/shared/CrackEventButtons";
import { BatchCapacityBadge } from "@/components/roast/shared/BatchCapacityBadge";
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

  // Check if current settings differ from last recorded
  const hasUnsavedChanges = () => {
    if (settingChanges.length === 0) return true;
    const lastChange = settingChanges[settingChanges.length - 1];
    return lastChange.heatLevel !== heatLevel || lastChange.fanSpeed !== fanSpeed;
  };

  // Add reset handler
  const handleReset = () => {
    setElapsedTime(0);
    setIsRunning(false);
    setIsPaused(false);
    setSettingChanges([]);
    setCrackEvents([]);
    setHasRecordedInitial(false);
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
                <h2 className="text-lg font-semibold">FreshRoast SR800</h2>
                <p className="text-sm text-muted-foreground">Heat/Fan Control Tracking</p>
              </div>
            </div>
            <BatchCapacityBadge 
              roasterType="freshroast-sr800"
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

            {/* Current Settings Display */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-center text-muted-foreground uppercase tracking-wide">
                Current Settings
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
            </div>
          </CardContent>
        </Card>
        
        {/* RIGHT COLUMN: Heat/Fan Controls & Tracking */}
        <Card>
          <CardContent className="p-6 space-y-4">
            
            {/* Heat Control */}
            <div>
              <HeatFanControls
                type="heat"
                value={heatLevel}
                onChange={handleHeatChange}
                label="HEAT LEVEL"
                icon={<Flame className="h-4 w-4" />}
              />
            </div>

            <Separator />

            {/* Fan Control */}
            <div>
              <HeatFanControls
                type="fan"
                value={fanSpeed}
                onChange={handleFanChange}
                label="FAN SPEED"
                icon={<Wind className="h-4 w-4" />}
              />
            </div>

            <Separator />

            {/* Record Change Button */}
            <Button
              onClick={handleRecordChange}
              className="w-full"
              disabled={!hasUnsavedChanges() || isPaused || !isRunning}
              variant={hasUnsavedChanges() ? "default" : "secondary"}
            >
              📝 Record Heat/Fan Change
            </Button>

            {/* Setting Change History */}
            {settingChanges.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium mb-3">📋 Change History</h3>
                  <SettingChangeHistory changes={settingChanges} maxDisplay={6} />
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
        roasterType="freshroast-sr800"
        defaultCollapsed={true}
      />
    </div>
  );
}
