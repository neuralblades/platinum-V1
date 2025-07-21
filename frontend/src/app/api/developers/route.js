import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

// In-memory cache for developers
const cache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

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

// GET /api/developers
export async function GET(request) {
  // Rate limiting
  if (!checkRateLimit(request)) {
    return NextResponse.json(
      { success: false, message: 'Too many requests' },
      { status: 429 }
    );
  }

  try {
    const cacheKey = 'active_developers';
    
    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        ...cachedData.data,
        fromCache: true
      });
    }

    // Get active developers with property count
    const { data: developers, error } = await supabase
      .from('developers')
      .select(`
        *,
        properties!developer_id(id)
      `)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;

    // Transform data for frontend
    const transformedDevelopers = developers.map(developer => ({
      ...developer,
      // Add computed fields
      propertyCount: developer.properties ? developer.properties.length : 0,
      // Remove the properties array from response (we only need the count)
      properties: undefined
    }));

    const result = {
      success: true,
      data: transformedDevelopers,
      count: transformedDevelopers.length,
      message: 'Developers retrieved successfully'
    };

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Developers API Error:', error);
    
    // If no developers table exists yet, return empty data
    if (error.message.includes('does not exist')) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: 'No developers available yet'
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch developers',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST /api/developers
export async function POST(request) {
  try {
    const formData = await request.formData();
    

    let logoUrl = null;
    let backgroundImageUrl = null;

    // Handle logo file upload to Supabase FIRST
    const logoFile = formData.get('logo');
    console.log('Logo file:', logoFile, 'Type:', typeof logoFile, 'Is File:', logoFile instanceof File); // Debug
    if (logoFile && logoFile instanceof File && logoFile.size > 0) {
      try {
        const logoFileName = `developers/logos/${Date.now()}_${Math.random().toString(36).substring(7)}_${logoFile.name}`;
        
        // Convert File to ArrayBuffer
        const arrayBuffer = await logoFile.arrayBuffer();
        const fileData = new Uint8Array(arrayBuffer);
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(logoFileName, fileData, {
            contentType: logoFile.type,
            cacheControl: '3600'
          });

        if (!error) {
          // Get public URL
          const { data: publicUrlData } = supabase.storage
            .from('property-images')
            .getPublicUrl(data.path);

          logoUrl = publicUrlData.publicUrl;
          console.log('Logo uploaded successfully:', logoUrl); // Debug
        } else {
          console.error('Error uploading logo:', error);
        }
      } catch (uploadError) {
        console.error('Error processing logo:', uploadError);
      }
    }

    // Handle background image file upload to Supabase FIRST
    const backgroundImageFile = formData.get('backgroundImage');
    if (backgroundImageFile && backgroundImageFile instanceof File && backgroundImageFile.size > 0) {
      try {
        const bgFileName = `developers/backgrounds/${Date.now()}_${Math.random().toString(36).substring(7)}_${backgroundImageFile.name}`;
        
        // Convert File to ArrayBuffer
        const arrayBuffer = await backgroundImageFile.arrayBuffer();
        const fileData = new Uint8Array(arrayBuffer);
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(bgFileName, fileData, {
            contentType: backgroundImageFile.type,
            cacheControl: '3600'
          });

        if (!error) {
          // Get public URL
          const { data: publicUrlData } = supabase.storage
            .from('property-images')
            .getPublicUrl(data.path);

          backgroundImageUrl = publicUrlData.publicUrl;
        } else {
          console.error('Error uploading background image:', error);
        }
      } catch (uploadError) {
        console.error('Error processing background image:', uploadError);
      }
    }

    // NOW extract form data with uploaded URLs (no File objects)
    const developerData = {
      name: formData.get('name'),
      slug: formData.get('slug') || formData.get('name')?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''), // Auto-generate slug from name if not provided
      description: formData.get('description'),
      website: formData.get('website'),
      established: formData.get('established') ? parseInt(formData.get('established')) : null,
      headquarters: formData.get('headquarters'),
      featured: formData.get('featured') === 'true',
      isActive: formData.get('isActive') !== 'false' // Default to true
    };

    // Only add logo if we have a valid URL
    if (logoUrl && typeof logoUrl === 'string') {
      developerData.logo = logoUrl;
    }

    // Only add backgroundImage if we have a valid URL
    if (backgroundImageUrl && typeof backgroundImageUrl === 'string') {
      developerData.backgroundImage = backgroundImageUrl;
    }

    console.log('Developer data to be saved:', developerData); // Debug log

    // Validate required fields
    const requiredFields = ['name', 'slug'];
    const missingFields = requiredFields.filter(field => !developerData[field]);

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
    Object.keys(developerData).forEach(key => {
      if (developerData[key] === undefined || developerData[key] === null || developerData[key] === '') {
        delete developerData[key];
      }
    });

    // Create developer
    const developer = await db.developers.create(developerData);

    // Clear cache
    cache.clear();

    return NextResponse.json(
      {
        success: true,
        data: developer,
        message: 'Developer created successfully'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create Developer API Error:', error);
    
    if (error.code === '23505') { // PostgreSQL unique violation
      return NextResponse.json(
        {
          success: false,
          message: 'Developer with this slug already exists'
        },
        { status: 409 }
      );
    }

    if (error.code === '23502') { // PostgreSQL not null violation
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
          error: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create developer',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}