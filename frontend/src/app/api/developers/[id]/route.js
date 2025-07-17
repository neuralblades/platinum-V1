import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

// GET /api/developers/[id]
export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    
    const developer = await db.developers.getById(id);

    if (!developer) {
      return NextResponse.json(
        { success: false, message: 'Developer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: developer
    });

  } catch (error) {
    console.error('Developer GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch developer',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/developers/[id]
export async function PUT(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    const formData = await request.formData();
    
    const developer = await db.developers.getById(id);

    if (!developer) {
      return NextResponse.json(
        { success: false, message: 'Developer not found' },
        { status: 404 }
      );
    }

    let logoUrl = null;
    let backgroundImageUrl = null;

    // Handle logo file upload to Supabase FIRST
    const logoFile = formData.get('logo');
    console.log('Logo file received:', logoFile?.name, 'Size:', logoFile?.size, 'Type:', logoFile?.type);
    if (logoFile && logoFile instanceof File && logoFile.size > 0) {
      try {
        const logoFileName = `developers/logos/${Date.now()}_${Math.random().toString(36).substring(7)}_${logoFile.name}`;
        console.log('Uploading logo to:', logoFileName);
        
        // Convert File to ArrayBuffer
        const arrayBuffer = await logoFile.arrayBuffer();
        const fileData = new Uint8Array(arrayBuffer);
        console.log('File converted, size:', fileData.length, 'bytes');
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(logoFileName, fileData, {
            contentType: logoFile.type,
            cacheControl: '3600'
          });

        if (!error) {
          console.log('Upload successful:', data);
          // Get public URL
          const { data: publicUrlData } = supabase.storage
            .from('property-images')
            .getPublicUrl(data.path);

          logoUrl = publicUrlData.publicUrl;
          console.log('Logo URL:', logoUrl);
        } else {
          console.error('Error uploading logo:', error);
        }
      } catch (uploadError) {
        console.error('Error processing logo:', uploadError);
      }
    }

    // Handle background image file upload to Supabase FIRST
    const backgroundImageFile = formData.get('backgroundImage');
    if (backgroundImageFile && backgroundImageFile instanceof File && backgroundImageFile.size > 0) {
      try {
        const bgFileName = `developers/backgrounds/${Date.now()}_${Math.random().toString(36).substring(7)}_${backgroundImageFile.name}`;
        
        // Convert File to ArrayBuffer
        const arrayBuffer = await backgroundImageFile.arrayBuffer();
        const fileData = new Uint8Array(arrayBuffer);
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(bgFileName, fileData, {
            contentType: backgroundImageFile.type,
            cacheControl: '3600'
          });

        if (!error) {
          // Get public URL
          const { data: publicUrlData } = supabase.storage
            .from('property-images')
            .getPublicUrl(data.path);

          backgroundImageUrl = publicUrlData.publicUrl;
        } else {
          console.error('Error uploading background image:', error);
        }
      } catch (uploadError) {
        console.error('Error processing background image:', uploadError);
      }
    }

    // Extract form data with uploaded URLs (no File objects)
    const updateData = {
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description'),
      website: formData.get('website'),
      established: formData.get('established') ? parseInt(formData.get('established')) : null,
      headquarters: formData.get('headquarters'),
      featured: formData.get('featured') === 'true',
      isActive: formData.get('isActive') !== 'false'
    };

    // Only add logo if we have a valid URL
    if (logoUrl && typeof logoUrl === 'string') {
      updateData.logo = logoUrl;
    }

    // Only add backgroundImage if we have a valid URL
    if (backgroundImageUrl && typeof backgroundImageUrl === 'string') {
      updateData.backgroundImage = backgroundImageUrl;
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === null || updateData[key] === '') {
        delete updateData[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updatedDeveloper = await db.developers.update(id, updateData);

    return NextResponse.json({
      success: true,
      data: updatedDeveloper,
      message: 'Developer updated successfully'
    });

  } catch (error) {
    console.error('Developer UPDATE Error:', error);
    
    if (error.code === '23505') { // PostgreSQL unique violation
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors: [{ field: 'slug', message: 'Slug already exists' }]
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update developer',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/developers/[id]
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    
    const developer = await db.developers.getById(id);

    if (!developer) {
      return NextResponse.json(
        { success: false, message: 'Developer not found' },
        { status: 404 }
      );
    }

    // Check if developer has associated properties
    const { count } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('developer_id', id);

    if (count > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Cannot delete developer. There are ${count} properties associated with this developer. Please remove or reassign the properties first.` 
        },
        { status: 409 }
      );
    }

    await db.developers.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Developer deleted successfully'
    });

  } catch (error) {
    console.error('Developer DELETE Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete developer',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}