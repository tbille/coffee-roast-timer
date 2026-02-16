/**
 * Data Migration: Roaster Types
 * Migrates existing roast profiles to new roaster_type and roaster_data format
 * Runs once per user on app load
 */

import { supabase } from '@/integrations/supabase/client';
import { detectRoasterType } from '@/utils/roasterDetection';
import type { RoasterType } from '@/types/roaster.types';
import type { DualTempRoastData } from '@/types/roast-data.types';

const MIGRATION_FLAG_KEY = 'roaster_migration_v1_complete';

/**
 * Check if migration has already run for this user
 */
export function isMigrationComplete(): boolean {
  return localStorage.getItem(MIGRATION_FLAG_KEY) === 'true';
}

/**
 * Mark migration as complete
 */
function setMigrationComplete() {
  localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
}

/**
 * Convert legacy temperature data to new format
 */
function convertLegacyData(profile: any, roasterType: RoasterType): any {
  // For Gene CBR-101 (most common), convert to DualTempRoastData
  if (roasterType === 'gene-cbr-101') {
    const roastData: DualTempRoastData = {
      mode: 'dual-temperature',
      startTime: new Date(profile.created_at).getTime(),
      endTime: new Date(profile.created_at).getTime() + (profile.duration_seconds * 1000),
      temperatureData: Array.isArray(profile.temperature_data) 
        ? profile.temperature_data.map((point: any) => ({
            time: point.time || 0,
            targetTemp: point.targetTemp || 0,
            currentTemp: point.currentTemp || 0,
            timestamp: new Date(profile.created_at).getTime() + ((point.time || 0) * 1000)
          }))
        : [],
      crackEvents: Array.isArray(profile.crack_events)
        ? profile.crack_events.map((event: any) => ({
            time: event.time || 0,
            type: event.type || 'first',
            targetTemp: event.targetTemp,
            currentTemp: event.currentTemp,
            timestamp: new Date(profile.created_at).getTime() + ((event.time || 0) * 1000)
          }))
        : []
    };
    return roastData;
  }
  
  // For other roasters, create minimal data structure
  return {
    mode: 'manual-simple',
    startTime: new Date(profile.created_at).getTime(),
    endTime: new Date(profile.created_at).getTime() + (profile.duration_seconds * 1000),
    temperatureData: [],
    crackEvents: Array.isArray(profile.crack_events) ? profile.crack_events : []
  };
}

/**
 * Migrate a single profile
 */
async function migrateProfile(profile: any): Promise<{ success: boolean; error?: string }> {
  try {
    // Detect roaster type from coffee_roaster field
    const detectedType = detectRoasterType(profile.coffee_roaster);
    
    // Convert legacy data to new format
    const roasterData = convertLegacyData(profile, detectedType);
    
    // Update the profile
    const { error } = await supabase
      .from('roast_profiles')
      .update({
        roaster_type: detectedType,
        roaster_data: roasterData
      })
      .eq('id', profile.id);
    
    if (error) {
      console.error(`Failed to migrate profile ${profile.id}:`, error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error migrating profile ${profile.id}:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Main migration function
 * Migrates all user's profiles to new format
 */
export async function migrateUserProfiles(userId: string): Promise<{
  success: boolean;
  migrated: number;
  errors: number;
  skipped: number;
}> {
  try {
    console.log('[Migration] Starting profile migration for user:', userId);
    
    // Fetch all profiles that need migration (missing roaster_type or roaster_data)
    const { data: profiles, error: fetchError } = await supabase
      .from('roast_profiles')
      .select('*')
      .eq('user_id', userId)
      .or('roaster_type.is.null,roaster_data.is.null');
    
    if (fetchError) {
      console.error('[Migration] Failed to fetch profiles:', fetchError);
      return { success: false, migrated: 0, errors: 1, skipped: 0 };
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('[Migration] No profiles need migration');
      setMigrationComplete();
      return { success: true, migrated: 0, errors: 0, skipped: 0 };
    }
    
    console.log(`[Migration] Found ${profiles.length} profiles to migrate`);
    
    let migrated = 0;
    let errors = 0;
    let skipped = 0;
    
    // Migrate each profile
    for (const profile of profiles) {
      // Skip if already has roaster_type and roaster_data
      if (profile.roaster_type && profile.roaster_data) {
        skipped++;
        continue;
      }
      
      const result = await migrateProfile(profile);
      
      if (result.success) {
        migrated++;
      } else {
        errors++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log(`[Migration] Complete: ${migrated} migrated, ${errors} errors, ${skipped} skipped`);
    
    // Mark migration as complete even if some errors occurred
    setMigrationComplete();
    
    return {
      success: errors === 0,
      migrated,
      errors,
      skipped
    };
  } catch (error) {
    console.error('[Migration] Fatal error:', error);
    return { success: false, migrated: 0, errors: 1, skipped: 0 };
  }
}

/**
 * Create or update user roaster preference based on migrated profiles
 */
export async function createDefaultRoasterPreference(userId: string): Promise<void> {
  try {
    // Find the most common roaster type in user's profiles
    const { data: profiles } = await supabase
      .from('roast_profiles')
      .select('roaster_type')
      .eq('user_id', userId)
      .not('roaster_type', 'is', null);
    
    if (!profiles || profiles.length === 0) {
      return;
    }
    
    // Count roaster types
    const typeCounts: Record<string, number> = {};
    profiles.forEach(p => {
      if (p.roaster_type) {
        typeCounts[p.roaster_type] = (typeCounts[p.roaster_type] || 0) + 1;
      }
    });
    
    // Find most common type
    const mostCommon = Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)[0];
    
    if (!mostCommon) return;
    
    const [roasterType, count] = mostCommon;
    
    // Create or update preference
    await supabase
      .from('user_roaster_preferences')
      .upsert({
        user_id: userId,
        roaster_type: roasterType,
        is_primary: true,
        usage_count: count,
        last_used_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,roaster_type'
      });
    
    console.log(`[Migration] Created preference for ${roasterType} (${count} roasts)`);
  } catch (error) {
    console.error('[Migration] Failed to create preference:', error);
  }
}
