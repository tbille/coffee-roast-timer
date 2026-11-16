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
    // Manual: "Capacity Max. 0.5 lbs / 250 g"
    maxBatchSize: 250,
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
        description: 'Set the target temperature in one-degree steps, 0–250 °C (0–482 °F), during the roast'
      },
      {
        id: 'transparent-drum',
        name: 'Transparent Drum',
        description: 'Visual monitoring of bean color development'
      }
    ],
    
    // User guidance
    tips: [
      'The TEMP dial sets 0–250 °C (0–482 °F) in one-degree steps. Log each turn so you can repeat it',
      'The TIME dial sets 0–30 minutes in 6-second steps (it starts at 15:00) and can add time during the roast',
      'The manual suggests 230–250 °C; many owners run near 250 °C until first crack, then turn it down',
      'The temperature on the display is the air leaving the drum, not the beans',
      'Keep batches between 200-250g for most consistent results',
      'Clean chaff collector after every 3-4 roasts'
    ],
    warnings: [
      'Do not exceed 250 g (the fill line on the chamber)',
      'The manual asks for an hour of cooling before a second batch; check your manual if you roast back-to-back',
      'Ensure adequate ventilation - produces smoke'
    ],
    
    // Community
    communitySize: 5000,
    popularityRank: 1,

    implemented: true,
    controls: [
      { id: 'setpoint', label: 'Setpoint', min: 0, max: 250, step: 1, unit: '°C', default: 240, kind: 'heat' },
    ],
    tempLabel: 'Drum temp',
    guidePath: '/how-to/roasters/gene-cafe-cbr-101',
  },

  'behmor-2000ab': {
    id: 'behmor-2000ab',
    name: 'Behmor 2000AB',
    displayName: 'Behmor 2000AB Plus',
    manufacturer: 'Behmor',
    imageUrl: '/assets/roasters/behmor-2000ab.png',
    
    // Physical specs
    maxBatchSize: 454,  // 1 lb
    minBatchSize: 113,  // 1/4 lb weight button
    recommendedBatchSize: 340,  // 12 oz
    
    // Timing
    typicalDuration: {
      min: 510,    // 8:30, 1/4 lb default
      max: 1230    // 20:30, the P1 1 lb maximum the panel allows
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
        description: 'Five programs (P1-P5) that change how heat is applied over the time set by the weight button'
      },
      {
        id: 'extensions',
        name: 'Added time',
        description: 'Press + during the roast to add 15 seconds, up to the maximum for the program and weight'
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
      'The weight button sets the starting time on the display. Standard defaults: 8:30 for 1/4 lb, 12:00 for 1/2 lb, 18:00 for 1 lb',
      'P1 is the default program. Programs change how heat is applied, not the length of the roast',
      'Each press of + adds 15 seconds and each press of − takes off 10 seconds. The panel caps total time per program and weight (20:30 for P1 at 1 lb)',
      'With P3-P5 you will usually need to add time with + before the roast finishes',
      'After Start, pressing P1-P5 switches to manual power: P1 0%, P2 25%, P3 50%, P4 75%, P5 100%. D changes drum speed',
      'The manual keeps P4-P5 for the drying phase; after first crack they can scorch the beans',
      'At 75% of the default time the timer blinks and beeps: press Start within about 30 seconds or it goes into cooling (Err 7)',
      'Around 340 g (12 oz) leaves more room to steer than a full pound',
      'Cool beans immediately after roast - use colander or cooling tray'
    ],
    warnings: [
      'Never roast more than a few seconds into second crack in a Behmor',
      'Do not open door during roast - heat loss affects results',
      'Chaff can ignite - clean between roasts',
      'Allow 15 minutes cooling between back-to-back roasts'
    ],
    
    // Community
    communitySize: 8000,
    popularityRank: 2,
    
    // Behmor-specific
    defaultProfile: 'P1',
    profileOptions: ['P1', 'P2', 'P3', 'P4', 'P5'],

    implemented: true,
    // Weight, program and starting time are chosen in Setup (BEHMOR_* below);
    // +time and manual P1-P5 / D presses are logged during the roast.
    controls: [],
    tempLabel: 'Probe temp',
    guidePath: '/how-to/roasters/behmor-2000ab',
  },

  'freshroast-sr800': {
    id: 'freshroast-sr800',
    name: 'FreshRoast SR800',
    displayName: 'FreshRoast SR800',
    manufacturer: 'FreshRoast',
    imageUrl: '/assets/roasters/freshroast-sr800.png',
    
    // Physical specs (8 oz / 226 g washed; ~170 g for chaffy dry-process coffee)
    maxBatchSize: 226,
    minBatchSize: 50,
    recommendedBatchSize: 170,
    
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
        name: 'Heat dial',
        description: 'Heat from 1 to 9, adjustable during the roast'
      },
      {
        id: 'fan-control',
        name: 'Fan dial',
        description: 'Fan from 1 to 9, adjustable during the roast'
      },
      {
        id: 'compact',
        name: 'Compact Design',
        description: 'Small footprint perfect for apartments'
      }
    ],
    
    // User guidance
    tips: [
      'Heat and fan each go from 1 to 9. Factory defaults are heat 9, fan 5, timer 6.0 minutes; the manual explains how to change them',
      'The timer counts down in tenths of a minute, up to 20 minutes. Add time before it reaches zero, or the roaster switches to cool',
      'Many roasters keep heat high and steer with the fan: lower fan means more heat in the beans',
      'With a full 8 oz load, start the fan high enough that the beans move, then lower it as they lose weight',
      'A fan left at 9 can keep the beans from ever reaching first crack',
      'Small batches roast quickly - stay attentive',
      'Experiment with heat and fan combinations for different beans'
    ],
    warnings: [
      'Up to 8 oz (226 g) of washed coffee, less for chaffy dry-process coffee. The extension tube helps the beans move but does not raise the batch limit',
      'Requires active monitoring and adjustments',
      'Limited capacity makes it less forgiving'
    ],
    
    // Community
    communitySize: 3000,
    popularityRank: 3,

    implemented: true,
    controls: [
      { id: 'heat', label: 'Heat', min: 1, max: 9, step: 1, unit: '', default: 9, kind: 'heat' },
      { id: 'fan', label: 'Fan', min: 1, max: 9, step: 1, unit: '', default: 5, kind: 'air' },
    ],
    tempLabel: 'Chamber temp',
    guidePath: '/how-to/roasters/freshroast-sr800',
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
        id: 'motorized-drum',
        name: 'Motorized drum',
        description: 'A small motor turns the drum; you control the gas burner'
      }
    ],
    
    // User guidance
    tips: [
      'Burners have no standard scale: log flame changes on a 1-10 scale of your own, and keep it the same between roasts',
      'Where your browser supports it, voice input can log a probe reading or first crack while your hands are busy',
      'The included thermometer reads the drum, not the beans; use it to repeat your own roasts',
      'Wind affects heat significantly when roasting outdoors',
      'Consider environmental factors in your notes'
    ],
    warnings: [
      'Your eyes and hands are on the burner - keep the phone where you can reach it',
      'Gas burner required, not included',
      'Use outdoors or with excellent ventilation'
    ],
    
    // Community
    communitySize: 2000,
    popularityRank: 4,

    implemented: true,
    controls: [
      { id: 'flame', label: 'Flame', min: 1, max: 10, step: 1, unit: '', default: 5, kind: 'heat' },
    ],
    probe: true,
    tempLabel: 'Probe temp',
    guidePath: '/how-to/roasters/kaldi-wide',
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
        id: 'auto-manual',
        name: 'Auto and manual modes',
        description: 'Auto runs the built-in program; manual lets you set heat (0-100%) and fan (0-10) at any time'
      }
    ],
    
    // User guidance
    tips: [
      'Auto mode runs the built-in program and adjusts heat and fan for you. It ejects at the target time or bean temperature (defaults 18:00 and 402 °F, maximum 25:00 and 412 °F)',
      'The panel sets heat in 1% steps; the app logs it in 10% steps, so round to the nearest 10',
      'The panel shows fan as 0-10 (10% steps): fan 6 on the panel is 60% in the app',
      'The display shows bean temperature (BT) and environment temperature (ET); log both if you can',
      'At 356 °F and 395 °F bean temperature the roaster beeps: press Enter or it ejects the beans',
      'A falling rate of rise approaching first crack is the usual target',
      'Compatible with Artisan for advanced analysis and profile import',
      'Keep batches between 200-250g for most even roasting',
      'First crack typically at 195-205°C depending on bean density'
    ],
    warnings: [
      'Premium roaster - requires investment ($1,500-2,000)',
      'Steeper learning curve than basic roasters',
      'Manual mode requires understanding of heat/fan interaction',
      'Regular cleaning essential for consistent performance'
    ],
    
    // Community
    communitySize: 1200,
    popularityRank: 5,

    implemented: true,
    controls: [
      { id: 'heat', label: 'Heat', min: 0, max: 100, step: 10, unit: '%', default: 100, kind: 'heat' },
      { id: 'fan', label: 'Fan', min: 0, max: 100, step: 10, unit: '%', default: 0, kind: 'air' },
    ],
    probe: true,
    tempLabel: 'Bean temp',
    guidePath: '/how-to/roasters/hottop-kn-8828',
  },

  'popcorn-popper': {
    id: 'popcorn-popper',
    name: 'Popcorn Popper',
    displayName: 'Air popcorn popper',
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
      'Most poppers take about 75-85 g; treat 100 g as a ceiling',
      'If the beans are not moving within 30 seconds, the batch is too big: stop and use fewer',
      'Roasts complete in 4-6 minutes - very fast, watch closely',
      'Listen for first crack around 3-4 minutes',
      'Stir occasionally for even roasting',
      'Cool beans immediately in metal colander after roasting',
      'Use outdoors or with excellent ventilation (produces smoke)',
      'Track color progression if you don\'t have a thermometer',
      'Poppers are not built for coffee and can wear out quickly',
      'Never leave unattended - fire risk is real'
    ],
    warnings: [
      'Fire hazard: an overloaded popper overheats, and chaff can catch fire',
      'Not designed for coffee roasting - use at your own risk',
      'Requires constant supervision - never leave unattended',
      'Produces significant smoke - outdoor use strongly recommended',
      'No temperature control - results vary',
      'Chaff can accumulate and ignite - clean after each use'
    ],
    
    // Community
    communitySize: 4000,
    popularityRank: 9,

    implemented: true,
    controls: [],
    tempLabel: 'Bean temp',
    guidePath: '/how-to/roasters/popcorn-popper',
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

/** Machines the roast console has a mode for, in menu order. */
export const IMPLEMENTED_ROASTERS: RoasterType[] = (Object.keys(ROASTER_SPECS) as RoasterType[])
  .filter((type) => ROASTER_SPECS[type].implemented)
  .sort((a, b) => (ROASTER_SPECS[a].popularityRank ?? 99) - (ROASTER_SPECS[b].popularityRank ?? 99));

export function isImplementedRoaster(type: string | null | undefined): type is RoasterType {
  return !!type && type in ROASTER_SPECS && !!ROASTER_SPECS[type as RoasterType].implemented;
}

/**
 * Behmor 2000AB Plus panel vocabulary (owner's manual):
 * - weight buttons set the starting time on the LCD; standard defaults 8:30 / 12:00 / 18:00 for every program
 * - P1 (default) to P5 programs before Start; each has its own maximum time (P1: 10:00 / 13:30 / 20:30)
 * - + adds 15 s, − removes 10 s
 * - after Start, P1-P5 switch to manual power (0 / 25 / 50 / 75 / 100 %) and D changes drum speed
 */
export const BEHMOR_WEIGHTS = [
  { id: '1/4 lb', label: '1/4 lb', grams: 113, defaultLcdS: 8 * 60 + 30 },
  { id: '1/2 lb', label: '1/2 lb', grams: 227, defaultLcdS: 12 * 60 },
  { id: '1 lb', label: '1 lb', grams: 454, defaultLcdS: 18 * 60 },
] as const;

export type BehmorWeight = (typeof BEHMOR_WEIGHTS)[number]['id'];

export const BEHMOR_PROGRAMS = ['P1', 'P2', 'P3', 'P4', 'P5'] as const;
export type BehmorProgram = (typeof BEHMOR_PROGRAMS)[number];

/** Manual-mode element power for each P button, percent. */
export const BEHMOR_MANUAL_POWER: Record<BehmorProgram, number> = { P1: 0, P2: 25, P3: 50, P4: 75, P5: 100 };

/**
 * Seconds logged per "+" press. Owner's manual: "Pressing '+' adds 15 seconds, '–' subtracts 10 seconds",
 * up to the program's maximum time (20:30 for P1 at 1 lb). Older roasts keep the value they logged.
 */
export const BEHMOR_PLUS_SECONDS = 15;

/** Seconds removed per "−" press, logged as a negative 'extend' value. */
export const BEHMOR_MINUS_SECONDS = 10;

/** Hottop KN-8828B-2K+ modes as named on the machine. */
export const HOTTOP_MODES = [
  { id: 'auto', label: 'Auto' },
  { id: 'manual', label: 'Manual' },
] as const;
