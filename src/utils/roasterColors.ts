/**
 * Roaster Color Schemes
 * Defines brand colors and visual styling for each roaster type
 */

import type { RoasterType } from '@/types/roaster.types';

export interface RoasterColorScheme {
  /** Primary brand color (hex) */
  primary: string;
  /** Secondary/accent color (hex) */
  secondary: string;
  /** Text color on primary background (hex) */
  textOnPrimary: string;
  /** Tailwind badge variant */
  badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive';
  /** Custom Tailwind classes for badge styling */
  badgeClasses?: string;
}

/**
 * Color schemes for each roaster type
 * Chosen to reflect brand identity or roaster characteristics
 */
export const ROASTER_COLORS: Record<RoasterType, RoasterColorScheme> = {
  'gene-cbr-101': {
    primary: '#3B82F6', // Blue - professional, precise
    secondary: '#60A5FA',
    textOnPrimary: '#FFFFFF',
    badgeVariant: 'default',
    badgeClasses: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-600',
  },
  
  'behmor-2000ab': {
    primary: '#F97316', // Orange - warm, approachable
    secondary: '#FB923C',
    textOnPrimary: '#FFFFFF',
    badgeVariant: 'default',
    badgeClasses: 'bg-orange-500 hover:bg-orange-600 text-white border-orange-600',
  },
  
  'freshroast-sr800': {
    primary: '#10B981', // Green - fresh, beginner-friendly
    secondary: '#34D399',
    textOnPrimary: '#FFFFFF',
    badgeVariant: 'default',
    badgeClasses: 'bg-green-500 hover:bg-green-600 text-white border-green-600',
  },
  
  'freshroast-sr540': {
    primary: '#7C3AED', // Violet - compact, powerful
    secondary: '#8B5CF6',
    textOnPrimary: '#FFFFFF',
    badgeVariant: 'default',
    badgeClasses: 'bg-violet-600 hover:bg-violet-700 text-white border-violet-700',
  },
  
  'kaldi-wide': {
    primary: '#059669', // Emerald - natural, accessible
    secondary: '#10B981',
    textOnPrimary: '#FFFFFF',
    badgeVariant: 'default',
    badgeClasses: 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700',
  },
  
  'kaldi-fortis': {
    primary: '#047857', // Darker emerald
    secondary: '#059669',
    textOnPrimary: '#FFFFFF',
    badgeVariant: 'default',
    badgeClasses: 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-800',
  },
  
  'kaldi-mini': {
    primary: '#10B981', // Lighter emerald
    secondary: '#34D399',
    textOnPrimary: '#FFFFFF',
    badgeVariant: 'default',
    badgeClasses: 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600',
  },
  
  'hottop-kn8828': {
    primary: '#DC2626', // Red - professional, high-end
    secondary: '#EF4444',
    textOnPrimary: '#FFFFFF',
    badgeVariant: 'default',
    badgeClasses: 'bg-red-600 hover:bg-red-700 text-white border-red-700',
  },
  
  'popcorn-popper': {
    primary: '#F59E0B', // Amber - warm, DIY
    secondary: '#FBBF24',
    textOnPrimary: '#FFFFFF',
    badgeVariant: 'default',
    badgeClasses: 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600',
  },
  
  'other-manual': {
    primary: '#6B7280', // Gray - neutral
    secondary: '#9CA3AF',
    textOnPrimary: '#FFFFFF',
    badgeVariant: 'secondary',
    badgeClasses: 'bg-gray-500 hover:bg-gray-600 text-white border-gray-600',
  },
  
  'other-electric': {
    primary: '#6B7280', // Gray - neutral
    secondary: '#9CA3AF',
    textOnPrimary: '#FFFFFF',
    badgeVariant: 'secondary',
    badgeClasses: 'bg-gray-500 hover:bg-gray-600 text-white border-gray-600',
  },
  
  'custom': {
    primary: '#6B7280', // Gray - neutral for unknown roasters
    secondary: '#9CA3AF',
    textOnPrimary: '#FFFFFF',
    badgeVariant: 'secondary',
    badgeClasses: 'bg-gray-500 hover:bg-gray-600 text-white border-gray-600',
  },
};

/**
 * Get color scheme for a roaster type
 * @param roasterType - The roaster type identifier
 * @returns Color scheme object with primary, secondary colors and styling
 */
export function getRoasterColorScheme(roasterType: RoasterType): RoasterColorScheme {
  return ROASTER_COLORS[roasterType] || ROASTER_COLORS['custom'];
}

/**
 * Get badge classes for a roaster type
 * @param roasterType - The roaster type identifier
 * @returns Tailwind CSS classes for badge styling
 */
export function getRoasterBadgeClasses(roasterType: RoasterType): string {
  const scheme = getRoasterColorScheme(roasterType);
  return scheme.badgeClasses || '';
}

/**
 * Get primary color for a roaster type
 * @param roasterType - The roaster type identifier
 * @returns Hex color code
 */
export function getRoasterPrimaryColor(roasterType: RoasterType): string {
  const scheme = getRoasterColorScheme(roasterType);
  return scheme.primary;
}
