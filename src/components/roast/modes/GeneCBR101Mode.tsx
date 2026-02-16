/**
 * GeneCBR101Mode Component
 * Extracted dual-temperature tracking mode for Gene Cafe CBR-101
 * Maintains backward compatibility with existing roasting logic
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { TimerDisplay } from '../shared/TimerDisplay';
import { CrackEventButtons } from '../shared/CrackEventButtons';
import { DevelopmentStats } from '../shared/DevelopmentStats';
import { BatchCapacityIndicator } from '../shared/BatchCapacityIndicator';
import { BatchCapacityBadge } from '../shared/BatchCapacityBadge';
import { RoasterTips } from '../shared/RoasterTips';
import type { DualTempRoastData, TemperatureDataPoint, CrackEvent } from '@/types/roast-data.types';
import { convertTemperature, type TemperatureUnit } from '@/utils/temperatureConversion';

interface GeneCBR101ModeProps {
  onSave: (data: DualTempRoastData) => void;
  initialBatchSize?: number;
  temperatureUnit?: TemperatureUnit;
  onTemperatureUnitChange?: (unit: TemperatureUnit) => void;
}

const STORAGE_KEY = 'gene_cbr101_roast_state';

export function GeneCBR101Mode({
  onSave,
  initialBatchSize = 225,
  temperatureUnit = 'C',
  onTemperatureUnitChange
}: GeneCBR101ModeProps) {
  // Roast state
  const [isRoasting, setIsRoasting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  // Temperature state
  const [targetTemp, setTargetTemp] = useState<string>('200');
  const [currentTemp, setCurrentTemp] = useState<string>('20');
  const [temperatureData, setTemperatureData] = useState<TemperatureDataPoint[]>([]);
  
  // Crack events
  const [crackEvents, setCrackEvents] = useState<CrackEvent[]>([]);
  
  // Batch size (can be updated before start)
  const [batchSize] = useState(initialBatchSize);
  
  /**
   * Timer effect - runs every second when roasting
   */
  useEffect(() => {
    if (!isRoasting || isPaused) return;
    
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRoasting, isPaused]);
  
  /**
   * Persist state to localStorage for crash recovery
   */
  useEffect(() => {
    if (isRoasting || elapsedSeconds > 0 || temperatureData.length > 0) {
      const state = {
        isRoasting: false, // Never persist running state for safety
        isPaused,
        elapsedSeconds,
        startTime,
        targetTemp,
        currentTemp,
        temperatureData,
        crackEvents,
        batchSize,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [isRoasting, isPaused, elapsedSeconds, startTime, targetTemp, currentTemp, temperatureData, crackEvents, batchSize]);
  
  /**
   * Load persisted state on mount (crash recovery)
   */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        // Only restore if less than 24 hours old
        if (Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
          setElapsedSeconds(state.elapsedSeconds || 0);
          setStartTime(state.startTime);
          setTargetTemp(state.targetTemp || '200');
          setCurrentTemp(state.currentTemp || '20');
          setTemperatureData(state.temperatureData || []);
          setCrackEvents(state.crackEvents || []);
          // Never auto-resume roasting for safety
        } else {
          // Clear old state
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }, []);
  
  /**
   * Start roast
   */
  const handleStart = useCallback(() => {
    const now = Date.now();
    setStartTime(now);
    setElapsedSeconds(0);
    setTemperatureData([]);
    setCrackEvents([]);
    setIsRoasting(true);
    setIsPaused(false);
  }, []);
  
  /**
   * Pause roast
   */
  const handlePause = useCallback(() => {
    setIsPaused(true);
  }, []);
  
  /**
   * Resume roast
   */
  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, []);
  
  /**
   * Stop roast and prepare to save
   */
  const handleStop = useCallback(() => {
    setIsRoasting(false);
    setIsPaused(false);
    
    // Prepare roast data for saving
    const roastData: DualTempRoastData = {
      mode: 'dual-temperature',
      startTime: startTime || Date.now() - (elapsedSeconds * 1000),
      endTime: Date.now(),
      temperatureData,
      crackEvents
    };
    
    // Call parent save handler
    onSave(roastData);
    
    // Clear localStorage after successful stop
    localStorage.removeItem(STORAGE_KEY);
  }, [startTime, elapsedSeconds, temperatureData, crackEvents, onSave]);
  
  /**
   * Reset everything
   */
  const handleReset = useCallback(() => {
    setElapsedSeconds(0);
    setStartTime(null);
    setTargetTemp('200');
    setCurrentTemp('20');
    setTemperatureData([]);
    setCrackEvents([]);
    setIsRoasting(false);
    setIsPaused(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);
  
  /**
   * Record current temperature reading
   */
  const recordTemperature = useCallback(() => {
    if (!isRoasting || isPaused) return;
    
    const targetTempValue = parseFloat(targetTemp) || 0;
    const currentTempValue = parseFloat(currentTemp) || 0;
    
    // Always store in Celsius for consistency
    const dataPoint: TemperatureDataPoint = {
      time: elapsedSeconds,
      targetTemp: temperatureUnit === 'F' 
        ? convertTemperature(targetTempValue, 'F', 'C') 
        : targetTempValue,
      currentTemp: temperatureUnit === 'F' 
        ? convertTemperature(currentTempValue, 'F', 'C') 
        : currentTempValue,
      timestamp: Date.now()
    };
    
    setTemperatureData(prev => [...prev, dataPoint]);
  }, [isRoasting, isPaused, elapsedSeconds, targetTemp, currentTemp, temperatureUnit]);
  
  /**
   * Record crack event
   */
  const recordCrack = useCallback((type: 'first' | 'second') => {
    if (!isRoasting || isPaused) return;
    
    // Check if already recorded
    if (crackEvents.some(e => e.type === type)) return;
    
    // For second crack, first crack must be recorded
    if (type === 'second' && !crackEvents.some(e => e.type === 'first')) return;
    
    const targetTempValue = parseFloat(targetTemp) || 0;
    const currentTempValue = parseFloat(currentTemp) || 0;
    
    const event: CrackEvent = {
      time: elapsedSeconds,
      type,
      targetTemp: temperatureUnit === 'F' 
        ? convertTemperature(targetTempValue, 'F', 'C') 
        : targetTempValue,
      currentTemp: temperatureUnit === 'F' 
        ? convertTemperature(currentTempValue, 'F', 'C') 
        : currentTempValue,
      timestamp: Date.now()
    };
    
    setCrackEvents(prev => [...prev, event]);
  }, [isRoasting, isPaused, elapsedSeconds, targetTemp, currentTemp, temperatureUnit, crackEvents]);
  
  /**
   * Adjust target temperature
   */
  const adjustTargetTemp = useCallback((delta: number) => {
    setTargetTemp(prev => {
      const current = parseFloat(prev) || 0;
      const newValue = Math.max(0, Math.min(300, current + delta));
      return newValue.toString();
    });
  }, []);
  
  // Get first crack event for development stats
  const firstCrackEvent = crackEvents.find(e => e.type === 'first');
  const firstCrackTime = firstCrackEvent?.time || 0;
  
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
                <h2 className="text-lg font-semibold">Gene CBR-101</h2>
                <p className="text-sm text-muted-foreground">Dual Temperature Tracking</p>
              </div>
            </div>
            <BatchCapacityBadge 
              roasterType="gene-cbr-101"
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
                seconds={elapsedSeconds} 
                mode="count-up" 
                size="large"
              />
            </div>
            
            {/* Control buttons */}
            <div className="space-y-2">
              <div className="flex gap-2">
                {!isRoasting ? (
                  <Button 
                    onClick={handleStart} 
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
                        onClick={handleResume} 
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
              
              {!isRoasting && elapsedSeconds > 0 && (
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
          </CardContent>
        </Card>
        
        {/* RIGHT COLUMN: Temperature & Tracking */}
        <Card>
          <CardContent className="p-6 space-y-4">
            
            {/* Target Temperature */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                🎯 Target Temperature
              </Label>
              <div className="flex items-center justify-center gap-4">
                <div className="text-4xl font-bold font-mono">
                  {targetTemp}°{temperatureUnit}
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  size="default"
                  variant="outline"
                  onClick={() => adjustTargetTemp(-5)}
                  disabled={!isRoasting || isPaused}
                >
                  -5°
                </Button>
                <Button
                  size="default"
                  variant="outline"
                  onClick={() => adjustTargetTemp(5)}
                  disabled={!isRoasting || isPaused}
                >
                  +5°
                </Button>
              </div>
            </div>
            
            <Separator />
            
            {/* Current Temperature */}
            <div className="space-y-2">
              <Label htmlFor="current-temp" className="text-sm font-medium">
                🌡️ Current Temperature
              </Label>
              <Input
                id="current-temp"
                type="number"
                value={currentTemp}
                onChange={(e) => setCurrentTemp(e.target.value)}
                className="text-3xl font-bold font-mono text-center h-16"
                disabled={!isRoasting || isPaused}
                placeholder="0"
              />
              <Button
                className="w-full"
                size="default"
                onClick={recordTemperature}
                disabled={!isRoasting || isPaused}
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
            
            {/* Crack Events */}
            <div>
              <CrackEventButtons
                onFirstCrack={() => recordCrack('first')}
                onSecondCrack={() => recordCrack('second')}
                firstCrackRecorded={crackEvents.some(e => e.type === 'first')}
                secondCrackRecorded={crackEvents.some(e => e.type === 'second')}
                disabled={!isRoasting || isPaused}
                variant="inline"
                crackEvents={crackEvents}
                baseDuration={elapsedSeconds}
              />
            </div>
            
            {/* Development Stats (only show after first crack) */}
            {firstCrackEvent && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium mb-3">📊 Development Phase</h3>
                  <DevelopmentStats
                    elapsedSeconds={elapsedSeconds}
                    firstCrackTime={firstCrackTime}
                    variant="compact"
                  />
                </div>
              </>
            )}
            
          </CardContent>
        </Card>
        
      </div>
      
      {/* Tips - Collapsible */}
      <RoasterTips
        roasterType="gene-cbr-101"
        elapsedSeconds={elapsedSeconds}
        firstCrackRecorded={crackEvents.some(e => e.type === 'first')}
        defaultCollapsed={true}
      />
    </div>
  );
}
