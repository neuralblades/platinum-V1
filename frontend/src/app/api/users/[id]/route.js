import { initializeModels } from '../../../../../lib/models';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// GET /api/users/[id] - Get specific user
export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    
    
    

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] } // Don't return password
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
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
    
    
    

    const user = await User.findByPk(id);

    if (!user) {
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
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({
        where: { 
          email: updateData.email,
          id: { [db.Sequelize.Op.ne]: id } // Exclude current user
        }
      });

      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            message: 'User with this email already exists'
          },
          { status: 409 }
        );
      }
    }

    await user.update(updateData);

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    return NextResponse.json({
      success: true,
      data: userResponse,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('User UPDATE Error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors: error.errors.map(err => ({
            field: err.path,
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
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
    
    
    

    const user = await User.findByPk(id);

    if (!user) {
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

    await user.update(updateData);

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

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
    
    
    

    const user = await User.findByPk(id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of admin users (optional safety check)
    if (user.role === 'admin') {
      return NextResponse.json(
        { success: false, message: 'Cannot delete admin users' },
        { status: 403 }
      );
    }

    await user.destroy();

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