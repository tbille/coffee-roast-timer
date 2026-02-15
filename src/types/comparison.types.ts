// Type definitions for profile comparison feature

import { RoastProfile, RoastStatistics } from './roast.types';

export interface ComparisonProfile {
  profile: RoastProfile;
  statistics: RoastStatistics;
  color: string; // Chart line color
}

export interface ComparisonData {
  profiles: ComparisonProfile[];
  maxProfiles: 2; // Limited to 2 for clean mobile UX per DESIGN_SPEC
}

// Chart colors for profiles (from DESIGN_SPEC)
export const COMPARISON_COLORS = {
  profile1: '#3B82F6', // blue-500
  profile2: '#F59E0B', // amber-500
} as const;

// Metric comparison result
export interface MetricComparison {
  name: string;
  label: string;
  value1: string | number | null;
  value2: string | number | null;
  difference?: number;
  unit?: string;
  lowerIsBetter?: boolean; // For determining arrow color (green vs red)
}

// Comparison statistics displayed
export type ComparisonMetric = 
  | 'duration'
  | 'firstCrackTime'
  | 'firstCrackTemp'
  | 'secondCrackTime'
  | 'secondCrackTemp'
  | 'developmentTime'
  | 'developmentRatio'
  | 'finalTemp'
  | 'weightLossPercent';

// Helper to get color by index
export const getComparisonColor = (index: number): string => {
  return index === 0 ? COMPARISON_COLORS.profile1 : COMPARISON_COLORS.profile2;
};

// Chart data point for comparison
export interface ComparisonChartDataPoint {
  time: number;
  profile1?: number;
  profile2?: number;
}
