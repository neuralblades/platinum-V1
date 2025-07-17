import { NextResponse } from 'next/server';
import supabase, { db } from '../../../../../lib/supabase';

// GET /api/testimonials/[id]
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, message: 'Invalid testimonial ID' },
        { status: 400 }
      );
    }

    const { data: testimonial, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (error || !testimonial) {
      return NextResponse.json(
        { success: false, message: 'Testimonial not found' },
        { status: 404 }
      );
    }

    // Transform database fields to frontend expected fields
    const transformedTestimonial = {
      ...testimonial,
      id: testimonial.id.toString(),
      quote: testimonial.content,
      role: testimonial.position || 'Customer',
      isActive: testimonial.is_active,
      order: testimonial.featured ? 1 : 2,
      createdAt: testimonial.created_at,
      updatedAt: testimonial.updated_at
    };

    return NextResponse.json({
      success: true,
      data: transformedTestimonial
    });

  } catch (error) {
    console.error('Testimonial GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch testimonial',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/testimonials/[id]
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, message: 'Invalid testimonial ID' },
        { status: 400 }
      );
    }

    // Check if testimonial exists
    const { data: existingTestimonial, error: fetchError } = await supabase
      .from('testimonials')
      .select('id')
      .eq('id', parseInt(id))
      .single();

    if (fetchError || !existingTestimonial) {
      return NextResponse.json(
        { success: false, message: 'Testimonial not found' },
        { status: 404 }
      );
    }

    // Extract and map form data to database fields
    const updateData = {};
    
    if (formData.get('name')) updateData.name = formData.get('name');
    if (formData.get('quote')) updateData.content = formData.get('quote'); // Frontend sends 'quote', DB expects 'content'
    if (formData.get('role')) updateData.position = formData.get('role'); // Frontend sends 'role', DB expects 'position'
    if (formData.get('rating')) updateData.rating = parseInt(formData.get('rating'));
    if (formData.get('company')) updateData.company = formData.get('company');
    if (formData.get('image')) updateData.image = formData.get('image');
    if (formData.get('featured')) updateData.featured = formData.get('featured') === 'true';
    if (formData.get('isActive')) updateData.is_active = formData.get('isActive') !== 'false';

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update the testimonial
    const { data: updatedTestimonial, error: updateError } = await supabase
      .from('testimonials')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Transform response for frontend
    const transformedTestimonial = {
      ...updatedTestimonial,
      id: updatedTestimonial.id.toString(),
      quote: updatedTestimonial.content,
      role: updatedTestimonial.position || 'Customer',
      isActive: updatedTestimonial.is_active,
      order: updatedTestimonial.featured ? 1 : 2,
      createdAt: updatedTestimonial.created_at,
      updatedAt: updatedTestimonial.updated_at
    };

    return NextResponse.json({
      success: true,
      data: transformedTestimonial,
      message: 'Testimonial updated successfully'
    });

  } catch (error) {
    console.error('Testimonial UPDATE Error:', error);
    
    if (error.code === '23502') { // PostgreSQL not null violation
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
          error: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update testimonial',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/testimonials/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, message: 'Invalid testimonial ID' },
        { status: 400 }
      );
    }

    // Check if testimonial exists
    const { data: existingTestimonial, error: fetchError } = await supabase
      .from('testimonials')
      .select('id')
      .eq('id', parseInt(id))
      .single();

    if (fetchError || !existingTestimonial) {
      return NextResponse.json(
        { success: false, message: 'Testimonial not found' },
        { status: 404 }
      );
    }

    // Delete the testimonial
    const { error: deleteError } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', parseInt(id));

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });

  } catch (error) {
    console.error('Testimonial DELETE Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete testimonial',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}