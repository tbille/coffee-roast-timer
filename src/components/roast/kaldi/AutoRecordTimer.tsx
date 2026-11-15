import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Bell } from "lucide-react";

interface AutoRecordTimerProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  interval: number; // seconds
  onIntervalChange: (interval: number) => void;
  onTrigger: () => void;
  lastRecordedTime?: number;
  lastRecordedTemp?: number;
  isPaused: boolean;
}

export const AutoRecordTimer = ({
  isEnabled,
  onToggle,
  interval,
  onIntervalChange,
  onTrigger,
  lastRecordedTime,
  lastRecordedTemp,
  isPaused
}: AutoRecordTimerProps) => {
  const [secondsUntilNext, setSecondsUntilNext] = useState(interval);
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastTriggerRef = useRef<number>(Date.now());
  // Keep the latest callback without restarting the countdown on every parent render
  const onTriggerRef = useRef(onTrigger);
  onTriggerRef.current = onTrigger;

  useEffect(() => {
    if (isEnabled && !isPaused) {
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - lastTriggerRef.current) / 1000);
        const remaining = interval - elapsed;
        
        if (remaining <= 0) {
          // Trigger recording
          onTriggerRef.current();
          lastTriggerRef.current = Date.now();
          setSecondsUntilNext(interval);
          
          // Optional: Play audio beep
          playBeep();
        } else {
          setSecondsUntilNext(remaining);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isEnabled, isPaused, interval]);

  // Reset timer when interval changes
  useEffect(() => {
    lastTriggerRef.current = Date.now();
    setSecondsUntilNext(interval);
  }, [interval]);

  const playBeep = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Silently fail if audio not supported
      console.log('Audio beep not available');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Auto-Recording Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-record" className="text-sm font-medium">
            Auto-Record
          </Label>
          <Switch
            id="auto-record"
            checked={isEnabled}
            onCheckedChange={onToggle}
            disabled={isPaused}
          />
        </div>

        {/* Interval Selector */}
        <div className="space-y-2">
          <Label htmlFor="interval" className="text-sm font-medium">
            Record Every:
          </Label>
          <Select
            value={interval.toString()}
            onValueChange={(val) => onIntervalChange(parseInt(val))}
            disabled={!isEnabled || isPaused}
          >
            <SelectTrigger id="interval">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 seconds</SelectItem>
              <SelectItem value="60">60 seconds</SelectItem>
              <SelectItem value="90">90 seconds</SelectItem>
              <SelectItem value="120">2 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Display */}
        {isEnabled && !isPaused && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                Next recording in:
              </span>
              <div className="flex items-center gap-1">
                <Bell className="h-3 w-3 text-emerald-600" />
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatTime(secondsUntilNext)}
                </span>
              </div>
            </div>
            
            {lastRecordedTime !== undefined && lastRecordedTemp !== undefined && (
              <div className="text-xs text-muted-foreground">
                Last recorded: <span className="font-medium">{lastRecordedTemp}°C</span> at{' '}
                <span className="font-medium">{formatTime(lastRecordedTime)}</span>
              </div>
            )}
          </div>
        )}

        {isPaused && (
          <div className="p-3 rounded-lg bg-muted text-center">
            <p className="text-xs text-muted-foreground">
              Auto-record paused
            </p>
          </div>
        )}

        {/* Helper Text */}
        {!isEnabled && (
          <p className="text-xs text-muted-foreground">
            Enable auto-record for hands-free temperature logging while you crank
          </p>
        )}
      </CardContent>
    </Card>
  );
};
