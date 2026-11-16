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
  /** 2 for roasts recorded by the console (events in ms, temperatures in °C). Absent on legacy rows. */
  schema_version?: number;
}

/**
 * Crack event data
 * Records when cracks occur during the roast
 */
export interface CrackEvent {
  time: number;                     // Seconds elapsed since charge
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
 * Uses built-in profiles (P1-P5); "+" adds 15 s and "−" removes 10 s (older roasts logged 30 s per +)
 */
export interface ProfileBasedRoastData extends BaseRoastData {
  mode: 'profile-based';
  profile: BehmorProfile;           // Program chosen before Start
  baseDuration: number;             // Time shown on the LCD at Start (seconds)
  extensions: Extension[];          // "+" / "−" presses (time added or removed)
  temperatureData?: OptionalTempDataPoint[]; // Optional external probe readings
  /** Weight button pressed before Start: '1/4 lb' | '1/2 lb' | '1 lb' */
  weightButton?: string;
  /** Manual mode presses during the roast: "P3" (power) or "D" (drum speed) */
  manualControls?: BehmorManualPress[];
}

export type BehmorProfile = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'Manual';

export interface BehmorManualPress {
  time: number;                     // Seconds elapsed since charge
  setting: string;                  // "P1"…"P5" power level, or "D" drum speed toggle
  timestamp: number;
}

export interface Extension {
  time: number;                     // Seconds elapsed when extension added
  duration: number;                 // Signed seconds: +15 per "+", -10 per "−" (older roasts: +30)
  timestamp: number;                // Unix timestamp when added
}

export interface OptionalTempDataPoint {
  time: number;                     // Seconds elapsed from start
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

/** 1–9 on the SR800 dial. Legacy rows used 'Low' | 'Medium' | 'High'. */
export type HeatLevel = number | 'Low' | 'Medium' | 'High';
/** 1–9 on the SR800 dial. Legacy rows used 'Low' | 'Medium' | 'High'. */
export type FanSpeed = number | 'Low' | 'Medium' | 'High';

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
 * Popcorn Popper: Ultra-simple with visual cues
 * For DIY roasters, emphasizes safety and visual tracking
 */
export interface PopcornPopperData extends BaseRoastData {
  mode: 'manual-simple';
  temperatureData?: ManualTempDataPoint[]; // Optional (many don't have thermometers)
  visualCues?: VisualCue[];         // Color progression tracking
  stirringNotes?: string;           // Free-form stirring notes
  machineModel?: string;            // Which popcorn popper model
}

export interface VisualCue {
  time: number;                     // Seconds elapsed from start
  color: string;                    // Bean color description
  notes?: string;                   // Observations
  timestamp: number;                // Unix timestamp of recording
}

/**
 * Hottop KN-8828: Advanced roaster with automatic/manual modes
 * Supports Artisan import/export and advanced metrics
 */
export interface HottopRoastData extends BaseRoastData {
  mode: 'hottop-advanced';
  roastMode: HottopMode;            // Automatic or manual mode
  temperatureData: HottopTempDataPoint[];
  manualControls?: HottopManualControl[]; // If manual mode
  artisanImported?: boolean;        // Was data imported from Artisan
  artisanFilePath?: string;         // Original Artisan CSV path
}

/** 'auto' and 'manual' are the machine's two modes. 'auto-*' values exist on legacy rows only. */
export type HottopMode = 'auto' | 'manual' | 'auto-light' | 'auto-medium' | 'auto-dark';

export interface HottopTempDataPoint {
  time: number;                     // Seconds elapsed from start
  beanTemp: number;                 // Bean temperature in Celsius
  environmentalTemp?: number;       // Environmental/inlet temp (optional)
  rateOfRise?: number;              // RoR in °C/min (calculated)
  timestamp: number;                // Unix timestamp of recording
}

export interface HottopManualControl {
  time: number;                     // Seconds elapsed from start
  heatPercent: number;              // Heat power 0-100%
  fanPercent: number;               // Fan speed 0-100%
  timestamp: number;                // Unix timestamp of change
}

/**
 * Union type for all roast data modes
 * Discriminated by 'mode' property for type-safe handling
 */
export type RoastData =
  | DualTempRoastData
  | ProfileBasedRoastData
  | HeatFanRoastData
  | ManualRoastData
  | PopcornPopperData
  | HottopRoastData;

