import { NextResponse } from 'next/server';
import supabase, { db } from '../../../../lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// GET /api/users - Get all users (admin only)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    
    // Build query
    let query = supabase
      .from('users')
      .select('id, name, email, role, phone, is_active, created_at, updated_at, last_login');
    
    if (role) {
      query = query.eq('role', role);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Get total count
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Apply pagination and sorting
    const offset = (page - 1) * limit;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: rows, error } = await query;
    if (error) throw error;

    // Transform data for frontend
    const transformedUsers = (rows || []).map(user => {
      // Split name into firstName and lastName for frontend compatibility
      const nameParts = user.name ? user.name.split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      return {
        ...user,
        firstName,
        lastName,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLogin: user.last_login
      };
    });

    const totalPages = Math.ceil(count / limit);

    return NextResponse.json({
      success: true,
      data: transformedUsers,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Users API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch users',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user (admin only)
export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'email', 'password'];
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

    // Check if user already exists
    const existingUser = await db.users.getByEmail(body.email.toLowerCase().trim());

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User with this email already exists'
        },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(body.password, saltRounds);

    // Create user
    const user = await db.users.create({
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      password: hashedPassword,
      role: body.role || 'user',
      phone: body.phone || null,
      is_active: body.isActive !== undefined ? body.isActive : true
    });

    // Generate JWT token for registration
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    // For registration, return user with token
    const responseData = {
      success: true,
      message: 'User created successfully',
      user: {
        ...userResponse,
        token
      }
    };

    // Also support admin user creation (without token)
    if (body.role && ['admin', 'agent'].includes(body.role)) {
      responseData.data = userResponse;
      delete responseData.user;
    }

    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    console.error('User Creation Error:', error);
    
    if (error.code === '23505') { // PostgreSQL unique violation
      return NextResponse.json(
        {
          success: false,
          message: 'User with this email already exists'
        },
        { status: 409 }
      );
    }

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
        message: 'Failed to create user',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}