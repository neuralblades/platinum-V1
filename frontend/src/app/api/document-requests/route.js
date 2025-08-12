import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

// Rate limiting store
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5; // requests per window

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

// GET /api/document-requests - Get all document requests
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build Supabase query
    let query = supabase
      .from('document_requests')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: rows, error, count } = await query;

    if (error) {
      // If table doesn't exist, return empty data
      if (error.message.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: limit
          }
        });
      }
      throw error;
    }

    const totalPages = Math.ceil(count / limit);

    return NextResponse.json({
      success: true,
      data: rows || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Document Requests API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch document requests',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST /api/document-requests - Create new document request
export async function POST(request) {
  // Rate limiting
  if (!checkRateLimit(request)) {
    return NextResponse.json(
      { success: false, message: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'documentType'];
    const missingFields = requiredFields.filter(field => !body[field]);

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

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please provide a valid email address'
        },
        { status: 400 }
      );
    }

    // Create document request
    const { data: documentRequest, error: createError } = await supabase
      .from('document_requests')
      .insert({
        name: body.name.trim(),
        email: body.email.toLowerCase().trim(),
        phone: body.phone.trim(),
        document_type: body.documentType.trim(),
        property_reference: body.propertyReference || null,
        additional_info: body.additionalInfo || null,
        status: 'pending',
        source: body.source || 'website'
      })
      .select()
      .single();

    if (createError) throw createError;

    return NextResponse.json(
      {
        success: true,
        data: documentRequest,
        message: 'Document request submitted successfully'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Document Request Creation Error:', error);
    
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
        message: 'Failed to submit document request',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}