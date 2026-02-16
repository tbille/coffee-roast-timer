/**
 * Roast Data Type Definitions
 * Mode-specific data structures for different roaster types
 */

/**
 * Base roast data shared by all roaster modes
 * Every roast tracks start/end time and crack events at minimum
 */
export interface BaseRoastData {
  startTime: number;                // Unix timestamp (ms) when roast started
  endTime?: number;                 // Unix timestamp (ms) when roast ended
  crackEvents: CrackEvent[];        // First and second crack events
}

/**
 * Crack event data
 * Records when cracks occur during the roast
 */
export interface CrackEvent {
  time: number;                     // Seconds elapsed (or remaining for countdown modes)
  type: 'first' | 'second';         // Crack type
  targetTemp?: number;              // Target temp at time of crack (Gene mode)
  currentTemp?: number;             // Actual temp at time of crack
  timestamp: number;                // Unix timestamp when crack was recorded
}

/**
 * Gene CBR-101: Dual temperature tracking
 * Tracks both target (set by user) and current (actual) temperatures over time
 */
export interface DualTempRoastData extends BaseRoastData {
  mode: 'dual-temperature';
  temperatureData: TemperatureDataPoint[];
}

export interface TemperatureDataPoint {
  time: number;                     // Seconds elapsed from start
  targetTemp: number;               // Target temperature in Celsius
  currentTemp: number;              // Actual temperature in Celsius
  timestamp: number;                // Unix timestamp of recording
}

/**
 * Behmor 2000AB: Profile-based with extensions
 * Uses built-in profiles (P1-P5) with ability to add 30-second extensions
 */
export interface ProfileBasedRoastData extends BaseRoastData {
  mode: 'profile-based';
  profile: BehmortProfile;          // Selected profile
  baseDuration: number;             // Base profile duration (seconds)
  extensions: Extension[];          // Manual time extensions
  temperatureData?: OptionalTempDataPoint[]; // Optional external probe readings
}

export type BehmortProfile = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'Manual';

export interface Extension {
  time: number;                     // Seconds remaining when extension added
  duration: number;                 // Duration added (typically 30 seconds)
  timestamp: number;                // Unix timestamp when added
}

export interface OptionalTempDataPoint {
  time: number;                     // Seconds remaining (countdown mode)
  temp: number;                     // Temperature in Celsius
  timestamp: number;                // Unix timestamp of recording
}

/**
 * FreshRoast SR800: Heat/Fan control tracking
 * Tracks manual heat and fan speed adjustments over time
 */
export interface HeatFanRoastData extends BaseRoastData {
  mode: 'heat-fan-control';
  settingChanges: SettingChange[];  // Log of all heat/fan adjustments
  temperatureData?: OptionalTempDataPoint[]; // Optional external probe
}

export interface SettingChange {
  time: number;                     // Seconds elapsed from start
  heatLevel: HeatLevel;             // Heat setting
  fanSpeed: FanSpeed;               // Fan speed setting
  timestamp: number;                // Unix timestamp of change
}

export type HeatLevel = 'Low' | 'Medium' | 'High';
export type FanSpeed = 'Low' | 'Medium' | 'High';

/**
 * KALDI/Manual: Simple temperature tracking
 * For manual roasters, tracks temperature and optional heat settings
 */
export interface ManualRoastData extends BaseRoastData {
  mode: 'manual-simple';
  temperatureData: ManualTempDataPoint[];
  heatSettings?: HeatSetting[];     // Optional heat level tracking
  environmental?: EnvironmentalData; // Outdoor roasting conditions
}

export interface ManualTempDataPoint {
  time: number;                     // Seconds elapsed from start
  temp: number;                     // Temperature in Celsius
  recordMethod: 'manual' | 'voice' | 'auto'; // How temp was recorded
  timestamp: number;                // Unix timestamp of recording
}

export interface HeatSetting {
  time: number;                     // Seconds elapsed from start
  setting: string;                  // Free-form: "Medium flame", "Level 6"
  timestamp: number;                // Unix timestamp of change
}

export interface EnvironmentalData {
  ambientTemp?: number;             // Ambient temperature (Celsius)
  humidity?: number;                // Relative humidity (percentage)
  windConditions?: string;          // Wind description
  location: 'indoor' | 'outdoor';   // Roasting location
}

/**
 * Union type for all roast data modes
 * Discriminated by 'mode' property for type-safe handling
 */
export type RoastData =
  | DualTempRoastData
  | ProfileBasedRoastData
  | HeatFanRoastData
  | ManualRoastData;

/**
 * Type guard utilities
 * Helper functions to safely narrow RoastData union type
 */
export function isDualTempData(data: RoastData): data is DualTempRoastData {
  return data.mode === 'dual-temperature';
}

export function isProfileBasedData(data: RoastData): data is ProfileBasedRoastData {
  return data.mode === 'profile-based';
}

export function isHeatFanData(data: RoastData): data is HeatFanRoastData {
  return data.mode === 'heat-fan-control';
}

export function isManualData(data: RoastData): data is ManualRoastData {
  return data.mode === 'manual-simple';
}
