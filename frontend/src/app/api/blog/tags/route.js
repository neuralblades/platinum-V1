import supabase from "../../../../../lib/supabase";
import { NextResponse } from 'next/server';

// GET /api/blog/tags - Get all unique tags from blog posts
export async function GET() {
  try {
    const { data: blogPosts, error } = await supabase
      .from('blog_posts')
      .select('tags')
      .eq('status', 'published')
      .not('tags', 'is', null);

    if (error) throw error;

    // Extract and flatten all tags
    const allTags = [];
    blogPosts.forEach(post => {
      if (post.tags) {
        // Split tags by comma and clean up
        const postTags = post.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        allTags.push(...postTags);
      }
    });

    // Get unique tags and count occurrences
    const tagCounts = {};
    allTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });

    // Convert to array and sort by count (descending)
    const tags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      data: tags
    });

  } catch (error) {
    console.error('Blog Tags API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch blog tags',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}