import supabase from '../../../../lib/supabase';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// POST /api/setup-admin - Create initial admin user
export async function POST() {
  try {
    // Check if admin already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (existingAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: 'Admin user already exists'
        },
        { status: 409 }
      );
    }

    // Create default admin user
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    const { error: createError } = await supabase
      .from('users')
      .insert({
        name: 'Admin User',
        email: 'admin@platinumsquare.com',
        password: hashedPassword,
        role: 'admin',
        is_active: true
      })
      .select()
      .single();

    if (createError) throw createError;

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      credentials: {
        email: 'admin@platinumsquare.com',
        password: 'admin123'
      }
    });

  } catch (error) {
    console.error('Setup Admin Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create admin user',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}