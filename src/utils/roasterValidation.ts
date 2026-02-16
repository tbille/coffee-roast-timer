/**
 * Roaster Validation Utilities
 * Validate roaster types and roast data structures
 */

import type { RoasterType } from '@/types/roaster.types';
import type { 
  RoastData,
  DualTempRoastData,
  ProfileBasedRoastData,
  HeatFanRoastData,
  ManualRoastData 
} from '@/types/roast-data.types';
import { ROASTER_SPECS } from './roasterRegistry';

/**
 * Valid roaster type identifiers
 */
const VALID_ROASTER_TYPES: RoasterType[] = [
  'gene-cbr-101',
  'behmor-2000ab',
  'freshroast-sr540',
  'freshroast-sr800',
  'kaldi-wide',
  'kaldi-fortis',
  'kaldi-mini',
  'hottop-kn8828',
  'popcorn-popper',
  'other-manual',
  'other-electric',
  'custom'
];

/**
 * Type guard to check if a string is a valid roaster type
 * @param type - String to validate
 * @returns True if type is valid RoasterType
 */
export function isValidRoasterType(type: string): type is RoasterType {
  return VALID_ROASTER_TYPES.includes(type as RoasterType);
}

/**
 * Validate roast data structure matches roaster type
 * @param roasterType - Roaster type
 * @param data - Roast data to validate
 * @returns True if data is valid for the roaster type
 */
export function validateRoastData(roasterType: RoasterType, data: any): data is RoastData {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  // Check based on roaster control type
  const spec = ROASTER_SPECS[roasterType];
  if (!spec) {
    return false;
  }
  
  switch (spec.controlType) {
    case 'dual-temperature':
      return validateDualTempData(data);
    case 'profile-based':
      return validateProfileBasedData(data);
    case 'heat-fan-control':
      return validateHeatFanData(data);
    case 'manual-simple':
      return validateManualData(data);
    default:
      return false;
  }
}

/**
 * Validate dual temperature roast data (Gene CBR-101)
 */
function validateDualTempData(data: any): data is DualTempRoastData {
  if (data.mode !== 'dual-temperature') {
    return false;
  }
  
  // Check required fields
  if (typeof data.startTime !== 'number') {
    return false;
  }
  
  if (!Array.isArray(data.temperatureData)) {
    return false;
  }
  
  if (!Array.isArray(data.crackEvents)) {
    return false;
  }
  
  // Validate temperature data points
  for (const point of data.temperatureData) {
    if (
      typeof point.time !== 'number' ||
      typeof point.targetTemp !== 'number' ||
      typeof point.currentTemp !== 'number' ||
      typeof point.timestamp !== 'number'
    ) {
      return false;
    }
  }
  
  // Validate crack events
  for (const event of data.crackEvents) {
    if (
      typeof event.time !== 'number' ||
      typeof event.timestamp !== 'number' ||
      (event.type !== 'first' && event.type !== 'second')
    ) {
      return false;
    }
  }
  
  return true;
}

/**
 * Validate profile-based roast data (Behmor)
 */
function validateProfileBasedData(data: any): data is ProfileBasedRoastData {
  if (data.mode !== 'profile-based') {
    return false;
  }
  
  // Check required fields
  if (typeof data.startTime !== 'number') {
    return false;
  }
  
  const validProfiles = ['P1', 'P2', 'P3', 'P4', 'P5', 'Manual'];
  if (!validProfiles.includes(data.profile)) {
    return false;
  }
  
  if (typeof data.baseDuration !== 'number' || data.baseDuration <= 0) {
    return false;
  }
  
  if (!Array.isArray(data.extensions)) {
    return false;
  }
  
  if (!Array.isArray(data.crackEvents)) {
    return false;
  }
  
  // Validate extensions
  for (const ext of data.extensions) {
    if (
      typeof ext.time !== 'number' ||
      typeof ext.duration !== 'number' ||
      typeof ext.timestamp !== 'number'
    ) {
      return false;
    }
  }
  
  // Validate optional temperature data
  if (data.temperatureData !== undefined) {
    if (!Array.isArray(data.temperatureData)) {
      return false;
    }
    
    for (const point of data.temperatureData) {
      if (
        typeof point.time !== 'number' ||
        typeof point.temp !== 'number' ||
        typeof point.timestamp !== 'number'
      ) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Validate heat/fan control roast data (FreshRoast)
 */
function validateHeatFanData(data: any): data is HeatFanRoastData {
  if (data.mode !== 'heat-fan-control') {
    return false;
  }
  
  if (typeof data.startTime !== 'number') {
    return false;
  }
  
  if (!Array.isArray(data.settingChanges)) {
    return false;
  }
  
  if (!Array.isArray(data.crackEvents)) {
    return false;
  }
  
  const validLevels = ['Low', 'Medium', 'High'];
  
  // Validate setting changes
  for (const change of data.settingChanges) {
    if (
      typeof change.time !== 'number' ||
      !validLevels.includes(change.heatLevel) ||
      !validLevels.includes(change.fanSpeed) ||
      typeof change.timestamp !== 'number'
    ) {
      return false;
    }
  }
  
  return true;
}

/**
 * Validate manual roast data (KALDI, etc.)
 */
function validateManualData(data: any): data is ManualRoastData {
  if (data.mode !== 'manual-simple') {
    return false;
  }
  
  if (typeof data.startTime !== 'number') {
    return false;
  }
  
  if (!Array.isArray(data.temperatureData)) {
    return false;
  }
  
  if (!Array.isArray(data.crackEvents)) {
    return false;
  }
  
  const validMethods = ['manual', 'voice', 'auto'];
  
  // Validate temperature data
  for (const point of data.temperatureData) {
    if (
      typeof point.time !== 'number' ||
      typeof point.temp !== 'number' ||
      !validMethods.includes(point.recordMethod) ||
      typeof point.timestamp !== 'number'
    ) {
      return false;
    }
  }
  
  return true;
}

/**
 * Validate batch weight against roaster capacity
 * @param roasterType - Roaster type
 * @param weight - Batch weight in grams
 * @returns Validation result with warnings
 */
export function validateBatchCapacity(
  roasterType: RoasterType,
  weight: number
): {
  valid: boolean;
  level: 'ok' | 'warning' | 'error';
  message?: string;
} {
  const spec = ROASTER_SPECS[roasterType];
  if (!spec) {
    return { valid: true, level: 'ok' };
  }
  
  if (weight < spec.minBatchSize) {
    return {
      valid: false,
      level: 'error',
      message: `Batch too small. Minimum: ${spec.minBatchSize}g`
    };
  }
  
  if (weight > spec.maxBatchSize) {
    return {
      valid: false,
      level: 'error',
      message: `Batch too large. Maximum: ${spec.maxBatchSize}g`
    };
  }
  
  // Warning if significantly different from recommended
  const deviation = Math.abs(weight - spec.recommendedBatchSize) / spec.recommendedBatchSize;
  if (deviation > 0.3) {
    return {
      valid: true,
      level: 'warning',
      message: `Recommended batch size: ${spec.recommendedBatchSize}g for best results`
    };
  }
  
  return { valid: true, level: 'ok' };
}

/**
 * Validate roast duration against typical range
 * @param roasterType - Roaster type
 * @param durationSeconds - Roast duration in seconds
 * @returns Validation result with warnings
 */
export function validateDuration(
  roasterType: RoasterType,
  durationSeconds: number
): {
  valid: boolean;
  level: 'ok' | 'warning' | 'error';
  message?: string;
} {
  const spec = ROASTER_SPECS[roasterType];
  if (!spec) {
    return { valid: true, level: 'ok' };
  }
  
  const { min, max } = spec.typicalDuration;
  
  if (durationSeconds < min * 0.5) {
    return {
      valid: true,
      level: 'warning',
      message: `Very short roast. Typical: ${Math.floor(min / 60)}-${Math.floor(max / 60)} min`
    };
  }
  
  if (durationSeconds > max * 1.5) {
    return {
      valid: true,
      level: 'warning',
      message: `Very long roast. Typical: ${Math.floor(min / 60)}-${Math.floor(max / 60)} min`
    };
  }
  
  return { valid: true, level: 'ok' };
}

/**
 * Validate temperature reading
 * @param temp - Temperature in Celsius
 * @returns True if temperature is in reasonable range
 */
export function validateTemperature(temp: number): boolean {
  // Reasonable range for coffee roasting: 20°C - 250°C
  return temp >= 20 && temp <= 300;
}

/**
 * Validate crack event timing
 * @param firstCrackTime - First crack time in seconds
 * @param secondCrackTime - Second crack time in seconds (optional)
 * @returns Validation result
 */
export function validateCrackTiming(
  firstCrackTime?: number,
  secondCrackTime?: number
): {
  valid: boolean;
  message?: string;
} {
  if (firstCrackTime === undefined) {
    return { valid: true };
  }
  
  if (firstCrackTime < 0) {
    return {
      valid: false,
      message: 'First crack time must be positive'
    };
  }
  
  if (secondCrackTime !== undefined) {
    if (secondCrackTime <= firstCrackTime) {
      return {
        valid: false,
        message: 'Second crack must occur after first crack'
      };
    }
    
    const timeBetween = secondCrackTime - firstCrackTime;
    if (timeBetween < 30) {
      return {
        valid: true,
        message: 'Very short time between cracks - double check timing'
      };
    }
  }
  
  return { valid: true };
}
