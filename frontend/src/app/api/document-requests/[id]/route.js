import { initializeModels } from '../../../../../lib/models';
import { NextResponse } from 'next/server';

// GET /api/document-requests/[id] - Get specific document request
export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    
    
    

    const documentRequest = await DocumentRequest.findByPk(id);

    if (!documentRequest) {
      return NextResponse.json(
        { success: false, message: 'Document request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: documentRequest
    });

  } catch (error) {
    console.error('Document Request GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch document request',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/document-requests/[id] - Update document request (admin only)
export async function PUT(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await request.json();
    
    
    

    const documentRequest = await DocumentRequest.findByPk(id);

    if (!documentRequest) {
      return NextResponse.json(
        { success: false, message: 'Document request not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    const allowedFields = ['status', 'notes', 'assignedTo', 'completedAt'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Auto-set completedAt when status changes to completed
    if (updateData.status === 'completed' && !updateData.completedAt) {
      updateData.completedAt = new Date();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    await documentRequest.update(updateData);

    return NextResponse.json({
      success: true,
      data: documentRequest,
      message: 'Document request updated successfully'
    });

  } catch (error) {
    console.error('Document Request UPDATE Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update document request',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/document-requests/[id] - Delete document request (admin only)
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    
    
    

    const documentRequest = await DocumentRequest.findByPk(id);

    if (!documentRequest) {
      return NextResponse.json(
        { success: false, message: 'Document request not found' },
        { status: 404 }
      );
    }

    await documentRequest.destroy();

    return NextResponse.json({
      success: true,
      message: 'Document request deleted successfully'
    });

  } catch (error) {
    console.error('Document Request DELETE Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete document request',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}