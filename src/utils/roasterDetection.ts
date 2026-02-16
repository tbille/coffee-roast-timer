/**
 * Roaster Detection Utilities
 * Fuzzy matching to detect roaster type from free-text descriptions
 * Used for data migration and smart roaster identification
 */

import type { RoasterType } from '@/types/roaster.types';

/**
 * Detect roaster type from free-text description
 * Uses fuzzy matching to handle variations in user input
 * 
 * @param text - Free-text roaster description (e.g., "Gene CBR-101", "behmor 2000")
 * @returns Detected roaster type, or 'custom' if unable to match
 * 
 * @example
 * detectRoasterType("Gene CBR-101") // Returns: 'gene-cbr-101'
 * detectRoasterType("behmor") // Returns: 'behmor-2000ab'
 * detectRoasterType("my custom roaster") // Returns: 'custom'
 */
export function detectRoasterType(text?: string | null): RoasterType {
  if (!text) {
    return 'custom';
  }
  
  // Normalize: lowercase, trim, remove extra spaces
  const normalized = text.toLowerCase().trim().replace(/\s+/g, ' ');
  
  // Gene CBR-101 patterns
  if (
    (normalized.includes('gene') && (normalized.includes('cbr') || normalized.includes('101'))) ||
    normalized.includes('gene cafe') ||
    normalized.includes('genecafe')
  ) {
    return 'gene-cbr-101';
  }
  
  // Behmor patterns
  if (
    normalized.includes('behmor') ||
    (normalized.includes('2000') && (normalized.includes('ab') || normalized.includes('plus')))
  ) {
    return 'behmor-2000ab';
  }
  
  // FreshRoast patterns
  if (normalized.includes('freshroast') || normalized.includes('fresh roast') || normalized.includes('fresh-roast')) {
    // Try to detect specific model
    if (normalized.includes('800') || normalized.includes('sr800') || normalized.includes('sr-800')) {
      return 'freshroast-sr800';
    }
    if (normalized.includes('540') || normalized.includes('sr540') || normalized.includes('sr-540')) {
      return 'freshroast-sr540';
    }
    // Default to SR800 (more common)
    return 'freshroast-sr800';
  }
  
  // KALDI patterns
  if (normalized.includes('kaldi')) {
    if (normalized.includes('wide')) {
      return 'kaldi-wide';
    }
    if (normalized.includes('fortis')) {
      return 'kaldi-fortis';
    }
    if (normalized.includes('mini')) {
      return 'kaldi-mini';
    }
    // Default to Wide (most common)
    return 'kaldi-wide';
  }
  
  // Hottop patterns
  if (
    normalized.includes('hottop') ||
    normalized.includes('hot top') ||
    normalized.includes('kn-8828') ||
    normalized.includes('kn8828')
  ) {
    return 'hottop-kn8828';
  }
  
  // Popcorn popper patterns
  if (
    normalized.includes('popcorn') ||
    normalized.includes('poppery') ||
    normalized.includes('presto') ||
    normalized.includes('air popper')
  ) {
    return 'popcorn-popper';
  }
  
  // Manual roaster indicators
  if (
    normalized.includes('manual') ||
    normalized.includes('hand') ||
    normalized.includes('crank') ||
    normalized.includes('stovetop') ||
    normalized.includes('stove top') ||
    normalized.includes('whirley') ||
    normalized.includes('whirleypop')
  ) {
    return 'other-manual';
  }
  
  // Generic electric roaster indicators
  if (
    normalized.includes('electric') ||
    normalized.includes('automatic') ||
    normalized.includes('drum roaster')
  ) {
    return 'other-electric';
  }
  
  // DIY/home-made indicators
  if (
    normalized.includes('diy') ||
    normalized.includes('homemade') ||
    normalized.includes('home made') ||
    normalized.includes('custom built')
  ) {
    return 'custom';
  }
  
  // If no pattern matched, return custom
  return 'custom';
}

/**
 * Get confidence score for roaster detection
 * Returns a value between 0 and 1 indicating match confidence
 * 
 * @param text - Input text
 * @param detectedType - Detected roaster type
 * @returns Confidence score (0-1)
 */
export function getDetectionConfidence(text?: string | null, detectedType?: RoasterType): number {
  if (!text || !detectedType || detectedType === 'custom') {
    return 0;
  }
  
  const normalized = text.toLowerCase().trim();
  
  // High confidence: exact brand + model match
  const highConfidencePatterns: Record<RoasterType, RegExp[]> = {
    'gene-cbr-101': [/gene\s*cafe\s*cbr\s*-?\s*101/, /genecafe\s*cbr\s*101/],
    'behmor-2000ab': [/behmor\s*2000\s*ab/, /behmor\s*2000\s*plus/],
    'freshroast-sr800': [/freshroast\s*sr\s*-?\s*800/, /fresh\s*roast\s*sr\s*800/],
    'freshroast-sr540': [/freshroast\s*sr\s*-?\s*540/, /fresh\s*roast\s*sr\s*540/],
    'kaldi-wide': [/kaldi\s*wide/],
    'kaldi-fortis': [/kaldi\s*fortis/],
    'kaldi-mini': [/kaldi\s*mini/],
    'hottop-kn8828': [/hottop\s*kn\s*-?\s*8828/, /hot\s*top\s*kn\s*8828/],
    'popcorn-popper': [/popcorn\s*popper/, /air\s*popper/],
    'other-manual': [/manual\s*roaster/, /stovetop\s*roaster/],
    'other-electric': [/electric\s*roaster/],
    'custom': []
  };
  
  // Check for high confidence match
  const patterns = highConfidencePatterns[detectedType] || [];
  for (const pattern of patterns) {
    if (pattern.test(normalized)) {
      return 0.9; // High confidence
    }
  }
  
  // Medium confidence: brand name match
  const brandMatches: Record<RoasterType, string[]> = {
    'gene-cbr-101': ['gene'],
    'behmor-2000ab': ['behmor'],
    'freshroast-sr800': ['freshroast', 'fresh roast'],
    'freshroast-sr540': ['freshroast', 'fresh roast'],
    'kaldi-wide': ['kaldi'],
    'kaldi-fortis': ['kaldi'],
    'kaldi-mini': ['kaldi'],
    'hottop-kn8828': ['hottop', 'hot top'],
    'popcorn-popper': ['popcorn'],
    'other-manual': ['manual'],
    'other-electric': ['electric'],
    'custom': []
  };
  
  const brands = brandMatches[detectedType] || [];
  for (const brand of brands) {
    if (normalized.includes(brand)) {
      return 0.6; // Medium confidence
    }
  }
  
  // Low confidence: weak match
  return 0.3;
}

/**
 * Suggest roaster types based on partial input
 * Useful for autocomplete/search functionality
 * 
 * @param query - Partial query string
 * @param limit - Maximum number of suggestions
 * @returns Array of suggested roaster types with scores
 */
export function suggestRoasterTypes(
  query: string,
  limit: number = 5
): Array<{ type: RoasterType; score: number; matchedText: string }> {
  if (!query || query.length < 2) {
    return [];
  }
  
  const normalized = query.toLowerCase().trim();
  const suggestions: Array<{ type: RoasterType; score: number; matchedText: string }> = [];
  
  // Search patterns for each roaster
  const searchPatterns: Array<{ type: RoasterType; patterns: string[]; displayName: string }> = [
    {
      type: 'gene-cbr-101',
      patterns: ['gene', 'cbr', '101', 'gene cafe', 'genecafe'],
      displayName: 'Gene Cafe CBR-101'
    },
    {
      type: 'behmor-2000ab',
      patterns: ['behmor', '2000', 'ab', 'plus'],
      displayName: 'Behmor 2000AB Plus'
    },
    {
      type: 'freshroast-sr800',
      patterns: ['freshroast', 'fresh roast', 'sr800', '800'],
      displayName: 'FreshRoast SR800'
    },
    {
      type: 'freshroast-sr540',
      patterns: ['freshroast', 'fresh roast', 'sr540', '540'],
      displayName: 'FreshRoast SR540'
    },
    {
      type: 'kaldi-wide',
      patterns: ['kaldi', 'wide'],
      displayName: 'KALDI Wide'
    },
    {
      type: 'kaldi-fortis',
      patterns: ['kaldi', 'fortis'],
      displayName: 'KALDI Fortis'
    },
    {
      type: 'hottop-kn8828',
      patterns: ['hottop', 'hot top', 'kn8828', 'kn-8828'],
      displayName: 'Hottop KN-8828'
    },
    {
      type: 'popcorn-popper',
      patterns: ['popcorn', 'popper', 'presto'],
      displayName: 'Popcorn Popper'
    }
  ];
  
  // Score each roaster based on pattern matching
  for (const { type, patterns, displayName } of searchPatterns) {
    let maxScore = 0;
    let matchedPattern = '';
    
    for (const pattern of patterns) {
      if (pattern.includes(normalized)) {
        // Query is substring of pattern
        const score = normalized.length / pattern.length;
        if (score > maxScore) {
          maxScore = score;
          matchedPattern = pattern;
        }
      } else if (normalized.includes(pattern)) {
        // Pattern is substring of query
        const score = pattern.length / normalized.length;
        if (score > maxScore) {
          maxScore = score;
          matchedPattern = pattern;
        }
      }
    }
    
    if (maxScore > 0) {
      suggestions.push({
        type,
        score: maxScore,
        matchedText: displayName
      });
    }
  }
  
  // Sort by score (descending) and return top results
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
