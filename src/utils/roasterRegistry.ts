/**
 * Roaster Registry
 * Central database of all supported roaster specifications
 */

import type { RoasterType, RoasterSpecification } from '@/types/roaster.types';

/**
 * Complete roaster specifications database
 * Defines all characteristics, capabilities, and guidance for each supported roaster
 */
export const ROASTER_SPECS: Record<RoasterType, RoasterSpecification> = {
  'gene-cbr-101': {
    id: 'gene-cbr-101',
    name: 'Gene CBR-101',
    displayName: 'Gene Cafe CBR-101',
    manufacturer: 'Gene Cafe',
    imageUrl: '/assets/roasters/gene-cbr-101.png',
    
    // Physical specs
    maxBatchSize: 300,
    minBatchSize: 100,
    recommendedBatchSize: 225,
    
    // Timing
    typicalDuration: {
      min: 600,   // 10 minutes
      max: 1200   // 20 minutes
    },
    
    // Interface
    controlType: 'dual-temperature',
    timerMode: 'count-up',
    hasTemperatureDisplay: true,
    hasBuiltInProfiles: false,
    
    // Capabilities
    capabilities: [
      {
        id: 'dual-temp-tracking',
        name: 'Dual Temperature Tracking',
        description: 'Track both target and current temperature throughout the roast'
      },
      {
        id: 'precise-control',
        name: 'Precise Temperature Control',
        description: 'Adjust target temperature in 5°C increments during roast'
      },
      {
        id: 'transparent-drum',
        name: 'Transparent Drum',
        description: 'Visual monitoring of bean color development'
      }
    ],
    
    // User guidance
    tips: [
      'Start with target temp around 200°C for medium roasts',
      'First crack typically occurs between 8-12 minutes',
      'Adjust target temp during roast for finer control',
      'Keep batches between 200-250g for most consistent results',
      'Clean chaff collector after every 3-4 roasts'
    ],
    warnings: [
      'Do not exceed 300g batch size - may cause uneven roasting',
      'Allow 5 minutes cooling time between roasts',
      'Ensure adequate ventilation - produces smoke'
    ],
    
    // Community
    communitySize: 5000,
    popularityRank: 1
  },

  'behmor-2000ab': {
    id: 'behmor-2000ab',
    name: 'Behmor 2000AB',
    displayName: 'Behmor 2000AB Plus',
    manufacturer: 'Behmor',
    imageUrl: '/assets/roasters/behmor-2000ab.png',
    
    // Physical specs
    maxBatchSize: 454,  // 1 lb
    minBatchSize: 200,
    recommendedBatchSize: 340,  // 12 oz
    
    // Timing
    typicalDuration: {
      min: 840,    // 14 minutes (P1)
      max: 1380    // 23 minutes (P5 + extensions)
    },
    
    // Interface
    controlType: 'profile-based',
    timerMode: 'countdown',
    hasTemperatureDisplay: false,  // No built-in thermometer
    hasBuiltInProfiles: true,
    
    // Capabilities
    capabilities: [
      {
        id: 'profiles',
        name: 'Pre-Programmed Profiles',
        description: '5 built-in roast profiles (P1-P5) optimized for different roast levels'
      },
      {
        id: 'extensions',
        name: 'Time Extensions',
        description: 'Add up to 6 thirty-second extensions to extend roast time'
      },
      {
        id: 'large-capacity',
        name: 'Large Batch Capacity',
        description: 'Roast up to 1 pound of coffee at once'
      },
      {
        id: 'smoke-suppression',
        name: 'Smoke Suppression',
        description: 'Built-in afterburner reduces smoke output'
      }
    ],
    
    // User guidance
    tips: [
      'P3 (18 min) is ideal for medium roasts - great starting point',
      'First crack typically occurs at 12-15 minutes remaining',
      'Add 1-2 extensions after first crack for medium roasts',
      'P1-P2 for light roasts, P3-P4 for medium, P5 for dark',
      'Use 75-80% capacity (12 oz / 340g) for best results',
      'Cool beans immediately after roast - use colander or cooling tray'
    ],
    warnings: [
      'Manual mode requires close monitoring - use profiles for beginners',
      'Do not open door during roast - heat loss affects results',
      'Chaff can ignite - clean between roasts',
      'Allow 15 minutes cooling between back-to-back roasts'
    ],
    
    // Community
    communitySize: 8000,
    popularityRank: 2,
    
    // Behmor-specific
    defaultProfile: 'P3',
    profileOptions: ['P1', 'P2', 'P3', 'P4', 'P5', 'Manual']
  },

  'freshroast-sr800': {
    id: 'freshroast-sr800',
    name: 'FreshRoast SR800',
    displayName: 'FreshRoast SR800',
    manufacturer: 'FreshRoast',
    imageUrl: '/assets/roasters/freshroast-sr800.png',
    
    // Physical specs
    maxBatchSize: 150,
    minBatchSize: 50,
    recommendedBatchSize: 120,
    
    // Timing
    typicalDuration: {
      min: 360,   // 6 minutes
      max: 720    // 12 minutes
    },
    
    // Interface
    controlType: 'heat-fan-control',
    timerMode: 'countdown',
    hasTemperatureDisplay: false,
    hasBuiltInProfiles: false,
    
    // Capabilities
    capabilities: [
      {
        id: 'heat-control',
        name: 'Manual Heat Control',
        description: 'Adjust heat level (Low/Medium/High) during roast'
      },
      {
        id: 'fan-control',
        name: 'Manual Fan Control',
        description: 'Adjust fan speed (Low/Medium/High) during roast'
      },
      {
        id: 'compact',
        name: 'Compact Design',
        description: 'Small footprint perfect for apartments'
      }
    ],
    
    // User guidance
    tips: [
      'Start with high heat and medium fan',
      'Reduce heat after first crack to control development',
      'Small batches roast quickly - stay attentive',
      'Experiment with heat/fan combinations for different profiles'
    ],
    warnings: [
      'Small batch size - not suitable for bulk roasting',
      'Requires active monitoring and adjustments',
      'Limited capacity makes it less forgiving'
    ],
    
    // Community
    communitySize: 3000,
    popularityRank: 3
  },

  'freshroast-sr540': {
    id: 'freshroast-sr540',
    name: 'FreshRoast SR540',
    displayName: 'FreshRoast SR540',
    manufacturer: 'FreshRoast',
    imageUrl: '/assets/roasters/freshroast-sr540.png',
    
    // Physical specs (similar to SR800 but older model)
    maxBatchSize: 125,
    minBatchSize: 50,
    recommendedBatchSize: 100,
    
    // Timing
    typicalDuration: {
      min: 360,
      max: 720
    },
    
    // Interface
    controlType: 'heat-fan-control',
    timerMode: 'countdown',
    hasTemperatureDisplay: false,
    hasBuiltInProfiles: false,
    
    // Capabilities
    capabilities: [
      {
        id: 'basic-control',
        name: 'Basic Heat/Fan Control',
        description: 'Simple heat and fan speed adjustment'
      }
    ],
    
    // User guidance
    tips: ['Follow similar guidance as SR800', 'Slightly smaller batches than SR800'],
    warnings: ['Older model - may have less precise control'],
    
    // Community
    communitySize: 1500,
    popularityRank: 6
  },

  'kaldi-wide': {
    id: 'kaldi-wide',
    name: 'KALDI Wide',
    displayName: 'KALDI Wide',
    manufacturer: 'KALDI',
    imageUrl: '/assets/roasters/kaldi-wide.png',
    
    // Physical specs
    maxBatchSize: 300,
    minBatchSize: 100,
    recommendedBatchSize: 200,
    
    // Timing
    typicalDuration: {
      min: 600,
      max: 1200
    },
    
    // Interface
    controlType: 'manual-simple',
    timerMode: 'count-up',
    hasTemperatureDisplay: false,
    hasBuiltInProfiles: false,
    
    // Capabilities
    capabilities: [
      {
        id: 'manual-control',
        name: 'Manual Heat Control',
        description: 'Direct flame control for hands-on roasting'
      },
      {
        id: 'mechanical',
        name: 'Mechanical Simplicity',
        description: 'No electronics - pure mechanical roasting'
      }
    ],
    
    // User guidance
    tips: [
      'Use voice input for hands-free temperature recording while cranking',
      'Say "one hundred ninety two" to record 192°C, or "first crack" for events',
      'Enable auto-record timer for regular temperature logging',
      'Focus on smell and sound cues while cranking',
      'Wind affects heat significantly when roasting outdoors',
      'Maintain steady cranking rhythm (2-3 RPM)',
      'Consider environmental factors in your notes'
    ],
    warnings: [
      'Both hands busy cranking - use auto-record feature',
      'External heat source required',
      'Temperature probe required',
      'Use outdoors or with excellent ventilation'
    ],
    
    // Community
    communitySize: 2000,
    popularityRank: 4
  },

  'kaldi-fortis': {
    id: 'kaldi-fortis',
    name: 'KALDI Fortis',
    displayName: 'KALDI Fortis',
    manufacturer: 'KALDI',
    imageUrl: '/assets/roasters/kaldi-fortis.png',
    
    // Physical specs
    maxBatchSize: 300,
    minBatchSize: 100,
    recommendedBatchSize: 200,
    
    // Timing
    typicalDuration: {
      min: 600,
      max: 1200
    },
    
    // Interface
    controlType: 'manual-simple',
    timerMode: 'count-up',
    hasTemperatureDisplay: false,
    hasBuiltInProfiles: false,
    
    // Capabilities
    capabilities: [
      {
        id: 'motorized',
        name: 'Motorized Drum',
        description: 'Electric motor for consistent rotation'
      }
    ],
    
    // User guidance
    tips: ['Similar to KALDI Wide with motorized convenience'],
    warnings: ['Requires manual heat source'],
    
    // Community
    communitySize: 1000,
    popularityRank: 7
  },

  'kaldi-mini': {
    id: 'kaldi-mini',
    name: 'KALDI Mini',
    displayName: 'KALDI Mini',
    manufacturer: 'KALDI',
    imageUrl: '/assets/roasters/kaldi-mini.png',
    
    // Physical specs
    maxBatchSize: 200,
    minBatchSize: 50,
    recommendedBatchSize: 120,
    
    // Timing
    typicalDuration: {
      min: 480,
      max: 960
    },
    
    // Interface
    controlType: 'manual-simple',
    timerMode: 'count-up',
    hasTemperatureDisplay: false,
    hasBuiltInProfiles: false,
    
    // Capabilities
    capabilities: [
      {
        id: 'compact',
        name: 'Compact Size',
        description: 'Smaller version ideal for sample roasting'
      }
    ],
    
    // User guidance
    tips: ['Perfect for sample roasting and experimentation'],
    warnings: ['Smaller batches only'],
    
    // Community
    communitySize: 800,
    popularityRank: 8
  },

  'hottop-kn8828': {
    id: 'hottop-kn8828',
    name: 'Hottop KN-8828',
    displayName: 'Hottop KN-8828B-2K+',
    manufacturer: 'Hottop',
    imageUrl: '/assets/roasters/hottop-kn8828.png',
    
    // Physical specs
    maxBatchSize: 300,
    minBatchSize: 100,
    recommendedBatchSize: 250,
    
    // Timing
    typicalDuration: {
      min: 600,
      max: 1200
    },
    
    // Interface
    controlType: 'dual-temperature',
    timerMode: 'count-up',
    hasTemperatureDisplay: true,
    hasBuiltInProfiles: true,
    
    // Capabilities
    capabilities: [
      {
        id: 'advanced',
        name: 'Advanced Controls',
        description: 'Professional-grade control over all roast parameters'
      },
      {
        id: 'programmable',
        name: 'Programmable Profiles',
        description: 'Create and save custom roast profiles'
      }
    ],
    
    // User guidance
    tips: ['Premium roaster with professional features', 'Excellent for serious home roasters'],
    warnings: ['Higher price point', 'Steep learning curve'],
    
    // Community
    communitySize: 1200,
    popularityRank: 5
  },

  'popcorn-popper': {
    id: 'popcorn-popper',
    name: 'Popcorn Popper',
    displayName: 'Air Popcorn Popper',
    manufacturer: 'Various',
    imageUrl: '/assets/roasters/popcorn-popper.png',
    
    // Physical specs
    maxBatchSize: 100,
    minBatchSize: 50,
    recommendedBatchSize: 75,
    
    // Timing
    typicalDuration: {
      min: 240,   // 4 minutes
      max: 480    // 8 minutes
    },
    
    // Interface
    controlType: 'manual-simple',
    timerMode: 'count-up',
    hasTemperatureDisplay: false,
    hasBuiltInProfiles: false,
    
    // Capabilities
    capabilities: [
      {
        id: 'budget',
        name: 'Budget-Friendly',
        description: 'Lowest cost entry into home roasting'
      },
      {
        id: 'fast',
        name: 'Fast Roasting',
        description: 'Quick roast times due to high heat and airflow'
      }
    ],
    
    // User guidance
    tips: [
      'Start with very small batches (50-60g)',
      'Roasts happen quickly - stay attentive',
      'Use outdoors or with excellent ventilation',
      'Preheat for 30 seconds before adding beans'
    ],
    warnings: [
      'Not designed for coffee roasting - use at own risk',
      'Limited control over temperature and roast profile',
      'Very small batch sizes',
      'Inconsistent results possible'
    ],
    
    // Community
    communitySize: 4000,
    popularityRank: 9
  },

  'other-manual': {
    id: 'other-manual',
    name: 'Manual Roaster',
    displayName: 'Manual/Stovetop Roaster',
    manufacturer: 'Various',
    
    // Physical specs (defaults)
    maxBatchSize: 200,
    minBatchSize: 50,
    recommendedBatchSize: 120,
    
    // Timing
    typicalDuration: {
      min: 480,
      max: 1200
    },
    
    // Interface
    controlType: 'manual-simple',
    timerMode: 'count-up',
    hasTemperatureDisplay: false,
    hasBuiltInProfiles: false,
    
    // Capabilities
    capabilities: [],
    
    // User guidance
    tips: ['Track temperature with external thermometer', 'Document your process for consistency'],
    warnings: ['Requires close attention and experience'],
    
    // Community
    popularityRank: 10
  },

  'other-electric': {
    id: 'other-electric',
    name: 'Electric Roaster',
    displayName: 'Other Electric Roaster',
    manufacturer: 'Various',
    
    // Physical specs (defaults)
    maxBatchSize: 250,
    minBatchSize: 100,
    recommendedBatchSize: 180,
    
    // Timing
    typicalDuration: {
      min: 600,
      max: 1200
    },
    
    // Interface
    controlType: 'dual-temperature',
    timerMode: 'count-up',
    hasTemperatureDisplay: false,
    hasBuiltInProfiles: false,
    
    // Capabilities
    capabilities: [],
    
    // User guidance
    tips: ['Refer to your roaster\'s manual for specific guidance'],
    warnings: [],
    
    // Community
    popularityRank: 11
  },

  'custom': {
    id: 'custom',
    name: 'Custom',
    displayName: 'Custom/Other Roaster',
    manufacturer: 'Various',
    
    // Physical specs (defaults)
    maxBatchSize: 250,
    minBatchSize: 100,
    recommendedBatchSize: 180,
    
    // Timing
    typicalDuration: {
      min: 600,
      max: 1200
    },
    
    // Interface
    controlType: 'manual-simple',
    timerMode: 'count-up',
    hasTemperatureDisplay: false,
    hasBuiltInProfiles: false,
    
    // Capabilities
    capabilities: [],
    
    // User guidance
    tips: ['Document your roasting process for consistency', 'Consider upgrading to a dedicated roaster'],
    warnings: [],
    
    // Community
    popularityRank: 12
  }
};

/**
 * Get roaster specification by type
 * @param type - Roaster type identifier
 * @returns Roaster specification object
 * @throws Error if roaster type not found
 */
export function getRoasterSpec(type: RoasterType): RoasterSpecification {
  const spec = ROASTER_SPECS[type];
  if (!spec) {
    throw new Error(`Unknown roaster type: ${type}`);
  }
  return spec;
}

/**
 * Get list of popular/featured roasters for onboarding
 * Returns roasters sorted by popularity
 * @param limit - Maximum number of roasters to return (default: 4)
 * @returns Array of roaster specifications
 */
export function getPopularRoasters(limit: number = 4): RoasterSpecification[] {
  return Object.values(ROASTER_SPECS)
    .filter(spec => spec.popularityRank !== undefined)
    .sort((a, b) => (a.popularityRank || 99) - (b.popularityRank || 99))
    .slice(0, limit);
}

/**
 * Get all supported roaster types
 * @returns Array of all roaster type identifiers
 */
export function getAllRoasterTypes(): RoasterType[] {
  return Object.keys(ROASTER_SPECS) as RoasterType[];
}

/**
 * Check if a roaster type is valid/supported
 * @param type - String to check
 * @returns True if type is supported
 */
export function isValidRoasterType(type: string): type is RoasterType {
  return type in ROASTER_SPECS;
}
