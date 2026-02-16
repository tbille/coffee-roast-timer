/**
 * useRoasterMode Hook
 * Manages current roaster selection and mode switching
 */

import { useState, useEffect } from 'react';
import type { RoasterType } from '@/types/roaster.types';
import { useRoasterPreferences } from './useRoasterPreferences';
import { useAuth } from './useAuth';

const ROASTER_MODE_KEY = 'current_roaster_type';

/**
 * Hook for managing current roaster mode
 * Handles roaster selection with persistence and smart defaults
 * 
 * @returns Current roaster state and switcher function
 */
export function useRoasterMode() {
  const { user } = useAuth();
  const { primaryRoaster, lastUsedRoaster } = useRoasterPreferences(user?.id);
  
  /**
   * Determine initial roaster with fallback hierarchy:
   * 1. localStorage (current session)
   * 2. User's primary roaster
   * 3. User's last used roaster
   * 4. Default to Gene CBR-101 (existing user base)
   */
  const getInitialRoaster = (): RoasterType => {
    // Try localStorage first (most recent selection)
    const stored = localStorage.getItem(ROASTER_MODE_KEY);
    if (stored) {
      return stored as RoasterType;
    }
    
    // Try user's primary roaster
    if (primaryRoaster) {
      return primaryRoaster.roaster_type;
    }
    
    // Try last used roaster
    if (lastUsedRoaster) {
      return lastUsedRoaster.roaster_type;
    }
    
    // Default to Gene CBR-101 for backward compatibility
    return 'gene-cbr-101';
  };
  
  const [currentRoaster, setCurrentRoaster] = useState<RoasterType>(getInitialRoaster);
  
  // Update state when user preferences load
  useEffect(() => {
    const stored = localStorage.getItem(ROASTER_MODE_KEY);
    if (!stored) {
      // No stored preference, use user's default
      if (primaryRoaster) {
        setCurrentRoaster(primaryRoaster.roaster_type);
      } else if (lastUsedRoaster) {
        setCurrentRoaster(lastUsedRoaster.roaster_type);
      }
    }
  }, [primaryRoaster, lastUsedRoaster]);
  
  // Persist to localStorage whenever roaster changes
  useEffect(() => {
    localStorage.setItem(ROASTER_MODE_KEY, currentRoaster);
  }, [currentRoaster]);
  
  /**
   * Switch to a different roaster mode
   * Includes accessibility announcement for screen readers
   * 
   * @param roasterType - New roaster type to switch to
   */
  const switchRoaster = (roasterType: RoasterType) => {
    // Update state
    setCurrentRoaster(roasterType);
    
    // Announce to screen readers
    announceToScreenReader(`Switched to ${roasterType} mode`);
  };
  
  return {
    currentRoaster,
    switchRoaster,
  };
}

/**
 * Announce message to screen readers
 * Creates a temporary live region for accessibility
 * 
 * @param message - Message to announce
 */
function announceToScreenReader(message: string) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only'; // Screen reader only (visually hidden)
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement (1 second)
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
