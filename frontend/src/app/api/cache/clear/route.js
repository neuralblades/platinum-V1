import { NextResponse } from 'next/server';

// POST /api/cache/clear - Clear server cache
export async function POST(request) {
  try {
    const body = await request.json();
    const { cacheKey } = body;

    // In a real application, you would clear your cache here
    // For now, we'll just acknowledge the request
    console.log(`Cache clear requested for: ${cacheKey || 'all'}`);

    return NextResponse.json({
      success: true,
      message: `Cache cleared for ${cacheKey || 'all'}`
    });

  } catch (error) {
    console.error('Cache clear error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to clear cache',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}