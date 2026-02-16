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

  // Relations
  profiles?: {
    username?: string;
  };
}

export interface RoastStatistics {
  duration: number;
  firstCrackTime?: number;
  firstCrackTemp?: number;
  secondCrackTime?: number;
  secondCrackTemp?: number;
  finalTemp: number;
  weightLossPercent?: number;
  developmentTime?: number;
  developmentRatio?: number;
}
