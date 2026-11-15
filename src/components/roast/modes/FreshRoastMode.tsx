/**
 * FreshRoastMode Component
 * Heat/fan setting tracking for the FreshRoast SR800.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Flame, Wind } from "lucide-react";
import { RoasterHeader } from "../shared/RoasterHeader";
import { RoastControls } from "../shared/RoastControls";
import { CrackEventButtons } from "../shared/CrackEventButtons";
import { RoasterTips } from "../shared/RoasterTips";
import { SettingChangeHistory } from "../shared/SettingChangeHistory";
import { HeatFanControls } from "../freshroast/HeatFanControls";
import { useRoastSession } from "@/hooks/useRoastSession";
import { getRoasterSpec } from "@/utils/roasterRegistry";
import type {
  CrackEvent,
  FanSpeed,
  HeatFanRoastData,
  HeatLevel,
  SettingChange,
} from "@/types/roast-data.types";
import type { RoastModeProps } from "./types";

const ROASTER = 'freshroast-sr800';

interface FreshRoastSettings {
  batchSize: number;
  heatLevel: HeatLevel;
  fanSpeed: FanSpeed;
}

interface FreshRoastLog {
  settingChanges: SettingChange[];
  crackEvents: CrackEvent[];
}

export function FreshRoastMode(props: RoastModeProps) {
  const session = useRoastSession<FreshRoastSettings, FreshRoastLog>(
    'roast_session:freshroast-sr800',
    { batchSize: getRoasterSpec(ROASTER).recommendedBatchSize, heatLevel: 'Medium', fanSpeed: 'Medium' },
    { settingChanges: [], crackEvents: [] },
    {
      // Record the starting heat/fan settings at 0:00
      seedLogOnStart: ({ heatLevel, fanSpeed }) => ({
        settingChanges: [{ time: 0, heatLevel, fanSpeed, timestamp: Date.now() }],
      }),
    },
  );
  const { settings, updateSettings, log, canRecord } = session;
  const { heatLevel, fanSpeed } = settings;

  const lastChange = log.settingChanges[log.settingChanges.length - 1];
  const hasUnrecordedChange = !lastChange || lastChange.heatLevel !== heatLevel || lastChange.fanSpeed !== fanSpeed;

  const recordChange = () => {
    session.record((l, time) => ({
      ...l,
      settingChanges: [...l.settingChanges, { time, heatLevel, fanSpeed, timestamp: Date.now() }],
    }));
  };

  const buildData = (): HeatFanRoastData => ({
    mode: 'heat-fan-control',
    startTime: session.startTime ?? Date.now(),
    endTime: session.endTime ?? Date.now(),
    settingChanges: log.settingChanges,
    crackEvents: log.crackEvents,
  });

  return (
    <div className="space-y-4">
      <RoasterHeader
        roasterType={ROASTER}
        subtitle="Heat/Fan Control Tracking"
        batchSize={settings.batchSize}
        onBatchSizeChange={batchSize => updateSettings({ batchSize })}
        batchLocked={session.status !== 'idle'}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <RoastControls session={session} modeProps={props} buildData={buildData} />

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-center text-muted-foreground uppercase tracking-wide">
                Current Settings
              </h3>
              <div className="flex justify-center items-center gap-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Flame className="h-5 w-5 text-orange-500" aria-hidden="true" />
                    <span className="text-xs font-medium text-muted-foreground">HEAT</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{heatLevel}</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Wind className="h-5 w-5 text-cyan-500" aria-hidden="true" />
                    <span className="text-xs font-medium text-muted-foreground">FAN</span>
                  </div>
                  <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{fanSpeed}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <HeatFanControls
              type="heat"
              value={heatLevel}
              onChange={v => updateSettings({ heatLevel: v as HeatLevel })}
              label="HEAT LEVEL"
              icon={<Flame className="h-4 w-4" />}
            />

            <Separator />

            <HeatFanControls
              type="fan"
              value={fanSpeed}
              onChange={v => updateSettings({ fanSpeed: v as FanSpeed })}
              label="FAN SPEED"
              icon={<Wind className="h-4 w-4" />}
            />

            <Separator />

            <Button
              onClick={recordChange}
              className="w-full"
              disabled={!hasUnrecordedChange || !canRecord}
              variant={hasUnrecordedChange ? "default" : "secondary"}
            >
              📝 Record Heat/Fan Change
            </Button>

            {log.settingChanges.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium mb-3">📋 Change History</h3>
                  <SettingChangeHistory changes={log.settingChanges} maxDisplay={6} />
                </div>
              </>
            )}

            <Separator />

            <CrackEventButtons
              firstCrack={session.firstCrack}
              secondCrack={session.secondCrack}
              onRecord={type => session.recordCrack(type)}
              elapsedSeconds={session.elapsedSeconds}
              disabled={!canRecord}
            />
          </CardContent>
        </Card>
      </div>

      <RoasterTips
        roasterType={ROASTER}
        elapsedSeconds={session.elapsedSeconds}
        firstCrackRecorded={!!session.firstCrack}
        defaultCollapsed
      />
    </div>
  );
}
