/**
 * PopcornPopperMode Component
 * Ultra-simple, safety-first tracking for DIY popcorn popper roasts.
 */

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell } from "lucide-react";
import { RoasterHeader } from "../shared/RoasterHeader";
import { RoastControls } from "../shared/RoastControls";
import { CrackEventButtons } from "../shared/CrackEventButtons";
import { RoasterTips } from "../shared/RoasterTips";
import { BatchSizeWarning } from "../popcorn/BatchSizeWarning";
import { VisualCueTracker, type VisualCue } from "../popcorn/VisualCueTracker";
import { useRoastSession } from "@/hooks/useRoastSession";
import { getRoasterSpec } from "@/utils/roasterRegistry";
import type { CrackEvent, ManualTempDataPoint, PopcornPopperData } from "@/types/roast-data.types";
import type { RoastModeProps } from "./types";

const ROASTER = 'popcorn-popper';
const MAX_BATCH_GRAMS = 100;
const FIRST_CRACK_ALERT_SECONDS = 180;
const ALERT_VISIBLE_MS = 5000;

interface PopcornSettings {
  batchSize: number;
  machineModel: string;
}

interface PopcornLog {
  temperatureData: ManualTempDataPoint[];
  crackEvents: CrackEvent[];
  visualCues: VisualCue[];
}

function playAlertBeep() {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioCtx();
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
  } catch {
    // Audio not available; the visual alert is enough.
  }
}

function getStartBlockedReason(batchSize: number) {
  if (batchSize <= 0) return 'Enter your batch size before starting.';
  if (batchSize > MAX_BATCH_GRAMS) return `Batch size exceeds the safe maximum of ${MAX_BATCH_GRAMS}g. Reduce it to start.`;
  return undefined;
}

export function PopcornPopperMode(props: RoastModeProps) {
  const session = useRoastSession<PopcornSettings, PopcornLog>(
    'roast_session:popcorn-popper',
    { batchSize: getRoasterSpec(ROASTER).recommendedBatchSize, machineModel: '' },
    { temperatureData: [], crackEvents: [], visualCues: [] },
  );
  const { settings, updateSettings, log, canRecord, elapsedSeconds } = session;
  const [currentTemp, setCurrentTemp] = useState('');
  const [showFirstCrackAlert, setShowFirstCrackAlert] = useState(false);

  // One-time "listen for first crack" alert at 3:00. Starts as "already shown"
  // when a recovered session is past that point.
  const alertShownRef = useRef(elapsedSeconds >= FIRST_CRACK_ALERT_SECONDS);
  useEffect(() => {
    if (session.status === 'idle') alertShownRef.current = false;
  }, [session.status]);

  useEffect(() => {
    if (!session.isRunning || alertShownRef.current || elapsedSeconds < FIRST_CRACK_ALERT_SECONDS) return;
    alertShownRef.current = true;
    setShowFirstCrackAlert(true);
    playAlertBeep();
  }, [session.isRunning, elapsedSeconds]);

  useEffect(() => {
    if (!showFirstCrackAlert) return;
    const id = setTimeout(() => setShowFirstCrackAlert(false), ALERT_VISIBLE_MS);
    return () => clearTimeout(id);
  }, [showFirstCrackAlert]);

  const handleRecordTemp = () => {
    const temp = parseFloat(currentTemp);
    if (Number.isNaN(temp) || temp < 0 || temp > 300) return;
    const recorded = session.record((l, time) => ({
      ...l,
      temperatureData: [...l.temperatureData, { time, temp, recordMethod: 'manual', timestamp: Date.now() }],
    }));
    if (recorded) setCurrentTemp('');
  };

  const handleAddVisualCue = (cue: VisualCue) => {
    session.record((l, time) => ({ ...l, visualCues: [...l.visualCues, { ...cue, time }] }));
  };

  const buildData = (): PopcornPopperData => ({
    mode: 'manual-simple',
    startTime: session.startTime ?? Date.now(),
    endTime: session.endTime ?? Date.now(),
    temperatureData: log.temperatureData.length > 0 ? log.temperatureData : undefined,
    crackEvents: log.crackEvents,
    visualCues: log.visualCues.length > 0 ? log.visualCues : undefined,
    machineModel: settings.machineModel.trim() || undefined,
  });

  const setupLocked = session.status !== 'idle';
  const readings = log.temperatureData.length;

  return (
    <div className="space-y-4">
      <RoasterHeader
        roasterType={ROASTER}
        subtitle="Ultra-Fast Roasting (4-6 min)"
        batchSize={settings.batchSize}
        onBatchSizeChange={batchSize => updateSettings({ batchSize })}
        batchLocked={setupLocked}
        showBatchInput={false}
      />

      {showFirstCrackAlert && (
        <Alert role="alert" className="border-2 border-orange-500 bg-orange-50 dark:bg-orange-950/20 animate-pulse">
          <Bell className="h-4 w-4 text-orange-600" />
          <AlertTitle className="font-bold text-orange-600">First Crack Alert!</AlertTitle>
          <AlertDescription className="text-sm text-orange-600 dark:text-orange-400">
            3 minutes elapsed - First crack typically occurs around this time. Listen closely!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <RoastControls
              session={session}
              modeProps={props}
              buildData={buildData}
              startBlockedReason={getStartBlockedReason(settings.batchSize)}
            />

            <Separator />

            <BatchSizeWarning
              batchSize={settings.batchSize}
              onBatchSizeChange={batchSize => updateSettings({ batchSize })}
              maxSize={MAX_BATCH_GRAMS}
              disabled={setupLocked}
            />

            {elapsedSeconds >= 240 && elapsedSeconds < 360 && (
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

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="popcorn-machine-model" className="text-sm font-medium">
                Popcorn Popper Model (Optional)
              </Label>
              <Input
                id="popcorn-machine-model"
                type="text"
                placeholder="West Bend Poppery, Presto PopLite"
                value={settings.machineModel}
                onChange={e => updateSettings({ machineModel: e.target.value })}
                disabled={setupLocked}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">Track which model works best</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="popcorn-temp-input" className="text-sm font-medium">
                🌡️ Temperature (Optional)
              </Label>
              <p className="text-xs text-muted-foreground mb-2">If you have a thermometer</p>
              <Input
                id="popcorn-temp-input"
                type="number"
                placeholder="185"
                value={currentTemp}
                onChange={e => setCurrentTemp(e.target.value)}
                disabled={!canRecord}
                className="text-2xl font-bold font-mono text-center h-14"
                min="0"
                max="300"
                step="5"
              />
              <Button onClick={handleRecordTemp} className="w-full" disabled={!currentTemp || !canRecord} variant="outline">
                📝 Record Temperature
              </Button>
              {readings > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  {readings} reading{readings !== 1 ? 's' : ''} recorded
                </p>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-3">👁️ Visual Cues</h3>
              <VisualCueTracker
                elapsedTime={elapsedSeconds}
                onAddCue={handleAddVisualCue}
                cues={log.visualCues}
                disabled={!canRecord}
              />
            </div>

            <Separator />

            <CrackEventButtons
              firstCrack={session.firstCrack}
              secondCrack={session.secondCrack}
              onRecord={type => session.recordCrack(type)}
              elapsedSeconds={elapsedSeconds}
              disabled={!canRecord}
            />
          </CardContent>
        </Card>
      </div>

      <div className="p-4 rounded-lg bg-destructive/10 border-2 border-destructive text-center">
        <p className="text-sm font-bold text-destructive">⚠️ SAFETY REMINDER</p>
        <p className="text-xs text-muted-foreground mt-1">
          Cool beans immediately after roasting. Never leave machine unattended.
          Roast outdoors or with excellent ventilation.
        </p>
      </div>

      <RoasterTips
        roasterType={ROASTER}
        elapsedSeconds={elapsedSeconds}
        firstCrackRecorded={!!session.firstCrack}
        defaultCollapsed
      />
    </div>
  );
}
