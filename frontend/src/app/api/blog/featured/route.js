import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

// In-memory cache for featured blog posts
const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Rate limiting store
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 200; // requests per window

// Rate limiting function
function checkRateLimit(request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();
  
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  const rateLimitData = rateLimit.get(ip);
  
  if (now > rateLimitData.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (rateLimitData.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  rateLimitData.count++;
  return true;
}

// GET /api/blog/featured
export async function GET(request) {
  // Rate limiting
  if (!checkRateLimit(request)) {
    return NextResponse.json(
      { success: false, message: 'Too many requests' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 3;

    // Generate cache key
    const cacheKey = `featured_blog_posts_${limit}`;
    
    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        ...cachedData.data,
        fromCache: true
      });
    }

    // Get featured blog posts
    const blogPosts = await db.blogs.getFeatured();

    // Transform data for frontend
    const transformedBlogPosts = blogPosts.map(post => ({
      ...post,
      // Add computed fields
      publishedAtFormatted: post.published_at 
        ? new Date(post.published_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : null,
      // Ensure tags are arrays
      tags: post.tags || []
    }));

    const result = {
      success: true,
      data: transformedBlogPosts,
      count: transformedBlogPosts.length,
      message: 'Featured blog posts retrieved successfully'
    };

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Featured Blog Posts API Error:', error);
    
    // If no blog posts table exists yet, return empty data
    if (error.message.includes('does not exist')) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: 'No blog posts available yet'
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch featured blog posts',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}