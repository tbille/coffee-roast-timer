import type { RoastData } from '@/types/roast-data.types';
import type { TemperatureUnit } from '@/utils/temperatureConversion';

/** Everything RoastMonitor needs to open the save dialog for a finished roast. */
export interface RoastSaveRequest {
  data: RoastData;
  /** Roasting time, excluding pauses */
  durationSeconds: number;
  batchSize: number;
  temperatureUnit: TemperatureUnit;
  /** Clears the mode's persisted session once the roast is saved */
  clear: () => void;
}

export interface RoastModeProps {
  onSave: (request: RoastSaveRequest) => void;
  onInProgressChange?: (inProgress: boolean) => void;
}
