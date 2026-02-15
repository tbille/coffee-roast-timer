// TypeScript type definitions for roast profiles

import { type TemperatureUnit } from '@/utils/temperatureConversion';

export interface RoastData {
  time: number;
  targetTemp: number;
  currentTemp: number;
}

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
  coffee_roaster?: string;
  initial_weight?: number;
  final_weight?: number;
  duration_seconds: number;
  temperature_data: RoastData[];
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
