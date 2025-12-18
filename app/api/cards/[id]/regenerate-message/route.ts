import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cards } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { rewriteMessage } from '@/lib/ai/gemini';

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
        { error: 'Cannot regenerate message for published card' },
        { status: 400 }
      );
    }

    // Get original message from request body (we'd need to store this separately)
    // For now, regenerate from clean message
    const body = await request.json();
    const originalMessage = body.originalMessage || card[0].cleanMessage;

    // Regenerate message
    const newCleanMessage = await rewriteMessage(
      originalMessage,
      card[0].vibe as any,
      card[0].occasionId
    );

    // Update database
    await db.update(cards)
      .set({ cleanMessage: newCleanMessage })
      .where(eq(cards.id, id));

    return NextResponse.json({
      cleanMessage: newCleanMessage,
    });
  } catch (error) {
    console.error('Error regenerating message:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate message' },
      { status: 500 }
    );
  }
}
