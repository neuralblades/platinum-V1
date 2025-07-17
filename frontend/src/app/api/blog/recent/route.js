import supabase from "../../../../../lib/supabase";
import { NextResponse } from 'next/server';

// GET /api/blog/recent - Get recent blog posts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 5;

    const { data: blogPosts, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, published_at, image, author_id')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Get authors for the blog posts
    if (blogPosts && blogPosts.length > 0) {
      const authorIds = [...new Set(blogPosts.map(post => post.author_id).filter(Boolean))];
      
      if (authorIds.length > 0) {
        const { data: authors } = await supabase
          .from('users')
          .select('id, name, email')
          .in('id', authorIds);

        const authorMap = new Map(authors?.map(author => [author.id, author]) || []);
        
        const postsWithAuthors = blogPosts.map(post => ({
          ...post,
          // Map database fields to frontend expected fields
          featuredImage: post.image,
          authorId: post.author_id,
          publishedAt: post.published_at,
          author: post.author_id ? authorMap.get(post.author_id) : null
        }));

        return NextResponse.json({
          success: true,
          data: postsWithAuthors
        });
      }
    }

    // Transform data even when no authors
    const transformedPosts = (blogPosts || []).map(post => ({
      ...post,
      // Map database fields to frontend expected fields
      featuredImage: post.image,
      authorId: post.author_id,
      publishedAt: post.published_at,
      author: null
    }));

    return NextResponse.json({
      success: true,
      data: transformedPosts
    });

  } catch (error) {
    console.error('Recent Blog Posts API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch recent blog posts',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}