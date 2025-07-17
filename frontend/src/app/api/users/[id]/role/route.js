import { db } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// PATCH /api/users/[id]/role - Update user role (admin only)
export async function PATCH(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await request.json();

    // Check if user exists
    const existingUser = await db.users.getById(id);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Validate role
    const { role } = body;
    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Role is required' },
        { status: 400 }
      );
    }

    const validRoles = ['user', 'agent', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role. Must be one of: user, agent, admin' },
        { status: 400 }
      );
    }

    // Update user role
    const updatedUser = await db.users.update(id, { role });

    // Remove password from response
    const { password, ...userResponse } = updatedUser;

    return NextResponse.json({
      success: true,
      data: userResponse,
      message: 'User role updated successfully'
    });

  } catch (error) {
    console.error('User role update Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update user role',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}