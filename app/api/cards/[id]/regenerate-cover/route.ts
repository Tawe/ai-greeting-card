import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cards } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateCoverImage } from '@/lib/ai/gemini';
import { uploadImage, generateImageKey, deleteImage } from '@/lib/storage';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Find card
    const card = await db.select().from(cards).where(eq(cards.id, id)).limit(1);
    
    if (card.length === 0) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    if (card[0].status === 'published') {
      return NextResponse.json(
        { error: 'Cannot regenerate cover for published card' },
        { status: 400 }
      );
    }

    // Generate new cover image
    let newCoverImageUrl = card[0].coverImageUrl; // Keep old URL as fallback
    
    try {
      const imageBuffer = await generateCoverImage(card[0].vibe as any, card[0].occasionId);
      const imageKey = generateImageKey(id, Date.now().toString()); // Use timestamp for version
      newCoverImageUrl = await uploadImage(imageBuffer, imageKey, 'image/png');
      
      // Optionally delete old image (or keep for history)
      // await deleteImage(generateImageKey(id));
    } catch (error) {
      console.error('Error regenerating cover image:', error);
      // Keep existing cover image URL if regeneration fails
    }

    // Update database
    await db.update(cards)
      .set({ coverImageUrl: newCoverImageUrl })
      .where(eq(cards.id, id));

    return NextResponse.json({
      coverImageUrl: newCoverImageUrl,
    });
  } catch (error) {
    console.error('Error regenerating cover:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate cover' },
      { status: 500 }
    );
  }
}
