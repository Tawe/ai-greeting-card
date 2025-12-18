import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { occasions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/occasions
 * Returns all active occasions for selection
 */
export async function GET() {
  try {
    const activeOccasions = await db
      .select({
        id: occasions.id,
        name: occasions.name,
      })
      .from(occasions)
      .where(eq(occasions.isActive, true))
      .orderBy(occasions.name);

    return NextResponse.json(activeOccasions);
  } catch (error) {
    console.error('Error fetching occasions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch occasions' },
      { status: 500 }
    );
  }
}
