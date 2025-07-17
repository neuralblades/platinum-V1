import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

// In-memory cache for individual properties
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

// GET /api/properties/[id]
export async function GET(request, { params }) {
  // Rate limiting
  if (!checkRateLimit(request)) {
    return NextResponse.json(
      { success: false, message: 'Too many requests' },
      { status: 429 }
    );
  }

  const { id } = await params;

  // Validate ID
  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json(
      { success: false, message: 'Invalid property ID' },
      { status: 400 }
    );
  }

  const propertyId = parseInt(id);
  const cacheKey = `property_${propertyId}`;

  // Check cache
  const cachedData = cache.get(cacheKey);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return NextResponse.json({
      ...cachedData.data,
      fromCache: true
    });
  }

  try {
    const property = await db.properties.getById(propertyId);

    if (!property) {
      return NextResponse.json(
        { success: false, message: 'Property not found' },
        { status: 404 }
      );
    }

    // Get inquiry count for this property
    const inquiryCount = await db.properties.getInquiryCount(propertyId);

    // Get similar properties (same type, nearby price range)
    const similarProperties = await db.properties.getSimilar(propertyId, property.property_type, property.price);

    // Transform property data
    const transformedProperty = {
      ...property,
      // Add computed fields
      priceFormatted: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      }).format(property.price),
      areaFormatted: `${property.area} sq ft`,
      // Ensure arrays
      images: Array.isArray(property.images) ? property.images : [],
      features: Array.isArray(property.features) ? property.features : [],
      // Add metadata
      inquiryCount,
      // Add SEO-friendly URL
      slug: property.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    };

    const result = {
      success: true,
      data: transformedProperty,
      similarProperties: similarProperties.map(prop => ({
        ...prop,
        priceFormatted: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0
        }).format(prop.price),
        areaFormatted: `${prop.area} sq ft`
      })),
      meta: {
        inquiryCount,
        lastUpdated: property.updated_at
      }
    };

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Property API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch property',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/properties/[id]
export async function PUT(request, { params }) {
  const { id } = await params;

  // Validate ID
  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json(
      { success: false, message: 'Invalid property ID' },
      { status: 400 }
    );
  }

  try {
    const formData = await request.formData();

    const property = await db.properties.getById(parseInt(id));

    if (!property) {
      return NextResponse.json(
        { success: false, message: 'Property not found' },
        { status: 404 }
      );
    }

    // Extract form data
    const propertyData = {
      title: formData.get('title'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price')),
      location: formData.get('location'),
      address: formData.get('address'),
      city: formData.get('city'),
      state: formData.get('state'),
      zip_code: formData.get('zipCode'),
      property_type: formData.get('propertyType'),
      status: formData.get('status') || 'available',
      is_offplan: formData.get('isOffplan') === 'true',
      bedrooms: parseInt(formData.get('bedrooms')) || 0,
      bathrooms: parseFloat(formData.get('bathrooms')) || 0,
      area: parseFloat(formData.get('area')),
      bedroom_range: formData.get('bedroomRange'),
      features: formData.get('features') ? JSON.parse(formData.get('features')) : [],
      agent_id: parseInt(formData.get('agentId')),
      developer_id: formData.get('developerId') ? parseInt(formData.get('developerId')) : null,
      featured: formData.get('featured') === 'true',
      year_built: formData.get('yearBuilt') ? parseInt(formData.get('yearBuilt')) : null,
      payment_plan: formData.get('paymentPlan'),
      latitude: formData.get('latitude') ? parseFloat(formData.get('latitude')) : null,
      longitude: formData.get('longitude') ? parseFloat(formData.get('longitude')) : null
    };

    // Handle image updates (basic implementation for now)
    const existingImages = formData.get('existingImages');
    if (existingImages) {
      propertyData.images = JSON.parse(existingImages);
    }

    const mainImage = formData.get('mainImage');
    if (mainImage) {
      propertyData.main_image = mainImage;
    }

    // Remove undefined values
    Object.keys(propertyData).forEach(key => {
      if (propertyData[key] === undefined || propertyData[key] === null || propertyData[key] === '') {
        delete propertyData[key];
      }
    });

    // Update property
    const updatedProperty = await db.properties.update(parseInt(id), propertyData);

    // Clear cache for this property
    cache.delete(`property_${id}`);

    return NextResponse.json({
      success: true,
      data: updatedProperty,
      message: 'Property updated successfully'
    });

  } catch (error) {
    console.error('Update Property API Error:', error);
    
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
        message: 'Failed to update property',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id]
export async function DELETE(request, { params }) {
  const { id } = await params;

  // Validate ID
  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json(
      { success: false, message: 'Invalid property ID' },
      { status: 400 }
    );
  }

  try {
    const property = await db.properties.getById(parseInt(id));

    if (!property) {
      return NextResponse.json(
        { success: false, message: 'Property not found' },
        { status: 404 }
      );
    }

    // Delete property
    await db.properties.delete(parseInt(id));

    // Clear cache
    cache.delete(`property_${id}`);

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully'
    });

  } catch (error) {
    console.error('Delete Property API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete property',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}