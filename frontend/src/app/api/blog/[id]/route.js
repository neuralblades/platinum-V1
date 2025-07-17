import supabase from "../../../../../lib/supabase";
import { NextResponse } from 'next/server';

// GET /api/blog/[id] - Get blog post by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const { data: blogPost, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        author:users(id, name, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            message: 'Blog post not found'
          },
          { status: 404 }
        );
      }
      throw error;
    }

    // Transform data for frontend
    const transformedBlogPost = {
      ...blogPost,
      // Map database fields to frontend expected fields
      featuredImage: blogPost.image,
      authorId: blogPost.author?.id || null,
      viewCount: blogPost.view_count || 0,
      publishedAt: blogPost.published_at,
      createdAt: blogPost.created_at,
      updatedAt: blogPost.updated_at
    };

    return NextResponse.json({
      success: true,
      data: transformedBlogPost
    });

  } catch (error) {
    console.error('Blog Post API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch blog post',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/blog/[id] - Update blog post
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const formData = await request.formData();
    
    // Extract form data
    const blogData = {
      title: formData.get('title'),
      content: formData.get('content'),
      excerpt: formData.get('excerpt'),
      category: formData.get('category'),
      tags: formData.get('tags'),
      status: formData.get('status') || 'draft',
      featured: formData.get('featured') === 'true',
      image: formData.get('featuredImage') // This will be file path/URL
    };

    // Validate required fields
    const requiredFields = ['title', 'content', 'excerpt'];
    const missingFields = requiredFields.filter(field => !blogData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
          missingFields
        },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = blogData.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    blogData.slug = slug;

    // Set published_at if status is published and wasn't published before
    if (blogData.status === 'published') {
      // Check if it was already published
      const { data: existingPost } = await supabase
        .from('blog_posts')
        .select('published_at')
        .eq('id', id)
        .single();

      if (existingPost && !existingPost.published_at) {
        blogData.published_at = new Date().toISOString();
      }
    }

    // Remove null/undefined values
    Object.keys(blogData).forEach(key => {
      if (blogData[key] === null || blogData[key] === undefined || blogData[key] === '') {
        delete blogData[key];
      }
    });

    // Update blog post
    const { data: blogPost, error: updateError } = await supabase
      .from('blog_posts')
      .update(blogData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            message: 'Blog post not found'
          },
          { status: 404 }
        );
      }
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      data: blogPost,
      message: 'Blog post updated successfully'
    });

  } catch (error) {
    console.error('Blog Update Error:', error);
    
    // Handle duplicate slug error
    if (error.code === '23505') {
      return NextResponse.json(
        {
          success: false,
          message: 'A blog post with this title already exists'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update blog post',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/blog/[id] - Delete blog post
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully'
    });

  } catch (error) {
    console.error('Blog Delete Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete blog post',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}