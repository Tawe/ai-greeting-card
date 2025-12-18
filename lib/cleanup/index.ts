import { db } from '../db';
import { cards } from '../db/schema';
import { deleteImage } from '../storage';
import { lt, eq } from 'drizzle-orm';

interface CleanupResult {
  totalExpired: number;
  deleted: number;
  errors: Array<{ cardId: string; error: string }>;
}

/**
 * Find all expired cards
 */
export async function findExpiredCards() {
  const now = new Date();
  return await db
    .select()
    .from(cards)
    .where(lt(cards.expiresAt, now));
}

/**
 * Extract storage key from image URL
 * 
 * Handles two URL formats:
 * 1. S3-compatible (R2, MinIO): http://endpoint/bucket-name/cards/{cardId}/cover-{version}.png
 * 2. Standard S3: https://bucket-name.s3.region.amazonaws.com/cards/{cardId}/cover-{version}.png
 */
function extractStorageKey(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Find 'cards' in the path
    const cardsIndex = pathParts.findIndex(part => part === 'cards');
    
    if (cardsIndex === -1) {
      // Try regex fallback
      const match = imageUrl.match(/cards\/[^/]+\/cover-[^/]+\.png/);
      return match ? match[0] : null;
    }
    
    // Return everything from 'cards' onwards (e.g., "cards/{cardId}/cover-{version}.png")
    return pathParts.slice(cardsIndex).join('/');
  } catch {
    // If URL parsing fails, try regex extraction
    const match = imageUrl.match(/cards\/[^/]+\/cover-[^/]+\.png/);
    return match ? match[0] : null;
  }
}

/**
 * Clean up a single expired card
 */
async function cleanupCard(cardId: string, coverImageUrl: string): Promise<void> {
  // Delete image from storage
  const storageKey = extractStorageKey(coverImageUrl);
  if (storageKey) {
    try {
      await deleteImage(storageKey);
    } catch (error) {
      // Log but don't fail - image might already be deleted
      console.warn(`Failed to delete image for card ${cardId}:`, error);
    }
  }
  
  // Delete database record
  await db.delete(cards).where(eq(cards.id, cardId));
}

/**
 * Clean up all expired cards
 */
export async function cleanupExpiredCards(): Promise<CleanupResult> {
  const result: CleanupResult = {
    totalExpired: 0,
    deleted: 0,
    errors: [],
  };

  try {
    // Find all expired cards
    const expiredCards = await findExpiredCards();
    result.totalExpired = expiredCards.length;

    if (expiredCards.length === 0) {
      return result;
    }

    console.log(`Found ${expiredCards.length} expired card(s) to clean up`);

    // Process each expired card
    for (const card of expiredCards) {
      try {
        await cleanupCard(card.id, card.coverImageUrl);
        result.deleted++;
        console.log(`✓ Deleted expired card: ${card.id} (slug: ${card.slug})`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push({
          cardId: card.id,
          error: errorMessage,
        });
        console.error(`✗ Failed to delete card ${card.id}:`, errorMessage);
      }
    }

    return result;
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
}
