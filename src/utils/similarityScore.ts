// Finding roasts similar to a given one (for "similar roasts" suggestions).
// Uses the structured roaster type, batch size within ±15 %, process and normalised origin.
// The deprecated free-text `coffee_roaster` is not used.

import {
  deriveRoastFacts,
  originLabel,
  processLabel,
  roasterName,
  type ProfileRowInput,
} from '@/utils/roastProfileView';

export interface SimilarityResult<T extends ProfileRowInput = ProfileRowInput> {
  profile: T;
  score: number;
  reasons: string[];
}

const BATCH_TOLERANCE = 0.15;

export const calculateSimilarityScore = <T extends ProfileRowInput>(target: ProfileRowInput, candidate: T): SimilarityResult<T> => {
  let score = 0;
  const reasons: string[] = [];

  // Same machine +30
  if (target.roaster_type && candidate.roaster_type && target.roaster_type === candidate.roaster_type) {
    score += 30;
    reasons.push(`Same roaster (${roasterName(target.roaster_type) ?? target.roaster_type})`);
  }

  // Batch within ±15 % +20
  const tIn = target.initial_weight ?? undefined;
  const cIn = candidate.initial_weight ?? undefined;
  if (tIn && cIn && tIn > 0 && Math.abs(cIn - tIn) / tIn <= BATCH_TOLERANCE) {
    score += 20;
    reasons.push('Similar batch size');
  }

  // Same process +20 (labels are normalised; legacy roast levels are not processes)
  const tProcess = processLabel(target);
  const cProcess = processLabel(candidate);
  if (tProcess && cProcess && tProcess.toLowerCase() === cProcess.toLowerCase()) {
    score += 20;
    reasons.push(`Same process (${tProcess})`);
  }

  // Same normalised origin +20 (Columbia = Colombia)
  const tOrigin = originLabel(target.origin);
  const cOrigin = originLabel(candidate.origin);
  if (tOrigin && cOrigin && tOrigin.toLowerCase() === cOrigin.toLowerCase()) {
    score += 20;
    reasons.push(`Same origin (${tOrigin})`);
  }

  // First crack within 30 s +10
  const tFc = deriveRoastFacts(target).firstCrack?.time;
  const cFc = deriveRoastFacts(candidate).firstCrack?.time;
  if (tFc !== undefined && cFc !== undefined && Math.abs(tFc - cFc) <= 30) {
    score += 10;
    reasons.push('Similar first crack timing');
  }

  return { profile: candidate, score, reasons };
};

export const findSimilarRoasts = <T extends ProfileRowInput>(target: ProfileRowInput, candidates: T[], limit = 5): SimilarityResult<T>[] =>
  candidates
    .filter((c) => c.id !== target.id)
    .map((c) => calculateSimilarityScore(target, c))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

export const filterSimilarRoasts = <T extends ProfileRowInput>(target: ProfileRowInput, candidates: T[], minScore = 30): SimilarityResult<T>[] =>
  candidates
    .filter((c) => c.id !== target.id)
    .map((c) => calculateSimilarityScore(target, c))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score);

/** Plain label for a score, no colour. */
export const getSimilarityLabel = (score: number): string => {
  if (score >= 80) return 'Very similar';
  if (score >= 60) return 'Quite similar';
  if (score >= 40) return 'Somewhat similar';
  if (score >= 20) return 'A little similar';
  return 'Different';
};
