import { NextResponse } from 'next/server';
import supabase, { db } from '../../../../lib/supabase';

// Rate limiting store
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 10; // requests per window (stricter for contact form)

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

// POST /api/contact
export async function POST(request) {
  // Rate limiting (stricter for contact form)
  if (!checkRateLimit(request)) {
    return NextResponse.json(
      { success: false, message: 'Too many contact form submissions. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'email', 'subject', 'message'];
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

    // Create message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        name: body.name.trim(),
        email: body.email.toLowerCase().trim(),
        phone: body.phone || null,
        subject: body.subject.trim(),
        message: body.message.trim(),
        status: 'new',
        source: 'contact_form'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        data: {
          id: message.id,
          message: 'Thank you for your message! We will get back to you soon.'
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Contact Form API Error:', error);
    
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
        message: 'Failed to send message. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}