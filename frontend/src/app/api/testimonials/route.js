import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

// In-memory cache for testimonials
const cache = new Map();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Rate limiting store
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 100; // requests per window

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

// GET /api/testimonials
export async function GET(request) {
  // Rate limiting
  if (!checkRateLimit(request)) {
    return NextResponse.json(
      { success: false, message: 'Too many requests' },
      { status: 429 }
    );
  }

  try {
    const cacheKey = 'active_testimonials';
    
    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        ...cachedData.data,
        fromCache: true
      });
    }

    // Get active and approved testimonials
    const testimonials = await db.testimonials.getAll();

    // Transform data for frontend
    const transformedTestimonials = testimonials.map(testimonial => ({
      ...testimonial,
      // Map database fields to frontend expected fields
      id: testimonial.id.toString(),
      quote: testimonial.content,
      role: testimonial.position || 'Customer',
      isActive: testimonial.is_active,
      order: testimonial.featured ? 1 : 2,
      createdAt: testimonial.created_at,
      updatedAt: testimonial.updated_at
    }));

    const result = {
      success: true,
      data: transformedTestimonials,
      count: transformedTestimonials.length,
      message: 'Testimonials retrieved successfully'
    };

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Testimonials API Error:', error);
    
    // If no testimonials table exists yet, return empty data
    if (error.message.includes('does not exist')) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: 'No testimonials available yet'
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch testimonials',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST /api/testimonials
export async function POST(request) {
  try {
    const formData = await request.formData();

    // Extract form data - map frontend fields to database fields
    const testimonialData = {
      name: formData.get('name'),
      content: formData.get('quote') || formData.get('content'), // Frontend sends 'quote', DB expects 'content'
      rating: formData.get('rating') ? parseInt(formData.get('rating')) : null,
      position: formData.get('role') || formData.get('position'), // Frontend sends 'role', DB expects 'position'
      company: formData.get('company'),
      image: formData.get('image'),
      featured: formData.get('featured') === 'true',
      is_active: formData.get('isActive') !== 'false'
    };

    // Validate required fields
    const requiredFields = ['name', 'content', 'rating'];
    const missingFields = requiredFields.filter(field => !testimonialData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
          missingFields
        },
        { status: 400 }
      );
    }

    // Remove undefined values
    Object.keys(testimonialData).forEach(key => {
      if (testimonialData[key] === undefined || testimonialData[key] === null || testimonialData[key] === '') {
        delete testimonialData[key];
      }
    });

    // Create testimonial (will be pending approval)
    const testimonial = await db.testimonials.create({
      ...testimonialData,
      status: 'pending' // New testimonials need approval
    });

    // Clear cache
    cache.clear();

    return NextResponse.json(
      {
        success: true,
        data: testimonial,
        message: 'Testimonial submitted successfully. It will be reviewed before being published.'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create Testimonial API Error:', error);
    
    if (error.code === '23502') { // PostgreSQL not null violation
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          error: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create testimonial',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}