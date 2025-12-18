import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredCards } from '@/lib/cleanup';

/**
 * POST /api/cleanup
 * 
 * Cleanup job endpoint for expired cards.
 * Should be called by a cron job (e.g., Vercel Cron, GitHub Actions, etc.)
 * 
 * Security: Add authentication token check in production
 */
export async function POST(request: NextRequest) {
  // Optional: Add authentication token check
  const authToken = request.headers.get('authorization');
  const expectedToken = process.env.CLEANUP_AUTH_TOKEN;
  
  if (expectedToken && authToken !== `Bearer ${expectedToken}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    console.log('🧹 Starting cleanup job...');
    const startTime = Date.now();
    
    const result = await cleanupExpiredCards();
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ Cleanup completed in ${duration}ms`);
    console.log(`   - Total expired: ${result.totalExpired}`);
    console.log(`   - Deleted: ${result.deleted}`);
    console.log(`   - Errors: ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      console.error('   Errors:', result.errors);
    }

    return NextResponse.json({
      success: true,
      result: {
        totalExpired: result.totalExpired,
        deleted: result.deleted,
        errors: result.errors.length,
        errorDetails: result.errors,
        durationMs: duration,
      },
    });
  } catch (error) {
    console.error('❌ Cleanup job failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cleanup
 * 
 * Health check endpoint to verify cleanup route is accessible
 */
export async function GET() {
  return NextResponse.json({
    message: 'Cleanup endpoint is active',
    endpoint: '/api/cleanup',
    method: 'POST',
  });
}
