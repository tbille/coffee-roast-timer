// Predefined flavor tags for coffee tasting notes
// Based on SCA Coffee Taster's Flavor Wheel

export const FLAVOR_TAGS = [
  // Fruity
  'Berry', 'Cherry', 'Citrus', 'Stone Fruit', 'Tropical Fruit',
  'Apple', 'Grape', 'Lemon', 'Orange', 'Peach',
  
  // Sweet
  'Caramel', 'Chocolate', 'Honey', 'Vanilla', 'Brown Sugar',
  'Molasses', 'Maple Syrup',
  
  // Nutty/Cocoa
  'Almond', 'Hazelnut', 'Peanut', 'Walnut', 'Dark Chocolate',
  'Milk Chocolate', 'Cocoa',
  
  // Roasted
  'Toast', 'Burnt', 'Smoky', 'Tobacco', 'Pipe Tobacco',
  
  // Spices
  'Cinnamon', 'Nutmeg', 'Clove', 'Pepper', 'Anise',
  
  // Floral
  'Jasmine', 'Rose', 'Chamomile', 'Floral', 'Hibiscus',
  
  // Other Descriptors
  'Bright', 'Clean', 'Complex', 'Balanced', 'Creamy',
  'Smooth', 'Bold', 'Delicate', 'Juicy', 'Silky',
  'Syrupy', 'Tea-like', 'Wine-like', 'Earthy', 'Herbal',
  
  // Body & Mouthfeel
  'Full Body', 'Medium Body', 'Light Body', 'Buttery',
  
  // Acidity
  'High Acidity', 'Medium Acidity', 'Low Acidity', 'Crisp',
  'Tart', 'Malic', 'Citric', 'Winey'
] as const;

export type FlavorTag = typeof FLAVOR_TAGS[number];

// Categorized flavor tags for better organization
export const FLAVOR_CATEGORIES = {
  'Fruity': ['Berry', 'Cherry', 'Citrus', 'Stone Fruit', 'Tropical Fruit', 'Apple', 'Grape', 'Lemon', 'Orange', 'Peach'],
  'Sweet': ['Caramel', 'Chocolate', 'Honey', 'Vanilla', 'Brown Sugar', 'Molasses', 'Maple Syrup'],
  'Nutty/Cocoa': ['Almond', 'Hazelnut', 'Peanut', 'Walnut', 'Dark Chocolate', 'Milk Chocolate', 'Cocoa'],
  'Roasted': ['Toast', 'Burnt', 'Smoky', 'Tobacco', 'Pipe Tobacco'],
  'Spices': ['Cinnamon', 'Nutmeg', 'Clove', 'Pepper', 'Anise'],
  'Floral': ['Jasmine', 'Rose', 'Chamomile', 'Floral', 'Hibiscus'],
  'Descriptors': ['Bright', 'Clean', 'Complex', 'Balanced', 'Creamy', 'Smooth', 'Bold', 'Delicate', 'Juicy', 'Silky', 'Syrupy', 'Tea-like', 'Wine-like', 'Earthy', 'Herbal'],
  'Body': ['Full Body', 'Medium Body', 'Light Body', 'Buttery'],
  'Acidity': ['High Acidity', 'Medium Acidity', 'Low Acidity', 'Crisp', 'Tart', 'Malic', 'Citric', 'Winey']
} as const;

// Common brew methods
export const BREW_METHODS = [
  'Espresso',
  'Pour Over',
  'French Press',
  'AeroPress',
  'Drip Coffee',
  'Cold Brew',
  'Moka Pot',
  'Turkish',
  'Siphon',
  'Chemex'
] as const;

export type BrewMethod = typeof BREW_METHODS[number];
