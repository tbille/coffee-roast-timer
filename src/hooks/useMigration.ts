/**
 * useMigration Hook
 * Handles one-time data migration for users
 */

import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { 
  isMigrationComplete, 
  migrateUserProfiles, 
  createDefaultRoasterPreference 
} from '@/lib/migrations/migrateToRoasterTypes';

export function useMigration() {
  const { user } = useAuth();
  const [migrationStatus, setMigrationStatus] = useState<{
    isRunning: boolean;
    isComplete: boolean;
    error?: string;
  }>({
    isRunning: false,
    isComplete: isMigrationComplete()
  });
  
  useEffect(() => {
    // Only run for logged-in users who haven't migrated yet
    if (!user || migrationStatus.isComplete || migrationStatus.isRunning) {
      return;
    }
    
    const runMigration = async () => {
      try {
        setMigrationStatus(prev => ({ ...prev, isRunning: true }));
        
        console.log('[useMigration] Starting migration...');
        
        // Run profile migration
        const result = await migrateUserProfiles(user.id);
        
        if (result.migrated > 0) {
          console.log(`[useMigration] Migrated ${result.migrated} profiles`);
          
          // Create default roaster preference
          await createDefaultRoasterPreference(user.id);
        }
        
        setMigrationStatus({
          isRunning: false,
          isComplete: true,
          error: result.success ? undefined : 'Some profiles failed to migrate'
        });
      } catch (error) {
        console.error('[useMigration] Migration failed:', error);
        setMigrationStatus({
          isRunning: false,
          isComplete: true, // Mark complete even on error to avoid infinite loops
          error: String(error)
        });
      }
    };
    
    // Run migration after a short delay to avoid blocking initial render
    const timer = setTimeout(runMigration, 1000);
    
    return () => clearTimeout(timer);
  }, [user, migrationStatus.isComplete, migrationStatus.isRunning]);
  
  return migrationStatus;
}
