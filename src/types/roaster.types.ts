/**
 * Roaster Type Definitions
 * Defines types for multi-roaster support across the application
 */

/**
 * Supported coffee roaster types
 * Each type corresponds to a specific roaster model or category
 */
export type RoasterType =
  | 'gene-cbr-101'       // Gene Cafe CBR-101 (existing users)
  | 'behmor-2000ab'      // Behmor 2000AB Plus (Phase 1)
  | 'freshroast-sr540'   // FreshRoast SR540 (future)
  | 'freshroast-sr800'   // FreshRoast SR800 (future)
  | 'kaldi-wide'         // KALDI Wide (future)
  | 'kaldi-fortis'       // KALDI Fortis (future)
  | 'kaldi-mini'         // KALDI Mini (future)
  | 'hottop-kn8828'      // Hottop KN-8828 (future)
  | 'popcorn-popper'     // Generic popcorn popper (future)
  | 'other-manual'       // Manual roasters (generic)
  | 'other-electric'     // Electric roasters (generic)
  | 'custom';            // Custom/unknown roaster

/**
 * Control paradigm for roaster UI
 * Determines the interface and interaction model for each roaster type
 */
export type ControlType =
  | 'dual-temperature'   // Gene CBR-101: Manual target/current temp tracking
  | 'profile-based'      // Behmor: Pre-programmed profiles with extensions
  | 'heat-fan-control'   // FreshRoast: Manual heat and fan speed adjustment
  | 'manual-simple';     // KALDI/Popcorn: Basic timer with optional temp

/**
 * Timer counting direction
 * Determines whether timer counts up from zero or down from a preset duration
 */
export type TimerMode = 'count-up' | 'countdown';

/**
 * Optional roaster capability
 * Describes a feature or capability of a roaster
 */
export interface RoasterCapability {
  id: string;
  name: string;
  description: string;
}

/**
 * One physical control on the machine, in the machine's own vocabulary
 * (SR800 heat dial 1–9, Hottop heat %, Gene setpoint °C, KALDI flame).
 * The console renders each as a Stepper; every change is logged as a ControlChange
 * with `control` = `id`.
 */
export interface RoasterControlSpec {
  /** Stable id stored in ControlChange.control ('heat', 'fan', 'setpoint', 'flame') */
  id: string;
  /** Sentence-case label shown on the stepper */
  label: string;
  min: number;
  max: number;
  step: number;
  /** '%' for percentages, '°C' for temperatures (converted for display), '' for plain levels */
  unit: '' | '%' | '°C';
  /** Starting value suggested in Setup */
  default: number;
  /** Colour hint for the label: heat or air (control tokens) */
  kind?: 'heat' | 'air';
}

/**
 * Complete roaster specification
 * Central data structure defining all characteristics of a roaster type
 */
export interface RoasterSpecification {
  // Identity
  id: RoasterType;
  name: string;                     // Short name: "Gene CBR-101"
  displayName: string;              // Full name: "Gene Cafe CBR-101"
  manufacturer: string;             // "Gene Cafe", "Behmor", etc.
  imageUrl?: string;                // Path to roaster image
  
  // Physical specifications
  maxBatchSize: number;             // Maximum batch capacity (grams)
  minBatchSize: number;             // Minimum batch capacity (grams)
  recommendedBatchSize: number;     // Optimal batch capacity (grams)
  
  // Timing characteristics
  typicalDuration: {
    min: number;                    // Typical minimum roast time (seconds)
    max: number;                    // Typical maximum roast time (seconds)
  };
  
  // Interface characteristics
  controlType: ControlType;         // UI paradigm to use
  timerMode: TimerMode;             // Count up or countdown
  hasTemperatureDisplay: boolean;   // Built-in temperature probe
  hasBuiltInProfiles: boolean;      // Pre-programmed roast profiles
  
  // Capabilities
  capabilities: RoasterCapability[];
  
  // User guidance
  tips: string[];                   // General tips for this roaster
  warnings: string[];               // Important warnings or limitations
  
  // Community metadata
  communitySize?: number;           // Estimated user count
  popularityRank?: number;          // 1 = most popular
  
  // Roast profile characteristics
  defaultProfile?: string;          // Default profile for Behmor-style roasters
  profileOptions?: string[];        // Available profiles (P1-P5 for Behmor)

  // Roast console
  /** True when the roast console has a mode for this machine */
  implemented?: boolean;
  /** Machine controls, in the machine's vocabulary (see RoasterControlSpec) */
  controls?: RoasterControlSpec[];
  /** The roaster has (or usually has) a bean probe: offers the Turning point event */
  probe?: boolean;
  /** Label of the temperature field in the console ("Bean temp", "Drum temp") */
  tempLabel?: string;
  /** Route of the machine guide under /how-to/roasters/... */
  guidePath?: string;
}

/**
 * User's roaster preference
 * Tracks which roasters a user owns and usage patterns
 */
export interface UserRoasterPreference {
  id: string;
  user_id: string;
  roaster_type: RoasterType;
  is_primary: boolean;              // User's default/primary roaster
  usage_count: number;              // Number of roasts completed
  last_used_at: string;             // ISO timestamp of last use
  created_at: string;               // ISO timestamp of creation
}

