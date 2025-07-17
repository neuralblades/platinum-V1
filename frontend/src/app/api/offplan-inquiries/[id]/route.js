import { initializeModels } from '../../../../../lib/models';
import { NextResponse } from 'next/server';

// GET /api/offplan-inquiries/[id] - Get specific offplan inquiry
export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    
    
    

    const inquiry = await OffplanInquiry.findByPk(id);

    if (!inquiry) {
      return NextResponse.json(
        { success: false, message: 'Offplan inquiry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: inquiry
    });

  } catch (error) {
    console.error('Offplan Inquiry GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch offplan inquiry',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/offplan-inquiries/[id] - Update offplan inquiry (admin only)
export async function PUT(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await request.json();
    
    
    

    const inquiry = await OffplanInquiry.findByPk(id);

    if (!inquiry) {
      return NextResponse.json(
        { success: false, message: 'Offplan inquiry not found' },
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
      message: 'Offplan inquiry updated successfully'
    });

  } catch (error) {
    console.error('Offplan Inquiry UPDATE Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update offplan inquiry',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/offplan-inquiries/[id] - Delete offplan inquiry (admin only)
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    
    
    

    const inquiry = await OffplanInquiry.findByPk(id);

    if (!inquiry) {
      return NextResponse.json(
        { success: false, message: 'Offplan inquiry not found' },
        { status: 404 }
      );
    }

    await inquiry.destroy();

    return NextResponse.json({
      success: true,
      message: 'Offplan inquiry deleted successfully'
    });

  } catch (error) {
    console.error('Offplan Inquiry DELETE Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete offplan inquiry',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}