import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cards } from '@/lib/db/schema';
import { generateSlug } from '@/lib/utils/slug';
import { generateCreatorHash } from '@/lib/utils/hash';
import { calculateExpirationDate } from '@/lib/utils/expiration';
import { rewriteMessage, generateCoverImage } from '@/lib/ai/gemini';
import { uploadImage, generateImageKey } from '@/lib/storage';
import { rateLimitMiddleware, checkIPRateLimit, checkDeviceRateLimit, getDeviceIdentifier } from '@/lib/rate-limit';
import { moderateContent, getModerationErrorMessage } from '@/lib/moderation';
import { config } from '@/lib/config';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { occasion, vibe, message } = body;

    // Validate input
    if (!occasion || !vibe || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: occasion, vibe, message' },
        { status: 400 }
      );
    }

    if (!['warm', 'funny', 'fancy', 'chaotic'].includes(vibe)) {
      return NextResponse.json(
        { error: 'Invalid vibe. Must be one of: warm, funny, fancy, chaotic' },
        { status: 400 }
      );
    }

    // Get IP and user agent for rate limiting and creator hash
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               request.headers.get('cf-connecting-ip') ||
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const deviceHash = getDeviceIdentifier(ip, userAgent);
    const creatorHash = generateCreatorHash(ip, userAgent);

    // Check rate limits
    const rateLimitResponse = await rateLimitMiddleware(request);
    if (rateLimitResponse) {
      return rateLimitResponse; // Rate limit exceeded
    }

    // Get remaining limits for response headers
    const ipLimit = await checkIPRateLimit(ip);
    const deviceLimit = await checkDeviceRateLimit(deviceHash);

    // Pre-process message (content moderation)
    const moderationResult = moderateContent(message);
    if (!moderationResult.allowed) {
      return NextResponse.json(
        {
          error: 'Content moderation failed',
          message: getModerationErrorMessage(moderationResult),
        },
        { status: 400 }
      );
    }
    const cleanedInputMessage = moderationResult.cleaned;

    // Generate card ID first (needed for image key generation)
    const cardId = nanoid();

    // Generate AI content (using cleaned input message)
    let cleanMessage: string;
    try {
      cleanMessage = await rewriteMessage(cleanedInputMessage, vibe, occasion);
    } catch (error) {
      // Provide user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('503')) {
          return NextResponse.json(
            { error: 'AI service is temporarily overloaded. Please try again in a few moments.' },
            { status: 503 }
          );
        }
        if (error.message.includes('blocked') || error.message.includes('unsafe')) {
          return NextResponse.json(
            { 
              error: 'Content moderation failed',
              message: 'Your message could not be processed. Please revise and try again.',
            },
            { status: 400 }
          );
        }
      }
      throw error; // Re-throw other errors
    }
    
    // Generate cover image
    let coverImageUrl: string;
    try {
      const imageBuffer = await generateCoverImage(vibe, occasion);
      console.log(`✅ Image generated, size: ${imageBuffer.length} bytes`);
      
      const imageKey = generateImageKey(cardId);
      console.log(`📤 Uploading image to S3: ${imageKey}`);
      
      coverImageUrl = await uploadImage(imageBuffer, imageKey, 'image/png');
      console.log(`✅ Image uploaded successfully: ${coverImageUrl}`);
    } catch (error) {
      console.error('❌ Error generating/uploading cover image:', error);
      if (error instanceof Error) {
        console.error('   Error name:', error.name);
        console.error('   Error message:', error.message);
        console.error('   Error stack:', error.stack);
        
        // Provide user-friendly error messages
        if (error.message.includes('STORAGE_BUCKET_NAME') || error.message.includes('Storage credentials')) {
          return NextResponse.json(
            { 
              error: 'Storage configuration error',
              message: 'Image storage is not properly configured. Please contact support.',
            },
            { status: 500 }
          );
        }
        if (error.message.includes('AccessDenied') || error.message.includes('403')) {
          return NextResponse.json(
            { 
              error: 'Storage access denied',
              message: 'Unable to upload image. Please check storage permissions.',
            },
            { status: 500 }
          );
        }
        if (error.message.includes('GEMINI_API_KEY')) {
          return NextResponse.json(
            { 
              error: 'AI service configuration error',
              message: 'Image generation service is not properly configured.',
            },
            { status: 500 }
          );
        }
      }
      // For other errors, return generic error
      return NextResponse.json(
        { 
          error: 'Failed to generate card image',
          message: 'Unable to create card cover image. Please try again.',
        },
        { status: 500 }
      );
    }

    // Generate slug
    const slug = generateSlug();

    // Calculate expiration
    const expiresAt = calculateExpirationDate();
    const newCard = await db.insert(cards).values({
      id: cardId,
      slug,
      occasionId: occasion,
      vibe,
      cleanMessage,
      coverImageUrl,
      themeVersion: '1.0',
      expiresAt,
      creatorHash,
      status: 'draft',
    }).returning();

    // Return response with rate limit headers
    const response = NextResponse.json({
      id: newCard[0].id,
      slug: newCard[0].slug,
      occasion: newCard[0].occasionId,
      vibe: newCard[0].vibe,
      cleanMessage: newCard[0].cleanMessage,
      coverImageUrl: newCard[0].coverImageUrl,
      status: newCard[0].status,
    });

    // Add rate limit headers
    response.headers.set('X-RateLimit-IP-Limit', config.rateLimit.ipMax.toString());
    response.headers.set('X-RateLimit-IP-Remaining', ipLimit.remaining.toString());
    response.headers.set('X-RateLimit-IP-Reset', new Date(ipLimit.resetAt).getTime().toString());
    
    response.headers.set('X-RateLimit-Device-Limit', config.rateLimit.deviceMax.toString());
    response.headers.set('X-RateLimit-Device-Remaining', deviceLimit.remaining.toString());
    response.headers.set('X-RateLimit-Device-Reset', new Date(deviceLimit.resetAt).getTime().toString());

    return response;
  } catch (error) {
    console.error('Error creating card:', error);
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    );
  }
}
