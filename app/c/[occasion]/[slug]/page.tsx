import { Metadata } from 'next';
import { Suspense } from 'react';
import { db } from '@/lib/db';
import { cards, occasions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { getFontFamilyCSS } from '@/lib/fonts';
import CardView from '@/components/CardView';

interface PageProps {
  params: Promise<{
    occasion: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { occasion, slug } = await params;
  
  const card = await db
    .select({
      card: cards,
      occasion: occasions,
    })
    .from(cards)
    .innerJoin(occasions, eq(cards.occasionId, occasions.id))
    .where(and(eq(cards.slug, slug), eq(cards.occasionId, occasion)))
    .limit(1);

  if (card.length === 0) {
    return {
      title: 'Card Not Found',
    };
  }

  const { card: cardData, occasion: occasionData } = card[0];

  // Check if expired
  if (new Date() > cardData.expiresAt) {
    return {
      title: 'Card Expired',
    };
  }

  const vibeCapitalized = cardData.vibe.charAt(0).toUpperCase() + cardData.vibe.slice(1);

  return {
    title: `A ${vibeCapitalized} ${occasionData.name} Card`,
    description: 'A beautiful holiday card created with AI',
    openGraph: {
      title: `A ${vibeCapitalized} ${occasionData.name} Card`,
      description: 'A beautiful holiday card created with AI',
      images: [cardData.coverImageUrl],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `A ${vibeCapitalized} ${occasionData.name} Card`,
      description: 'A beautiful holiday card created with AI',
      images: [cardData.coverImageUrl],
    },
  };
}

export default async function CardPage({ params }: PageProps) {
  const { occasion, slug } = await params;
  
  const card = await db
    .select({
      card: cards,
      occasion: occasions,
    })
    .from(cards)
    .innerJoin(occasions, eq(cards.occasionId, occasions.id))
    .where(and(eq(cards.slug, slug), eq(cards.occasionId, occasion)))
    .limit(1);

  if (card.length === 0) {
    notFound();
  }

  const { card: cardData, occasion: occasionData } = card[0];

  // Check if expired
  if (new Date() > cardData.expiresAt) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Card Expired</h1>
          <p className="text-gray-600">This card has expired and is no longer available.</p>
        </div>
      </div>
    );
  }

  // Check if published
  if (cardData.status !== 'published') {
    notFound();
  }

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <CardView
        card={{
          id: cardData.id,
          slug: cardData.slug,
          occasion: occasionData.name,
          vibe: cardData.vibe as any,
          cleanMessage: cardData.cleanMessage,
          coverImageUrl: cardData.coverImageUrl,
        }}
      />
    </Suspense>
  );
}
