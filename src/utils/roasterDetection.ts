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
