import { initializeModels } from '../../../../../lib/models';
import { NextResponse } from 'next/server';

// GET /api/inquiries/[id] - Get specific inquiry
export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    
    
    

    const inquiry = await Inquiry.findByPk(id, {
      include: [
        {
          model: db.Property,
          as: 'property',
          attributes: ['id', 'title', 'price', 'location']
        }
      ]
    });

    if (!inquiry) {
      return NextResponse.json(
        { success: false, message: 'Inquiry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: inquiry
    });

  } catch (error) {
    console.error('Inquiry GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch inquiry',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/inquiries/[id] - Update inquiry (admin only)
export async function PUT(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await request.json();
    
    
    

    const inquiry = await Inquiry.findByPk(id);

    if (!inquiry) {
      return NextResponse.json(
        { success: false, message: 'Inquiry not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    const allowedFields = ['status', 'notes', 'assignedTo'];
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

    await inquiry.update(updateData);

    return NextResponse.json({
      success: true,
      data: inquiry,
      message: 'Inquiry updated successfully'
    });

  } catch (error) {
    console.error('Inquiry UPDATE Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update inquiry',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/inquiries/[id] - Delete inquiry (admin only)
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    
    
    

    const inquiry = await Inquiry.findByPk(id);

    if (!inquiry) {
      return NextResponse.json(
        { success: false, message: 'Inquiry not found' },
        { status: 404 }
      );
    }

    await inquiry.destroy();

    return NextResponse.json({
      success: true,
      message: 'Inquiry deleted successfully'
    });

  } catch (error) {
    console.error('Inquiry DELETE Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete inquiry',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}