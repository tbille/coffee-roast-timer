// Types for the Compare page (/compare?a=<id>&b=<id>)

import type { RoastCardData } from '@/components/roast-card/RoastCard';
import type { ProfileRowInput, RoastEventMark, RoastFacts, RoastPhase } from '@/utils/roastProfileView';

export type CompareSlot = 'a' | 'b';

/** One roast prepared for comparison. Temperatures stay in the row; points are derived per view unit. */
export interface CompareRoast {
  id: string;
  slot: CompareSlot;
  row: ProfileRowInput;
  card: RoastCardData;
  facts: RoastFacts;
  phases: RoastPhase[];
  marks: RoastEventMark[];
}

/** Line colours per slot, from theme tokens (works in both themes). */
export const COMPARE_COLORS: Record<CompareSlot, string> = {
  a: 'hsl(var(--phase-development))',
  b: 'hsl(var(--control-air))',
};

export const COMPARE_LABELS: Record<CompareSlot, string> = {
  a: 'Roast A',
  b: 'Roast B',
};
