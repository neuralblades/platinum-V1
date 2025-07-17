import { NextResponse } from 'next/server';

// GET /api/blog/categories - Get all unique categories from blog posts
// Note: This blog system uses tags instead of categories
export async function GET() {
  try {
    // Return empty categories since this blog system uses tags instead
    return NextResponse.json({
      success: true,
      data: [],
      message: 'This blog system uses tags instead of categories. Use /api/blog/tags instead.'
    });

  } catch (error) {
    console.error('Blog Categories API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch blog categories',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}