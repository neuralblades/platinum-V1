import { db } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// GET /api/users/[id] - Get specific user
export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params.id;

    const user = await db.users.getById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword
    });

  } catch (error) {
    console.error('User GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch user',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user (admin only)
export async function PUT(request, context) {
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

    // Update allowed fields
    const allowedFields = ['name', 'email', 'phone', 'role', 'isActive'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = field === 'email' ? body[field].toLowerCase().trim() : body[field];
      }
    });

    // Handle password update separately
    if (body.password && body.password.trim()) {
      const saltRounds = 12;
      updateData.password = await bcrypt.hash(body.password, saltRounds);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Check for email uniqueness if email is being updated
    if (updateData.email && updateData.email !== existingUser.email) {
      try {
        const duplicateUser = await db.users.getByEmail(updateData.email);
        if (duplicateUser && duplicateUser.id !== parseInt(id)) {
          return NextResponse.json(
            {
              success: false,
              message: 'User with this email already exists'
            },
            { status: 409 }
          );
        }
      } catch (error) {
        // If getByEmail throws an error (user not found), that's good - continue
        if (!error.message?.includes('not found')) {
          throw error;
        }
      }
    }

    const updatedUser = await db.users.update(id, updateData);

    // Remove password from response
    const { password, ...userResponse } = updatedUser;

    return NextResponse.json({
      success: true,
      data: userResponse,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('User UPDATE Error:', error);
    
    // Handle Supabase unique constraint errors
    if (error.code === '23505') { // Unique constraint violation
      return NextResponse.json(
        {
          success: false,
          message: 'User with this email already exists'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update user',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - Update specific user fields (admin only)
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

    // Only allow specific fields for PATCH (typically used for role updates)
    const allowedFields = ['role', 'isActive'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updatedUser = await db.users.update(id, updateData);

    // Remove password from response
    const { password, ...userResponse } = updatedUser;

    return NextResponse.json({
      success: true,
      data: userResponse,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('User PATCH Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update user',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user (admin only)
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const id = params.id;

    // Check if user exists
    const existingUser = await db.users.getById(id);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of admin users (optional safety check)
    if (existingUser.role === 'admin') {
      return NextResponse.json(
        { success: false, message: 'Cannot delete admin users' },
        { status: 403 }
      );
    }

    await db.users.delete(id);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('User DELETE Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete user',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}