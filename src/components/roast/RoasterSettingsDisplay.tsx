import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Clock, Flame, Wind } from "lucide-react";
import { type RoasterSettings, type DevelopmentStats } from "@/types/roast.types";
import { type RoasterType } from "@/types/roaster.types";
import { ROASTER_SPECS } from "@/utils/roasterRegistry";
import { cn } from "@/lib/utils";

interface RoasterSettingsDisplayProps {
  roaster_type: RoasterType;
  roaster_settings?: RoasterSettings;
  development_stats?: DevelopmentStats;
  initial_weight?: number;
  duration_seconds: number;
  className?: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function ProfileConfigDisplay({ config }: { config: { profile_name: string; base_duration_seconds: number; extensions?: Array<{ at_time_remaining_seconds: number; add_seconds: number }> } }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <Settings className="h-4 w-4" />
        Profile Configuration
      </h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge className="text-lg px-3 py-1">{config.profile_name}</Badge>
          <span className="text-sm text-muted-foreground">
            ({formatTime(config.base_duration_seconds)} base)
          </span>
        </div>
        
        {config.extensions && config.extensions.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">Extensions:</div>
            {config.extensions.map((ext, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm ml-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>At <span className="font-mono">{formatTime(ext.at_time_remaining_seconds)}</span> remaining</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-semibold">Add {ext.add_seconds}s</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ControlScheduleDisplay({ schedule }: { schedule: Array<{ time_seconds: number; heat_level?: string | number; fan_level?: string | number; note?: string }> }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <Settings className="h-4 w-4" />
        Control Schedule
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left pb-2 pr-4">Time</th>
              <th className="text-left pb-2 pr-4">Heat</th>
              <th className="text-left pb-2 pr-4">Fan</th>
              <th className="text-left pb-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((ctrl, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-2 pr-4">
                  <Badge variant="outline" className="font-mono">
                    {formatTime(ctrl.time_seconds)}
                  </Badge>
                </td>
                <td className="py-2 pr-4">
                  {ctrl.heat_level && (
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3" />
                      {typeof ctrl.heat_level === 'string' 
                        ? <span className="capitalize">{ctrl.heat_level}</span>
                        : <span>{ctrl.heat_level}%</span>
                      }
                    </span>
                  )}
                </td>
                <td className="py-2 pr-4">
                  {ctrl.fan_level && (
                    <span className="flex items-center gap-1">
                      <Wind className="h-3 w-3" />
                      {typeof ctrl.fan_level === 'string'
                        ? <span className="capitalize">{ctrl.fan_level}</span>
                        : <span>{ctrl.fan_level}%</span>
                      }
                    </span>
                  )}
                </td>
                <td className="py-2 text-xs text-muted-foreground">{ctrl.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DevelopmentStatsDisplay({ stats }: { stats: DevelopmentStats }) {
  const ratio = stats.development_ratio_percent;
  const isIdeal = ratio !== undefined && ratio >= 20 && ratio <= 25;
  const isOverDeveloped = ratio !== undefined && ratio > 25;
  
  return (
    <div className="p-3 bg-muted/50 rounded-lg border">
      <h4 className="text-sm font-semibold mb-2">📊 Development Statistics</h4>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {stats.development_time_seconds !== undefined && (
          <div>
            <div className="text-xs text-muted-foreground">Development Time</div>
            <div className="font-mono font-semibold">{formatTime(stats.development_time_seconds)}</div>
          </div>
        )}
        {stats.development_ratio_percent !== undefined && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">Development Ratio</div>
            <div className="flex items-center gap-2">
              <div className="font-mono font-semibold text-lg">{stats.development_ratio_percent.toFixed(1)}%</div>
              {isIdeal ? (
                <Badge variant="default" className="bg-green-600 hover:bg-green-700">Ideal (20-25%)</Badge>
              ) : ratio && ratio < 20 ? (
                <Badge variant="secondary">Light (under-developed)</Badge>
              ) : isOverDeveloped ? (
                <Badge className="bg-orange-600 hover:bg-orange-700">Dark (over-developed)</Badge>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function RoasterSettingsDisplay({
  roaster_type,
  roaster_settings,
  development_stats,
  initial_weight,
  duration_seconds,
  className
}: RoasterSettingsDisplayProps) {
  const roasterSpec = ROASTER_SPECS[roaster_type];
  
  return (
    <Card className={cn("shadow-coffee", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Roaster Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Roaster Info */}
        <div>
          <h3 className="font-semibold text-lg">{roasterSpec?.displayName || roaster_type}</h3>
          {roasterSpec?.manufacturer && (
            <p className="text-sm text-muted-foreground">{roasterSpec.manufacturer}</p>
          )}
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {initial_weight && (
            <div>
              <div className="text-xs text-muted-foreground">Batch Size</div>
              <div className="font-semibold">{initial_weight}g</div>
              {roasterSpec?.recommendedBatchSize && (
                <div className="text-xs text-muted-foreground">
                  (rec: {roasterSpec.minBatchSize}-{roasterSpec.maxBatchSize}g)
                </div>
              )}
            </div>
          )}
          <div>
            <div className="text-xs text-muted-foreground">Duration</div>
            <div className="font-semibold font-mono">{formatTime(duration_seconds)}</div>
          </div>
        </div>

        {/* Development Stats - Moved up from bottom */}
        {development_stats && (
          <DevelopmentStatsDisplay stats={development_stats} />
        )}

        {/* Starting Conditions */}
        {roaster_settings?.starting_conditions && (
          <div className="p-3 bg-muted/30 rounded-lg">
            <h4 className="text-sm font-semibold mb-2">🌡️ Starting Conditions</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {roaster_settings.starting_conditions.room_temp_c && (
                <div>
                  <span className="text-muted-foreground">Room: </span>
                  <span className="font-semibold">{roaster_settings.starting_conditions.room_temp_c}°C</span>
                </div>
              )}
              {roaster_settings.starting_conditions.bean_temp_c && (
                <div>
                  <span className="text-muted-foreground">Beans: </span>
                  <span className="font-semibold">{roaster_settings.starting_conditions.bean_temp_c}°C</span>
                </div>
              )}
              {roaster_settings.starting_conditions.humidity_percent && (
                <div>
                  <span className="text-muted-foreground">Humidity: </span>
                  <span className="font-semibold">{roaster_settings.starting_conditions.humidity_percent}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Roaster-Specific Settings */}
        <div className="border-t pt-4">
          {/* Profile-based roasters */}
          {roaster_settings?.profile_config && (
            <ProfileConfigDisplay config={roaster_settings.profile_config} />
          )}

          {/* Manual control roasters */}
          {roaster_settings?.control_schedule && (
            <ControlScheduleDisplay schedule={roaster_settings.control_schedule} />
          )}

          {/* Freeform instructions */}
          {roaster_settings?.instructions && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">📝 Instructions</h4>
              <p className="text-sm whitespace-pre-wrap">{roaster_settings.instructions}</p>
            </div>
          )}

          {/* If no settings provided, show helpful message */}
          {!roaster_settings?.profile_config && 
           !roaster_settings?.control_schedule && 
           !roaster_settings?.instructions && (
            <p className="text-sm text-muted-foreground italic">
              No detailed roaster settings recorded for this profile.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
