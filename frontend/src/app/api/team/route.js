import { NextResponse } from 'next/server';
import supabase, { db } from '../../../../lib/supabase';

// In-memory cache for team members
const cache = new Map();
const CACHE_DURATION = 20 * 60 * 1000; // 20 minutes

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

// GET /api/team
export async function GET(request) {
  // Rate limiting
  if (!checkRateLimit(request)) {
    return NextResponse.json(
      { success: false, message: 'Too many requests' },
      { status: 429 }
    );
  }

  try {
    const cacheKey = 'active_team_members';
    
    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        ...cachedData.data,
        fromCache: true
      });
    }

    
    

    // Get active team members
    const { data: teamMembers, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;

    // Transform data for frontend
    const transformedTeamMembers = (teamMembers || []).map(member => ({
      ...member,
      // Map database fields to frontend expected fields
      socialLinks: member.social_links || {},
      isLeadership: member.is_leadership || false,
      createdAt: member.created_at,
      updatedAt: member.updated_at,
      isActive: member.is_active
    }));

    const result = {
      success: true,
      data: transformedTeamMembers,
      count: transformedTeamMembers.length,
      message: 'Team members retrieved successfully'
    };

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Team Members API Error:', error);
    
    // If no team members table exists yet, return empty data
    if (error.message.includes('does not exist')) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: 'No team members available yet'
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch team members',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST /api/team
export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Extract form data - map frontend fields to database fields
    const teamData = {
      name: formData.get('name'),
      position: formData.get('position'),
      bio: formData.get('bio'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      image: formData.get('image'), // This will be the file path/URL
      social_links: formData.get('socialLinks') ? JSON.parse(formData.get('socialLinks')) : {},
      is_active: formData.get('isActive') !== 'false',
      is_leadership: formData.get('isLeadership') === 'true', // Frontend sends 'isLeadership', DB expects 'is_leadership'
      sort_order: formData.get('sortOrder') ? parseInt(formData.get('sortOrder')) : 0
    };

    // Validate required fields
    const requiredFields = ['name', 'position'];
    const missingFields = requiredFields.filter(field => !teamData[field]);

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

    // Remove null/undefined values
    Object.keys(teamData).forEach(key => {
      if (teamData[key] === null || teamData[key] === undefined || teamData[key] === '') {
        delete teamData[key];
      }
    });

    // Create team member
    const { data: teamMember, error: createError } = await supabase
      .from('team_members')
      .insert(teamData)
      .select()
      .single();

    if (createError) throw createError;

    // Clear cache
    cache.clear();

    return NextResponse.json(
      {
        success: true,
        data: teamMember,
        message: 'Team member created successfully'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create Team Member API Error:', error);
    
    // Handle Supabase-specific errors
    if (error.code === '23502') { // PostgreSQL not null constraint violation
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
          error: process.env.NODE_ENV === 'development' ? error.message : 'Validation error'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create team member',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}