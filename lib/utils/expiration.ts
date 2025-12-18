import { config } from '../config';

/**
 * Calculate expiration date for a card (default: 30 days from now)
 */
export function calculateExpirationDate(): Date {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + config.card.expirationDays);
  return expirationDate;
}
