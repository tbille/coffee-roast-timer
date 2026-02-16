/**
 * RoasterContext - Shared roaster state across components
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { RoasterType } from '@/types/roaster.types';
import { useRoasterPreferences } from '@/hooks/useRoasterPreferences';
import { useAuth } from '@/hooks/useAuth';

const ROASTER_MODE_KEY = 'current_roaster_type';

interface RoasterContextType {
  currentRoaster: RoasterType;
  switchRoaster: (roasterType: RoasterType) => void;
}

const RoasterContext = createContext<RoasterContextType | undefined>(undefined);

export function RoasterProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { primaryRoaster, lastUsedRoaster } = useRoasterPreferences(user?.id);
  
  /**
   * Determine initial roaster with fallback hierarchy
   */
  const getInitialRoaster = (): RoasterType => {
    const stored = localStorage.getItem(ROASTER_MODE_KEY);
    if (stored) return stored as RoasterType;
    if (primaryRoaster) return primaryRoaster.roaster_type;
    if (lastUsedRoaster) return lastUsedRoaster.roaster_type;
    return 'gene-cbr-101';
  };
  
  const [currentRoaster, setCurrentRoaster] = useState<RoasterType>(getInitialRoaster);
  
  // Update when preferences load
  useEffect(() => {
    const stored = localStorage.getItem(ROASTER_MODE_KEY);
    if (!stored) {
      if (primaryRoaster) {
        setCurrentRoaster(primaryRoaster.roaster_type);
      } else if (lastUsedRoaster) {
        setCurrentRoaster(lastUsedRoaster.roaster_type);
      }
    }
  }, [primaryRoaster, lastUsedRoaster]);
  
  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(ROASTER_MODE_KEY, currentRoaster);
  }, [currentRoaster]);
  
  const switchRoaster = (roasterType: RoasterType) => {
    setCurrentRoaster(roasterType);
  };
  
  return (
    <RoasterContext.Provider value={{ currentRoaster, switchRoaster }}>
      {children}
    </RoasterContext.Provider>
  );
}

export function useRoaster() {
  const context = useContext(RoasterContext);
  if (!context) {
    throw new Error('useRoaster must be used within RoasterProvider');
  }
  return context;
}
