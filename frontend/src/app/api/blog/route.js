import { NextResponse } from 'next/server';

// In-memory cache for blog posts
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

// GET /api/blog
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
      limit: parseInt(searchParams.get('limit')) || 10,
      featured: searchParams.get('featured'),
      search: searchParams.get('search'),
      sortBy: searchParams.get('sortBy') || 'publishedAt',
      sortOrder: searchParams.get('sortOrder') || 'DESC'
    };

    // Generate cache key
    const cacheKey = `blog_posts_${JSON.stringify(params)}`;
    
    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        ...cachedData.data,
        fromCache: true
      });
    }

    // Build query for blog posts
    let query = supabase
      .from('blog_posts')
      .select(`
        id, title, excerpt, image, published_at, view_count, featured, slug, tags,
        author:users(id, name, email, profile_image)
      `)
      .eq('status', 'published');

    // Apply filters
    if (params.featured !== null) {
      query = query.eq('featured', params.featured === 'true');
    }

    // Search functionality
    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,excerpt.ilike.%${params.search}%,content.ilike.%${params.search}%`);
    }

    // Get total count
    let countQuery = supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');
    
    if (params.featured !== null) {
      countQuery = countQuery.eq('featured', params.featured === 'true');
    }
    if (params.search) {
      countQuery = countQuery.or(`title.ilike.%${params.search}%,excerpt.ilike.%${params.search}%,content.ilike.%${params.search}%`);
    }

    // Sorting
    const allowedSortFields = ['published_at', 'title', 'view_count'];
    const sortField = allowedSortFields.includes(params.sortBy.replace('publishedAt', 'published_at')) 
      ? params.sortBy.replace('publishedAt', 'published_at')
      : 'published_at';
    const ascending = params.sortOrder.toLowerCase() === 'asc';
    query = query.order(sortField, { ascending });

    // Pagination
    const offset = (params.page - 1) * params.limit;
    query = query.range(offset, offset + params.limit - 1);

    // Execute queries in parallel for better performance
    const [{ data: blogPosts, error: blogError }, { count: totalCount, error: countError }] = await Promise.all([
      query,
      countQuery
    ]);

    if (blogError) throw blogError;
    if (countError) throw countError;

    // Transform data for frontend
    const transformedBlogPosts = blogPosts.map(post => ({
      ...post,
      // Map database fields to frontend expected fields
      featuredImage: post.image,
      authorId: post.author?.id || null,
      viewCount: post.view_count || 0,
      publishedAt: post.published_at,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      // Add computed fields
      publishedAtFormatted: post.published_at 
        ? new Date(post.published_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : null,
      // Ensure tags are arrays
      tags: post.tags || [],
      // Add reading time estimate (based on excerpt/content length)
      readingTime: Math.max(1, Math.ceil((post.excerpt?.length || 200) / 200)) + ' min read'
    }));

    const result = {
      success: true,
      data: transformedBlogPosts,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: totalCount,
        pages: Math.ceil(totalCount / params.limit),
        hasNext: offset + params.limit < totalCount,
        hasPrev: params.page > 1
      },
      filters: {
        featured: params.featured,
        search: params.search,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder
      }
    };

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Blog Posts API Error:', error);
    
    // If no blog posts table exists yet, return empty data
    if (error.message.includes('does not exist')) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
          hasNext: false,
          hasPrev: false
        }
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch blog posts',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST /api/blog - Create new blog post
export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const blogData = {
      title: formData.get('title'),
      content: formData.get('content'),
      excerpt: formData.get('excerpt'),
      category: formData.get('category'),
      tags: formData.get('tags'),
      status: formData.get('status') || 'draft',
      featured: formData.get('featured') === 'true',
      image: formData.get('featuredImage'), // This will be file path/URL
      author_id: 1 // Default admin user
    };

    // Validate required fields
    const requiredFields = ['title', 'content', 'excerpt'];
    const missingFields = requiredFields.filter(field => !blogData[field]);

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

    // Generate slug from title
    const slug = blogData.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    blogData.slug = slug;

    // Set published_at if status is published
    if (blogData.status === 'published') {
      blogData.published_at = new Date().toISOString();
    }

    // Remove null/undefined values
    Object.keys(blogData).forEach(key => {
      if (blogData[key] === null || blogData[key] === undefined || blogData[key] === '') {
        delete blogData[key];
      }
    });

    // Create blog post
    const { data: blogPost, error: createError } = await supabase
      .from('blog_posts')
      .insert(blogData)
      .select()
      .single();

    if (createError) throw createError;

    return NextResponse.json(
      {
        success: true,
        data: blogPost,
        message: 'Blog post created successfully'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Blog Creation Error:', error);
    
    // Handle duplicate slug error
    if (error.code === '23505') {
      return NextResponse.json(
        {
          success: false,
          message: 'A blog post with this title already exists'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create blog post',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}