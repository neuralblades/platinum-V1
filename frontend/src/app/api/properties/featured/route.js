import { NextResponse } from 'next/server';
import supabase, { db } from '../../../../../lib/supabase';

// In-memory cache for featured properties
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

// GET /api/properties/featured
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
    const cacheKey = `featured_properties_${limit}`;
    
    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        ...cachedData.data,
        fromCache: true
      });
    }

    // Get featured properties
    const properties = await db.properties.getFeatured();

    // Transform data for frontend
    const transformedProperties = properties.map(property => ({
      ...property,
      // Add computed fields
      priceFormatted: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      }).format(property.price),
      areaFormatted: `${property.area} sq ft`,
      // PostgreSQL JSONB automatically handles arrays properly
      images: property.images || [],
      features: property.features || []
    }));

    const result = {
      success: true,
      data: transformedProperties,
      count: transformedProperties.length,
      message: 'Featured properties retrieved successfully'
    };

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Featured Properties API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch featured properties',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}