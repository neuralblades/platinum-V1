import { NextResponse } from 'next/server';
import supabase, { db } from '../../../../lib/supabase';
import jwt from 'jsonwebtoken';

// In-memory cache for properties (in production, use Redis or similar)
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

// GET /api/properties
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
    
    const params = {
      page: parseInt(searchParams.get('page')) || 1,
      limit: parseInt(searchParams.get('limit')) || 9,
      type: searchParams.get('type'),
      status: searchParams.get('status'),
      isOffplan: searchParams.get('isOffplan'),
      minPrice: searchParams.get('minPrice'),
      maxPrice: searchParams.get('maxPrice'),
      bedrooms: searchParams.get('bedrooms'),
      bathrooms: searchParams.get('bathrooms'),
      minArea: searchParams.get('minArea'),
      maxArea: searchParams.get('maxArea'),
      location: searchParams.get('location'),
      yearBuilt: searchParams.get('yearBuilt'),
      search: searchParams.get('search'),
      featured: searchParams.get('featured'),
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'DESC',
      developerId: searchParams.get('developerId')
    };

    // Generate cache key
    const cacheKey = `properties_${JSON.stringify(params)}`;
    
    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        ...cachedData.data,
        fromCache: true
      });
    }

    // Execute queries in parallel for better performance
    const [properties, totalCount] = await Promise.all([
      db.properties.getAll(params),
      db.properties.getCount(params)
    ]);

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

    // Calculate offset for pagination
    const offset = (params.page - 1) * params.limit;

    const result = {
      success: true,
      data: transformedProperties,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: totalCount,
        pages: Math.ceil(totalCount / params.limit),
        hasNext: offset + params.limit < totalCount,
        hasPrev: params.page > 1
      },
      filters: {
        type: params.type,
        status: params.status,
        isOffplan: params.isOffplan,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        bedrooms: params.bedrooms,
        bathrooms: params.bathrooms,
        minArea: params.minArea,
        maxArea: params.maxArea,
        location: params.location,
        yearBuilt: params.yearBuilt,
        search: params.search,
        featured: params.featured,
        developerId: params.developerId
      }
    };

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    // Clean up old cache entries periodically
    if (cache.size > 100) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Properties API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch properties',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST /api/properties
export async function POST(request) {
  try {
    // Get user from authorization header
    const authorization = request.headers.get('authorization');
    let currentUserId = null;
    
    if (authorization && authorization.startsWith('Bearer ')) {
      try {
        const token = authorization.split(' ')[1];
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        const decoded = jwt.verify(token, jwtSecret);
        currentUserId = decoded.userId;
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }

    const formData = await request.formData();

    // Extract form data
    const propertyData = {
      title: formData.get('title'),
      description: formData.get('description'),
      price: formData.get('price') ? parseFloat(formData.get('price')) : 0,
      location: formData.get('location'),
      address: formData.get('address'),
      city: formData.get('city'),
      state: formData.get('state'),
      zip_code: formData.get('zipCode'),
      property_type: formData.get('propertyType'),
      status: formData.get('status') || 'available',
      is_offplan: formData.get('isOffplan') === 'true',
      bedrooms: formData.get('bedrooms') ? parseInt(formData.get('bedrooms')) : 0,
      bathrooms: formData.get('bathrooms') ? parseFloat(formData.get('bathrooms')) : 0,
      area: formData.get('area') ? parseFloat(formData.get('area')) : 0,
      bedroom_range: formData.get('bedroomRange'),
      features: formData.get('features') ? JSON.parse(formData.get('features')) : [],
      agent_id: formData.get('agentId') ? parseInt(formData.get('agentId')) : (currentUserId || 1),
      developer_id: formData.get('developerId') ? parseInt(formData.get('developerId')) : null,
      featured: formData.get('featured') === 'true',
      year_built: formData.get('yearBuilt') ? parseInt(formData.get('yearBuilt')) : null,
      payment_plan: formData.get('paymentPlan'),
      latitude: formData.get('latitude') ? parseFloat(formData.get('latitude')) : null,
      longitude: formData.get('longitude') ? parseFloat(formData.get('longitude')) : null
    };

    // Validate required fields
    const requiredFields = ['title', 'description', 'price', 'location', 'property_type', 'area'];
    const missingFields = requiredFields.filter(field => !propertyData[field]);

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


    // Handle image uploads
    const imageFiles = formData.getAll('images');
    const headerImageFile = formData.get('headerImage');
    const mainImageUrl = formData.get('mainImage');
    
    const uploadedImageUrls = [];
    let headerImageUrl = '';

    // Process regular images
    for (const file of imageFiles) {
      if (file && file instanceof File && file.size > 0) {
        try {
          const fileName = `properties/${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name}`;
          
          // Convert File to ArrayBuffer
          const arrayBuffer = await file.arrayBuffer();
          const fileData = new Uint8Array(arrayBuffer);
          
          // Upload to Supabase Storage
          const { data, error } = await supabase.storage
            .from('property-images')
            .upload(fileName, fileData, {
              contentType: file.type,
              cacheControl: '3600'
            });

          if (error) {
            console.error('Error uploading image:', error);
            continue;
          }

          // Get public URL
          const { data: publicUrlData } = supabase.storage
            .from('property-images')
            .getPublicUrl(data.path);

          uploadedImageUrls.push(publicUrlData.publicUrl);
        } catch (uploadError) {
          console.error('Error processing image:', uploadError);
        }
      }
    }

    // Process header image
    if (headerImageFile && headerImageFile instanceof File && headerImageFile.size > 0) {
      try {
        const fileName = `headers/${Date.now()}_${Math.random().toString(36).substring(7)}_${headerImageFile.name}`;
        
        // Convert File to ArrayBuffer
        const arrayBuffer = await headerImageFile.arrayBuffer();
        const fileData = new Uint8Array(arrayBuffer);
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(fileName, fileData, {
            contentType: headerImageFile.type,
            cacheControl: '3600'
          });

        if (!error) {
          // Get public URL
          const { data: publicUrlData } = supabase.storage
            .from('property-images')
            .getPublicUrl(data.path);

          headerImageUrl = publicUrlData.publicUrl;
        } else {
          console.error('Error uploading header image:', error);
        }
      } catch (uploadError) {
        console.error('Error processing header image:', uploadError);
      }
    }

    // Set images and main image
    propertyData.images = uploadedImageUrls;
    
    // Set main_image to first uploaded image, ignore the placeholder "new_upload_0"
    if (uploadedImageUrls.length > 0) {
      propertyData.main_image = uploadedImageUrls[0];
    } else if (mainImageUrl && mainImageUrl !== 'new_upload_0') {
      propertyData.main_image = mainImageUrl;
    } else {
      // If no images uploaded, provide a default placeholder
      propertyData.main_image = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&q=80';
    }
    
    // Add header image if provided
    if (headerImageUrl) {
      propertyData.header_image = headerImageUrl;
    }

    // Create property
    const property = await db.properties.create(propertyData);

    // Fetch created property with associations
    const createdProperty = await db.properties.getById(property.id);

    // Clear cache since we added a new property
    cache.clear();

    return NextResponse.json(
      {
        success: true,
        data: createdProperty,
        message: 'Property created successfully'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create Property API Error:', error);
    
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
        message: 'Failed to create property',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}