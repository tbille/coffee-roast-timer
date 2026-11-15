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
