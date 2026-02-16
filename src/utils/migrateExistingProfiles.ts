/**
 * Utility functions to help migrate existing profiles to the new replication guidance system
 */

import { type RoastProfile, type RoastMilestone } from '@/types/roast.types';
import { generateDefaultMilestones, calculateDevelopmentStats } from './developmentCalculations';

/**
 * Check if a profile has the new replication guidance fields
 */
export function hasReplicationGuidance(profile: RoastProfile): boolean {
  return !!(profile.milestones && profile.milestones.length > 0) ||
         !!(profile.roaster_settings && Object.keys(profile.roaster_settings).length > 0) ||
         !!(profile.development_stats);
}

/**
 * Generate missing replication guidance fields for an existing profile
 * This helps backfill data for profiles created before the new system
 */
export function generateReplicationGuidance(profile: RoastProfile): {
  milestones?: RoastMilestone[];
  development_stats?: any;
  roaster_settings?: any;
} {
  const result: any = {};

  // Generate development stats if missing
  if (!profile.development_stats) {
    const stats = calculateDevelopmentStats(
      profile.duration_seconds,
      profile.milestones,
      profile.crack_events
    );
    if (stats) {
      result.development_stats = stats;
    }
  }

  // Generate milestones if missing
  if (!profile.milestones || profile.milestones.length === 0) {
    const firstCrackTime = profile.crack_events?.find(e => e.type === 'first')?.time;
    const milestones = generateDefaultMilestones(
      profile.duration_seconds,
      firstCrackTime
    );
    result.milestones = milestones;
  }

  // Generate basic roaster settings from temperature data if missing
  if (!profile.roaster_settings || Object.keys(profile.roaster_settings).length === 0) {
    if (profile.temperature_data && profile.temperature_data.length > 0 && profile.roaster_type) {
      // For temperature-based roasters (Gene Cafe, Hottop)
      if (['gene-cbr-101', 'hottop-kn8828'].includes(profile.roaster_type)) {
        // Find significant temperature changes (more than 5 degrees)
        const tempChanges: any[] = [];
        const data = profile.temperature_data;
        
        // Always add start
        tempChanges.push({
          time_seconds: data[0].time,
          target_temp_c: profile.temperature_unit === 'F' 
            ? Math.round((data[0].targetTemp - 32) * 5/9)
            : data[0].targetTemp,
          note: 'Starting temperature'
        });

        // Find changes
        for (let i = 1; i < data.length; i++) {
          const prevTemp = data[i-1].targetTemp;
          const currTemp = data[i].targetTemp;
          const tempDiff = Math.abs(currTemp - prevTemp);
          
          if (tempDiff >= 5) {
            tempChanges.push({
              time_seconds: data[i].time,
              target_temp_c: profile.temperature_unit === 'F'
                ? Math.round((currTemp - 32) * 5/9)
                : currTemp,
            });
          }
        }

        if (tempChanges.length > 1) {
          result.roaster_settings = {
            temperature_schedule: tempChanges
          };
        }
      }
    }
  }

  return result;
}

/**
 * Apply generated replication guidance to a profile (for display purposes)
 * Does not modify the original profile object
 */
export function enrichProfileWithGuidance(profile: RoastProfile): RoastProfile {
  if (hasReplicationGuidance(profile)) {
    return profile; // Already has guidance
  }

  const guidance = generateReplicationGuidance(profile);
  
  return {
    ...profile,
    milestones: guidance.milestones || profile.milestones,
    development_stats: guidance.development_stats || profile.development_stats,
    roaster_settings: guidance.roaster_settings || profile.roaster_settings,
  };
}
