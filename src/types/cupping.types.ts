// Type definitions for cupping and tasting notes

export interface CuppingNotes {
  cupping_score: number;
  cupping_date: string;
  rest_days?: number;
  flavor_notes?: string;
  flavor_tags?: string[];
  brew_method?: string;
  roasted_bean_photo_url?: string;
}

export interface FlavorTag {
  id: string;
  label: string;
}

// Predefined brew methods
export const BREW_METHODS = [
  'Espresso',
  'Pour Over',
  'French Press',
  'AeroPress',
  'Drip Coffee',
  'Cold Brew',
  'Moka Pot',
  'Turkish',
  'Other',
] as const;

export type BrewMethod = typeof BREW_METHODS[number];

// Predefined flavor tags (alphabetical, simplified list per DESIGN_SPEC)
export const FLAVOR_TAGS = [
  'Berry',
  'Bitter',
  'Bright',
  'Buttery',
  'Caramel',
  'Cherry',
  'Chocolate',
  'Citrus',
  'Clean',
  'Cocoa',
  'Complex',
  'Creamy',
  'Earthy',
  'Floral',
  'Fruity',
  'Herbal',
  'Honey',
  'Juicy',
  'Nutty',
  'Roasted',
  'Smooth',
  'Smoky',
  'Spicy',
  'Stone Fruit',
  'Sweet',
  'Tangy',
  'Tea-like',
  'Tropical',
  'Vanilla',
  'Wine-like',
] as const;

export type FlavorTagType = typeof FLAVOR_TAGS[number];

// Configuration constants
export const MAX_FLAVOR_TAGS = 8;
export const MAX_PHOTO_SIZE_MB = 5;
export const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
] as const;

export type AcceptedImageType = typeof ACCEPTED_IMAGE_TYPES[number];

// Image compression settings
export const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};
