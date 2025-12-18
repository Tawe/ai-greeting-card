import { nanoid } from 'nanoid';

/**
 * Generate a unique slug for a card
 * Format: short random string (e.g., "a9F3kP")
 */
export function generateSlug(): string {
  return nanoid(6);
}
