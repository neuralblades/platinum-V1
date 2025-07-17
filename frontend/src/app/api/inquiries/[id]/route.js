import { db } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET /api/inquiries/[id] - Get specific inquiry
export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params.id;

    // Get inquiry with property details using Supabase join
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .select(`
        *,
        property:properties(
          id,
          title,
          price,
          location
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return NextResponse.json(
          { success: false, message: 'Inquiry not found' },
          { status: 404 }
        );
      }
      throw error;
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

    // Check if inquiry exists first
    const existingInquiry = await db.inquiries.getById(id);
    if (!existingInquiry) {
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

    const updatedInquiry = await db.inquiries.update(id, updateData);

    return NextResponse.json({
      success: true,
      data: updatedInquiry,
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

    // Check if inquiry exists first
    const existingInquiry = await db.inquiries.getById(id);
    if (!existingInquiry) {
      return NextResponse.json(
        { success: false, message: 'Inquiry not found' },
        { status: 404 }
      );
    }

    await db.inquiries.delete(id);

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