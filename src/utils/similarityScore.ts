// Utility functions for finding similar roast profiles

interface CrackEvent {
  time: number;
  targetTemp: number;
  currentTemp: number;
  type: 'first' | 'second';
}

interface RoastProfile {
  id: string;
  beans_name: string;
  origin?: string;
  farm_name?: string;
  roast_process?: string;
  coffee_roaster?: string;
  duration_seconds: number;
  crack_events: CrackEvent[];
  initial_weight?: number;
  final_weight?: number;
}

export interface SimilarityResult {
  profile: RoastProfile;
  score: number;
  reasons: string[];
}

export const calculateSimilarityScore = (
  target: RoastProfile,
  candidate: RoastProfile
): SimilarityResult => {
  let score = 0;
  const reasons: string[] = [];

  // Same origin +30 points
  if (target.origin && candidate.origin && target.origin === candidate.origin) {
    score += 30;
    reasons.push(`Same origin (${target.origin})`);
  }

  // Same process +20 points
  if (
    target.roast_process &&
    candidate.roast_process &&
    target.roast_process === candidate.roast_process
  ) {
    score += 20;
    reasons.push(`Same process (${target.roast_process})`);
  }

  // Same roaster +20 points
  if (
    target.coffee_roaster &&
    candidate.coffee_roaster &&
    target.coffee_roaster === candidate.coffee_roaster
  ) {
    score += 20;
    reasons.push(`Same roaster (${target.coffee_roaster})`);
  }

  // Similar duration (within 30 seconds) +15 points
  const durationDiff = Math.abs(
    target.duration_seconds - candidate.duration_seconds
  );
  if (durationDiff <= 30) {
    score += 15;
    reasons.push('Similar duration');
  }

  // Similar first crack timing +15 points
  const targetFirstCrack = target.crack_events.find((c) => c.type === 'first')?.time;
  const candidateFirstCrack = candidate.crack_events.find(
    (c) => c.type === 'first'
  )?.time;

  if (
    targetFirstCrack &&
    candidateFirstCrack &&
    Math.abs(targetFirstCrack - candidateFirstCrack) <= 30
  ) {
    score += 15;
    reasons.push('Similar first crack timing');
  }

  // Similar weight loss percentage +10 points
  if (
    target.initial_weight &&
    target.final_weight &&
    candidate.initial_weight &&
    candidate.final_weight
  ) {
    const targetLoss =
      ((target.initial_weight - target.final_weight) / target.initial_weight) * 100;
    const candidateLoss =
      ((candidate.initial_weight - candidate.final_weight) /
        candidate.initial_weight) *
      100;

    if (Math.abs(targetLoss - candidateLoss) <= 2) {
      score += 10;
      reasons.push('Similar weight loss');
    }
  }

  return { profile: candidate, score, reasons };
};

export const findSimilarRoasts = (
  target: RoastProfile,
  candidates: RoastProfile[],
  limit: number = 5
): SimilarityResult[] => {
  return candidates
    .filter((c) => c.id !== target.id)
    .map((candidate) => calculateSimilarityScore(target, candidate))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

// Filter profiles by similarity threshold
export const filterSimilarRoasts = (
  target: RoastProfile,
  candidates: RoastProfile[],
  minScore: number = 30
): SimilarityResult[] => {
  return candidates
    .filter((c) => c.id !== target.id)
    .map((candidate) => calculateSimilarityScore(target, candidate))
    .filter((result) => result.score >= minScore)
    .sort((a, b) => b.score - a.score);
};

// Get similarity category label
export const getSimilarityLabel = (score: number): string => {
  if (score >= 80) return 'Very Similar';
  if (score >= 60) return 'Quite Similar';
  if (score >= 40) return 'Moderately Similar';
  if (score >= 20) return 'Somewhat Similar';
  return 'Different';
};

// Get color for similarity score
export const getSimilarityColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  if (score >= 20) return 'text-orange-600';
  return 'text-gray-600';
};
