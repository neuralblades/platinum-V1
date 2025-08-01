import { db } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET /api/messages/[id] - Get specific message
export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params.id;

    const message = await db.messages.getById(id);

    if (!message) {
      return NextResponse.json(
        { success: false, message: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Message GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch message',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/messages/[id] - Update message (admin only)
export async function PUT(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await request.json();

    // Check if message exists first
    const existingMessage = await db.messages.getById(id);
    if (!existingMessage) {
      return NextResponse.json(
        { success: false, message: 'Message not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    const allowedFields = ['status', 'notes', 'assignedTo', 'repliedAt'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Auto-set repliedAt when status changes to replied
    if (updateData.status === 'replied' && !updateData.repliedAt) {
      updateData.repliedAt = new Date().toISOString();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updatedMessage = await db.messages.update(id, updateData);

    return NextResponse.json({
      success: true,
      data: updatedMessage,
      message: 'Message updated successfully'
    });

  } catch (error) {
    console.error('Message UPDATE Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update message',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/messages/[id] - Delete message (admin only)
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const id = params.id;

    // Check if message exists first
    const existingMessage = await db.messages.getById(id);
    if (!existingMessage) {
      return NextResponse.json(
        { success: false, message: 'Message not found' },
        { status: 404 }
      );
    }

    await db.messages.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Message DELETE Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete message',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}