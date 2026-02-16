import { type DevelopmentStats, type RoastMilestone, type CrackEvent } from '@/types/roast.types';

/**
 * Calculate development statistics from roast data
 * Development phase starts at first crack and ends at drop
 * Industry standard: 20-25% development ratio is ideal
 */
export function calculateDevelopmentStats(
  duration_seconds: number,
  milestones?: RoastMilestone[],
  legacyCrackEvents?: CrackEvent[]
): DevelopmentStats | undefined {
  // Try to find first crack from milestones
  let firstCrackTime: number | undefined;
  
  if (milestones && milestones.length > 0) {
    const firstCrackMilestone = milestones.find(m => m.event_type === 'first_crack');
    if (firstCrackMilestone) {
      firstCrackTime = firstCrackMilestone.time_seconds;
    }
  }
  
  // Fallback to legacy crack events
  if (!firstCrackTime && legacyCrackEvents && legacyCrackEvents.length > 0) {
    const firstCrack = legacyCrackEvents.find(e => e.type === 'first');
    if (firstCrack) {
      firstCrackTime = firstCrack.time;
    }
  }
  
  if (!firstCrackTime) {
    return undefined;
  }
  
  const developmentTime = duration_seconds - firstCrackTime;
  const developmentRatio = (developmentTime / duration_seconds) * 100;
  
  return {
    first_crack_time_seconds: firstCrackTime,
    development_time_seconds: developmentTime,
    development_ratio_percent: developmentRatio,
    time_to_first_crack_seconds: firstCrackTime,
  };
}

/**
 * Get a human-readable description of the development ratio
 */
export function getDevelopmentRatioDescription(ratio?: number): string {
  if (!ratio) return 'Unknown';
  
  if (ratio >= 20 && ratio <= 25) {
    return 'Ideal (balanced development)';
  } else if (ratio < 15) {
    return 'Very light (under-developed)';
  } else if (ratio < 20) {
    return 'Light (slight under-development)';
  } else if (ratio <= 30) {
    return 'Dark (slight over-development)';
  } else {
    return 'Very dark (over-developed)';
  }
}

/**
 * Generate default sensory milestones based on roast phases
 * These are general guidelines that can be customized
 */
export function generateDefaultMilestones(
  duration_seconds: number,
  firstCrackTime?: number
): RoastMilestone[] {
  const milestones: RoastMilestone[] = [];
  
  // Yellowing typically happens around 25-35% of total time
  const yellowingTime = Math.floor(duration_seconds * 0.3);
  milestones.push({
    time_seconds: yellowingTime,
    event_type: 'yellowing',
    visual_cue: 'Beans turning from green to pale yellow, chaff starting to separate',
    audio_cue: 'Beans tumbling quietly',
    aroma_cue: 'Bread or toast-like aroma emerging',
  });
  
  // If first crack time is known, add it
  if (firstCrackTime) {
    milestones.push({
      time_seconds: firstCrackTime,
      event_type: 'first_crack',
      visual_cue: 'Beans are cinnamon brown, expanding in size',
      audio_cue: '**LOUD rapid popping** sounds like popcorn',
      aroma_cue: 'Stronger coffee aroma, sweet caramel notes',
      action_required: 'START YOUR DEVELOPMENT TIMER NOW',
    });
    
    // Development phase checkpoint (midway through development)
    const developmentMidpoint = firstCrackTime + Math.floor((duration_seconds - firstCrackTime) / 2);
    milestones.push({
      time_seconds: developmentMidpoint,
      event_type: 'development_start',
      visual_cue: 'Medium brown color, oils may appear on surface',
      audio_cue: 'Popping has slowed or stopped',
      aroma_cue: 'Full coffee aroma with chocolate notes',
    });
  }
  
  // End roast
  milestones.push({
    time_seconds: duration_seconds,
    event_type: 'drop',
    visual_cue: 'Target roast color achieved',
    aroma_cue: 'Rich, developed coffee aroma',
    action_required: 'COOL BEANS IMMEDIATELY',
  });
  
  return milestones;
}
