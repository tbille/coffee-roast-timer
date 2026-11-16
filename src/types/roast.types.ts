// TypeScript type definitions for roast profiles

import { type TemperatureUnit } from '@/utils/temperatureConversion';
import { type RoasterType } from './roaster.types';
import { type RoastData as RoasterModeData } from './roast-data.types';

/**
 * @deprecated Use TemperatureDataPoint from roast-data.types instead
 * Kept for backward compatibility with existing code
 */
export interface RoastData {
  time: number;
  targetTemp: number;
  currentTemp: number;
}

/**
 * @deprecated Use CrackEvent from roast-data.types instead
 * Kept for backward compatibility with existing code
 */
export interface CrackEvent {
  time: number;
  targetTemp: number;
  currentTemp: number;
  type: 'first' | 'second';
}

export interface RoastProfile {
  id: string;
  user_id: string;
  beans_name: string;
  origin?: string;
  farm_name?: string;
  roast_process?: string;
  
  /**
   * @deprecated Use roaster_type instead for structured roaster identification
   * Kept for backward compatibility - still used for custom roasters
   */
  coffee_roaster?: string;
  
  initial_weight?: number;
  final_weight?: number;
  duration_seconds: number;
  
  /**
   * @deprecated Legacy temperature data format for Gene CBR-101
   * New roasts use roaster_data field instead
   */
  temperature_data: RoastData[];
  
  /**
   * @deprecated Legacy crack events format
   * New roasts store crack events in roaster_data
   */
  crack_events: CrackEvent[];
  
  notes?: string;
  created_at: string;
  updated_at?: string;
  temperature_unit: TemperatureUnit;

  // Cupping & Tasting Notes
  cupping_score?: number;
  cupping_date?: string;
  rest_days?: number;
  flavor_notes?: string;
  flavor_tags?: string[];
  brew_method?: string;
  roasted_bean_photo_url?: string;

  // Environmental Data (simplified - free-form text only)
  environmental_notes?: string;

  // NEW: Multi-roaster support fields
  /**
   * Structured roaster type identifier
   * Replaces free-text coffee_roaster field for better filtering and analytics
   */
  roaster_type: RoasterType;
  
  /**
   * Mode-specific roast data (JSONB in database)
   * Contains profile info, extensions, temperature data, etc.
   * Format depends on roaster_type
   */
  roaster_data: RoasterModeData;

  // NEW: Roast replication guidance fields
  /**
   * Structured roaster-specific settings for replication
   * Contains temperature schedules, profile configs, control schedules, starting conditions
   */
  roaster_settings?: RoasterSettings;
  
  /**
   * Time-stamped roast milestones with sensory cues
   * Helps users know what to expect at each stage
   */
  milestones?: RoastMilestone[];
  
  /**
   * Development phase statistics
   * Key metrics for roast quality and replication
   */
  development_stats?: DevelopmentStats;

  // Relations
  profiles?: {
    username?: string;
  };
}

// NEW: Roaster Settings Types for Replication Guidance

export interface TemperatureAdjustment {
  time_seconds: number;
  target_temp_c: number;
  note?: string;
}

export interface ProfileConfig {
  profile_name: string;  // "P1", "P2", "P3", etc. for Behmor
  base_duration_seconds: number;
  extensions?: Array<{
    at_time_remaining_seconds: number;
    add_seconds: number;
  }>;
}

export interface ControlChange {
  time_seconds: number;
  heat_level?: 'low' | 'medium' | 'high' | number;  // 0-100 or text
  fan_level?: 'low' | 'medium' | 'high' | number;
  drum_speed_rpm?: number;
  note?: string;
}

export interface StartingConditions {
  room_temp_c?: number;
  bean_temp_c?: number;
  humidity_percent?: number;
  altitude_m?: number;
  notes?: string;
}

export interface RoasterSettings {
  // For temperature-based roasters (Gene Cafe, Hottop)
  temperature_schedule?: TemperatureAdjustment[];
  
  // For profile-based roasters (Behmor)
  profile_config?: ProfileConfig;
  
  // For manual control roasters (FreshRoast, KALDI)
  control_schedule?: ControlChange[];
  
  // For all roasters
  starting_conditions?: StartingConditions;
  
  // Freeform instructions for "Other" roasters
  instructions?: string;
}

export type MilestoneType = 
  | 'yellowing' 
  | 'first_crack' 
  | 'development_start'
  | 'second_crack' 
  | 'drop'
  | 'custom';

export interface RoastMilestone {
  time_seconds: number;
  event_type: MilestoneType;
  label?: string;  // Custom label for display
  visual_cue?: string;
  audio_cue?: string;
  aroma_cue?: string;
  action_required?: string;
}

export interface DevelopmentStats {
  first_crack_time_seconds?: number;
  development_time_seconds?: number;  // Time from FC to drop
  development_ratio_percent?: number; // development / total * 100
  time_to_first_crack_seconds?: number;  // Total time to reach FC
}
