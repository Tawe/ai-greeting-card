/**
 * Occasion style guides and theme configuration
 * Used for generating occasion-specific gradients and styling
 */

export interface OccasionStyle {
  id: string;
  name: string;
  colorPalette: string[];
  gradient: string;
  primary: string; // Primary button/accent color
  primaryHover: string; // Hover state for primary
  secondary: string; // Secondary color
  border: string; // Border color
  text: string; // Text color
  accent: string; // Seasonal accent color (used sparingly)
}

// Christmas colors from seed data: ['#C8102E', '#006B3C', '#FFFFFF', '#FFD700']
// Red, Green, White, Gold
export const occasionStyles: Record<string, OccasionStyle> = {
  christmas: {
    id: 'christmas',
    name: 'Christmas',
    colorPalette: ['#C8102E', '#006B3C', '#FFFFFF', '#FFD700'],
    // Soft gradient: red -> green with white/gold accents (matching color palette)
    // Reduced contrast so card dominates
    gradient: 'linear-gradient(135deg, #fef7f7 0%, #f0f9f5 30%, #f2faf6 60%, #fffbf5 100%)',
    primary: '#C8102E', // Red - primary button color
    primaryHover: '#A00D24', // Darker red for hover
    secondary: '#006B3C', // Pine green - secondary accents
    border: '#C8102E', // Red borders
    text: '#171717', // Dark text
    accent: '#006B3C', // Pine green for subtle accents
  },
  'new-year': {
    id: 'new-year',
    name: 'New Year',
    colorPalette: ['#FFD700', '#000000', '#FFFFFF', '#FF6B6B'],
    // Gold, black, white, coral - celebratory and elegant
    gradient: 'linear-gradient(135deg, #fffbf0 0%, #f5f5f5 30%, #fff5f5 60%, #fffbf0 100%)',
    primary: '#FFD700', // Gold - primary button color
    primaryHover: '#E6C200', // Darker gold for hover
    secondary: '#000000', // Black - secondary accents
    border: '#FFD700', // Gold borders
    text: '#171717', // Dark text
    accent: '#FF6B6B', // Coral for subtle accents
  },
  hanukkah: {
    id: 'hanukkah',
    name: 'Hanukkah',
    colorPalette: ['#0033A0', '#FFFFFF', '#FFD700', '#C8102E'],
    // Blue, white, gold, red - traditional colors
    gradient: 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 30%, #fffbf0 60%, #fef7f7 100%)',
    primary: '#0033A0', // Blue - primary button color
    primaryHover: '#002680', // Darker blue for hover
    secondary: '#FFD700', // Gold - secondary accents
    border: '#0033A0', // Blue borders
    text: '#171717', // Dark text
    accent: '#FFD700', // Gold for subtle accents
  },
  kwanzaa: {
    id: 'kwanzaa',
    name: 'Kwanzaa',
    colorPalette: ['#000000', '#C8102E', '#006B3C', '#FFD700'],
    // Black, red, green, gold - traditional colors
    gradient: 'linear-gradient(135deg, #f5f5f5 0%, #fef7f7 30%, #f0f9f5 60%, #fffbf0 100%)',
    primary: '#000000', // Black - primary button color
    primaryHover: '#1a1a1a', // Slightly lighter black for hover
    secondary: '#C8102E', // Red - secondary accents
    border: '#000000', // Black borders
    text: '#171717', // Dark text
    accent: '#FFD700', // Gold for subtle accents
  },
  'winter-solstice': {
    id: 'winter-solstice',
    name: 'Winter Solstice',
    colorPalette: ['#1E3A5F', '#FFFFFF', '#FFD700', '#87CEEB'],
    // Deep blue, white, gold, sky blue - peaceful and celestial
    gradient: 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 30%, #f0f9ff 60%, #fffbf0 100%)',
    primary: '#1E3A5F', // Deep blue - primary button color
    primaryHover: '#152a47', // Darker blue for hover
    secondary: '#87CEEB', // Sky blue - secondary accents
    border: '#1E3A5F', // Deep blue borders
    text: '#171717', // Dark text
    accent: '#FFD700', // Gold for subtle accents
  },
};

/**
 * Get occasion style by ID
 */
export function getOccasionStyle(occasionId: string): OccasionStyle {
  return occasionStyles[occasionId] || occasionStyles.christmas;
}

/**
 * Get background gradient for occasion
 */
export function getOccasionGradient(occasionId: string): string {
  const style = getOccasionStyle(occasionId);
  return style.gradient;
}

/**
 * Get primary color for occasion
 */
export function getOccasionPrimary(occasionId: string): string {
  return getOccasionStyle(occasionId).primary;
}

/**
 * Get primary hover color for occasion
 */
export function getOccasionPrimaryHover(occasionId: string): string {
  return getOccasionStyle(occasionId).primaryHover;
}

/**
 * Get secondary color for occasion
 */
export function getOccasionSecondary(occasionId: string): string {
  return getOccasionStyle(occasionId).secondary;
}

/**
 * Get border color for occasion
 */
export function getOccasionBorder(occasionId: string): string {
  return getOccasionStyle(occasionId).border;
}

/**
 * Get accent color for occasion (used sparingly)
 */
export function getOccasionAccent(occasionId: string): string {
  return getOccasionStyle(occasionId).accent;
}
