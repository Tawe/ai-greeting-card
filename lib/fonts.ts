import { Vibe } from './types';

/**
 * Deterministic font mapping per vibe
 * Maps to CSS variables defined in app/layout.tsx
 */
export const vibeFonts: Record<Vibe, string> = {
  warm: 'Playfair Display',
  funny: 'Dancing Script',
  fancy: 'Montserrat',
  chaotic: 'Pacifico',
};

/**
 * CSS variable mapping for fonts
 */
export const vibeFontVariables: Record<Vibe, string> = {
  warm: 'var(--font-playfair)',
  funny: 'var(--font-dancing)',
  fancy: 'var(--font-montserrat)',
  chaotic: 'var(--font-pacifico)',
};

/**
 * Get font family for a given vibe
 */
export function getFontForVibe(vibe: Vibe): string {
  return vibeFonts[vibe];
}

/**
 * Get CSS font-family string with fallbacks
 * Uses CSS variables for proper font loading
 */
export function getFontFamilyCSS(vibe: Vibe): string {
  const fontVariable = vibeFontVariables[vibe];
  const fontName = getFontForVibe(vibe);
  // Use CSS variable first, then font name as fallback, then generic fallbacks
  return `${fontVariable}, "${fontName}", serif, sans-serif`;
}
