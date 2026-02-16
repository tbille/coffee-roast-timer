/**
 * Utility functions for determining how to display roaster information
 */

import { type RoasterType } from '@/types/roaster.types';
import { ROASTER_SPECS } from './roasterRegistry';

/**
 * Check if a roaster has a built-in temperature display
 * If false, temperature graph should be collapsible with context note
 */
export function hasBuiltInTemperatureDisplay(roasterType: RoasterType): boolean {
  const spec = ROASTER_SPECS[roasterType];
  return spec?.hasTemperatureDisplay ?? false;
}

/**
 * Get context note for temperature graph based on roaster type
 */
export function getTemperatureGraphContextNote(roasterType: RoasterType): string | null {
  const hasDisplay = hasBuiltInTemperatureDisplay(roasterType);
  
  if (hasDisplay) {
    return null; // No note needed
  }
  
  const spec = ROASTER_SPECS[roasterType];
  const roasterName = spec?.displayName || roasterType;
  
  // Return context note based on roaster type
  switch (roasterType) {
    case 'behmor-2000ab':
      return `The ${roasterName} doesn't have a built-in thermometer. Temperature data shown is from an external probe (if used). Focus on timing, profiles, and sensory cues.`;
    
    case 'popcorn-popper':
      return `Most popcorn popper roasts don't track temperature. Focus on timing milestones, visual cues (bean color), and sounds (crack events) instead.`;
    
    case 'freshroast-sr800':
    case 'freshroast-sr540':
      return `The ${roasterName} doesn't have a temperature display. Temperature data shown is from an external probe (if used). Use heat/fan settings and timing as your primary guides.`;
    
    case 'kaldi-wide':
    case 'kaldi-fortis':
    case 'kaldi-mini':
    case 'other-manual':
      return `Manual roasters typically don't have temperature displays. Temperature data shown is from an external probe (if used). Rely on visual cues and timing milestones.`;
    
    case 'other-electric':
    case 'custom':
      return `Temperature data shown is from an external probe (if used). Check if your roaster has temperature display capability.`;
    
    default:
      return `This roaster doesn't have a built-in temperature display. Temperature data shown is from an external probe (if used).`;
  }
}

/**
 * Determine if temperature graph should be shown by default
 */
export function shouldShowTemperatureGraphByDefault(
  roasterType: RoasterType,
  hasTemperatureData: boolean
): boolean {
  // Always show if roaster has built-in display
  if (hasBuiltInTemperatureDisplay(roasterType)) {
    return true;
  }
  
  // For roasters without display, only show if there's actual temperature data
  return hasTemperatureData;
}

/**
 * Get recommended focus areas for replication based on roaster type
 */
export function getReplicationFocusAreas(roasterType: RoasterType): string[] {
  const spec = ROASTER_SPECS[roasterType];
  
  if (!spec) {
    return ['Timing milestones', 'Sensory checkpoints'];
  }
  
  const areas: string[] = [];
  
  // Temperature control roasters
  if (spec.hasTemperatureDisplay) {
    areas.push('Temperature adjustments');
  }
  
  // Profile-based roasters
  if (spec.hasBuiltInProfiles) {
    areas.push('Profile selection', 'Time extensions');
  }
  
  // Manual control roasters
  if (spec.controlType === 'heat-fan-control') {
    areas.push('Heat/fan settings');
  }
  
  // Always important
  areas.push('Timing milestones', 'Sensory checkpoints');
  
  return areas;
}
