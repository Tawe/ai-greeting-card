import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cards } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { config } from '@/lib/config';

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

    // Update status to published
    await db.update(cards)
      .set({ status: 'published' })
      .where(eq(cards.id, id));

    // Generate deep link - use request origin/host to get the correct production URL
    const origin = request.headers.get('origin') || 
                  request.headers.get('x-forwarded-host') ? 
                    `https://${request.headers.get('x-forwarded-host')}` : 
                    (request.headers.get('host') ? `https://${request.headers.get('host')}` : null);
    const baseUrl = origin || config.app.url;
    const deepLink = `${baseUrl}/c/${card[0].occasionId}/${card[0].slug}`;

    return NextResponse.json({
      id: card[0].id,
      slug: card[0].slug,
      deepLink,
      status: 'published',
    });
  } catch (error) {
    console.error('Error publishing card:', error);
    return NextResponse.json(
      { error: 'Failed to publish card' },
      { status: 500 }
    );
  }
}
