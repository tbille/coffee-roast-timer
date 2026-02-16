/**
 * BehmortMode Component
 * Profile-based countdown mode for Behmor 2000AB Plus
 * Features: P1-P5 profiles, 30-second extensions, optional temperature tracking
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
import { BehmortProfileDropdown } from '../behmor/BehmortProfileDropdown';
import { ExtensionTracker } from '../behmor/ExtensionTracker';
import type { ProfileBasedRoastData, BehmortProfile, Extension, CrackEvent } from '@/types/roast-data.types';

interface BehmortModeProps {
  onSave: (data: ProfileBasedRoastData) => void;
  initialBatchSize?: number;
  key?: string;
}

const STORAGE_KEY = 'behmor_roast_state';

// Profile durations in seconds
const PROFILE_DURATIONS: Record<BehmortProfile, number> = {
  'P1': 840,   // 14 minutes
  'P2': 960,   // 16 minutes
  'P3': 1080,  // 18 minutes
  'P4': 1200,  // 20 minutes
  'P5': 1320,  // 22 minutes
  'Manual': 0  // No preset for manual
};

export function BehmortMode({
  onSave,
  initialBatchSize = 340
}: BehmortModeProps) {
  // Profile selection
  const [selectedProfile, setSelectedProfile] = useState<BehmortProfile>('P3');
  
  // Roast state
  const [isRoasting, setIsRoasting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(PROFILE_DURATIONS['P3']);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  // Extensions
  const [extensions, setExtensions] = useState<Extension[]>([]);
  
  // Optional temperature tracking (external probe)
  const [currentTemp, setCurrentTemp] = useState<string>('');
  const [temperatureData, setTemperatureData] = useState<Array<{
    time: number;
    temp: number;
    timestamp: number;
  }>>([]);
  
  // Crack events
  const [crackEvents, setCrackEvents] = useState<CrackEvent[]>([]);
  
  // Batch size
  const [batchSize] = useState(initialBatchSize);
  
  // Get base duration and total duration
  const baseDuration = PROFILE_DURATIONS[selectedProfile];
  const totalExtensionTime = extensions.reduce((sum, ext) => sum + ext.duration, 0);
  const totalDuration = baseDuration + totalExtensionTime;
  const elapsedSeconds = totalDuration - secondsRemaining;
  
  /**
   * Countdown timer effect
   */
  useEffect(() => {
    if (!isRoasting || isPaused) return;
    
    const interval = setInterval(() => {
      setSecondsRemaining(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRoasting, isPaused]);
  
  /**
   * Persist state to localStorage
   */
  useEffect(() => {
    if (isRoasting || secondsRemaining < totalDuration || extensions.length > 0) {
      const state = {
        selectedProfile,
        isRoasting: false, // Never persist running state
        isPaused,
        secondsRemaining,
        startTime,
        extensions,
        crackEvents,
        temperatureData,
        batchSize,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [isRoasting, isPaused, secondsRemaining, selectedProfile, startTime, extensions, crackEvents, temperatureData, batchSize, totalDuration]);
  
  /**
   * Load persisted state on mount
   */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        // Only restore if less than 24 hours old
        if (Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
          setSelectedProfile(state.selectedProfile || 'P3');
          setSecondsRemaining(state.secondsRemaining || PROFILE_DURATIONS['P3']);
          setStartTime(state.startTime);
          setExtensions(state.extensions || []);
          setCrackEvents(state.crackEvents || []);
          setTemperatureData(state.temperatureData || []);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }, []);
  
  /**
   * Handle profile change (only when not roasting)
   */
  const handleProfileChange = useCallback((profile: BehmortProfile) => {
    if (!isRoasting) {
      setSelectedProfile(profile);
      setSecondsRemaining(PROFILE_DURATIONS[profile]);
    }
  }, [isRoasting]);
  
  /**
   * Start roast
   */
  const handleStart = useCallback(() => {
    if (selectedProfile === 'Manual') {
      alert('Manual mode is not yet supported. Please select a profile (P1-P5).');
      return;
    }
    
    const now = Date.now();
    setStartTime(now);
    setSecondsRemaining(baseDuration);
    setExtensions([]);
    setCrackEvents([]);
    setTemperatureData([]);
    setIsRoasting(true);
    setIsPaused(false);
  }, [selectedProfile, baseDuration]);
  
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
   * Stop roast and save
   */
  const handleStop = useCallback(() => {
    setIsRoasting(false);
    setIsPaused(false);
    
    const roastData: ProfileBasedRoastData = {
      mode: 'profile-based',
      startTime: startTime || Date.now() - (totalDuration - secondsRemaining) * 1000,
      endTime: Date.now(),
      profile: selectedProfile,
      baseDuration,
      extensions,
      crackEvents,
      temperatureData: temperatureData.length > 0 ? temperatureData : undefined
    };
    
    onSave(roastData);
    localStorage.removeItem(STORAGE_KEY);
  }, [startTime, totalDuration, secondsRemaining, selectedProfile, baseDuration, extensions, crackEvents, temperatureData, onSave]);
  
  /**
   * Reset everything
   */
  const handleReset = useCallback(() => {
    setSecondsRemaining(PROFILE_DURATIONS[selectedProfile]);
    setStartTime(null);
    setExtensions([]);
    setCrackEvents([]);
    setTemperatureData([]);
    setCurrentTemp('');
    setIsRoasting(false);
    setIsPaused(false);
    localStorage.removeItem(STORAGE_KEY);
  }, [selectedProfile]);
  
  /**
   * Add 30-second extension
   */
  const addExtension = useCallback(() => {
    if (extensions.length >= 6 || !isRoasting || isPaused) return;
    
    const extension: Extension = {
      time: secondsRemaining,
      duration: 30,
      timestamp: Date.now()
    };
    
    setExtensions(prev => [...prev, extension]);
    setSecondsRemaining(prev => prev + 30);
  }, [extensions.length, isRoasting, isPaused, secondsRemaining]);
  
  /**
   * Record crack event
   */
  const recordCrack = useCallback((type: 'first' | 'second') => {
    if (!isRoasting || isPaused) return;
    if (crackEvents.some(e => e.type === type)) return;
    if (type === 'second' && !crackEvents.some(e => e.type === 'first')) return;
    
    const event: CrackEvent = {
      time: secondsRemaining, // Time remaining when crack occurred
      type,
      timestamp: Date.now()
    };
    
    setCrackEvents(prev => [...prev, event]);
  }, [isRoasting, isPaused, secondsRemaining, crackEvents]);
  
  /**
   * Record optional temperature
   */
  const recordTemperature = useCallback(() => {
    if (!isRoasting || isPaused || !currentTemp || parseFloat(currentTemp) <= 0) return;
    
    const reading = {
      time: secondsRemaining,
      temp: parseFloat(currentTemp),
      timestamp: Date.now()
    };
    
    setTemperatureData(prev => [...prev, reading]);
    setCurrentTemp(''); // Clear input after recording
  }, [isRoasting, isPaused, currentTemp, secondsRemaining]);
  
  // Calculate elapsed time from first crack for development stats
  const firstCrackEvent = crackEvents.find(e => e.type === 'first');
  const firstCrackElapsed = firstCrackEvent ? baseDuration - firstCrackEvent.time : 0;
  
  return (
    <div className="space-y-4">
      {/* Roaster Header */}
      <Card>
        <CardContent className="py-4">
          <div className="space-y-3">
            {/* Roaster name and description */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl">☕</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Behmor 2000AB Plus</h2>
                <p className="text-sm text-muted-foreground">Profile-Based Countdown</p>
              </div>
            </div>
            
            {/* Profile selector and Batch badge */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <BehmortProfileDropdown
                selectedProfile={selectedProfile}
                onProfileChange={handleProfileChange}
                disabled={isRoasting}
                variant="compact"
              />
              <BatchCapacityBadge 
                roasterType="behmor-2000ab"
                currentWeight={batchSize}
              />
            </div>
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
                Time Remaining
              </h3>
              <TimerDisplay 
                seconds={secondsRemaining} 
                mode="countdown" 
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
                    disabled={selectedProfile === 'Manual'}
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
              
              {!isRoasting && (secondsRemaining < PROFILE_DURATIONS[selectedProfile] || extensions.length > 0) && (
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
        
        {/* RIGHT COLUMN: Roast Tracking */}
        <Card>
          <CardContent className="p-6 space-y-4">
            
            {/* Extensions */}
            <div>
              <ExtensionTracker
                extensions={extensions}
                onAddExtension={addExtension}
                disabled={!isRoasting || isPaused}
                maxExtensions={6}
                variant="compact"
              />
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
                baseDuration={baseDuration}
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
                    firstCrackTime={firstCrackElapsed}
                    variant="compact"
                  />
                </div>
              </>
            )}
            
            <Separator />
            
            {/* Temperature */}
            <div className="space-y-2">
              <Label htmlFor="current-temp" className="text-sm font-medium">
                🌡️ External Thermometer
              </Label>
              <p className="text-xs text-muted-foreground">
                Optional - most users don't need this
              </p>
              <div className="flex gap-2">
                <Input
                  id="current-temp"
                  type="number"
                  value={currentTemp}
                  onChange={(e) => setCurrentTemp(e.target.value)}
                  placeholder="Temp (°C)"
                  disabled={!isRoasting || isPaused}
                  className="flex-1"
                />
                <Button
                  onClick={recordTemperature}
                  disabled={!isRoasting || isPaused || !currentTemp}
                  size="sm"
                >
                  Record
                </Button>
              </div>
              {temperatureData.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {temperatureData.length} reading{temperatureData.length !== 1 ? 's' : ''} recorded
                </p>
              )}
            </div>
            
          </CardContent>
        </Card>
        
      </div>
      
      {/* Tips - Collapsible */}
      <RoasterTips
        roasterType="behmor-2000ab"
        elapsedSeconds={elapsedSeconds}
        firstCrackRecorded={crackEvents.some(e => e.type === 'first')}
        profile={selectedProfile}
        extensions={extensions.length}
        defaultCollapsed={true}
      />
    </div>
  );
}
