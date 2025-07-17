'use client';

import api from './api';
import { fetchWithErrorHandling, objectToQueryParams } from './utils';

// Types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string | null;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  authorId: string;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string | null;
  };
  comments?: BlogComment[];
}

export interface BlogComment {
  id: string;
  content: string;
  postId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

export interface BlogFilter {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
  status?: 'published' | 'draft';
}

export interface BlogPostsResponse {
  success: boolean;
  count: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
  posts: BlogPost[];
}

export interface BlogPostResponse {
  success: boolean;
  post: BlogPost;
}

export interface BlogCategoriesResponse {
  success: boolean;
  categories: string[];
}

export interface BlogTagsResponse {
  success: boolean;
  tags: { name: string; count: number }[];
}

export interface BlogCommentResponse {
  success: boolean;
  message: string;
  comment: BlogComment;
}

// Get all blog posts with filtering
export const getBlogPosts = async (filters: BlogFilter = {}) => {
  try {
    const queryParams = objectToQueryParams(filters);
    const response = await api.get(`/blog?${queryParams.toString()}`);
    return response.data as BlogPostsResponse;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw error;
  }
};

// Get featured blog posts
export const getFeaturedBlogPosts = async (limit: number = 3) => {
  return fetchWithErrorHandling(
    `/api/blog/featured?limit=${limit}`,
    'Failed to fetch featured blog posts'
  );
};

// Get recent blog posts
export const getRecentBlogPosts = async (limit: number = 5) => {
  return fetchWithErrorHandling(
    `/api/blog/recent?limit=${limit}`,
    'Failed to fetch recent blog posts'
  );
};

// Get blog post by ID
export const getBlogPostById = async (id: string) => {
  try {
    const response = await api.get(`/blog/${id}`);
    return response.data as BlogPostResponse;
  } catch (error) {
    console.error(`Error fetching blog post with ID ${id}:`, error);
    throw error;
  }
};

// Get blog post by slug
export const getBlogPostBySlug = async (slug: string) => {
  try {
    const response = await api.get(`/blog/slug/${slug}`);
    return response.data as BlogPostResponse;
  } catch (error) {
    console.error(`Error fetching blog post with slug ${slug}:`, error);
    throw error;
  }
};

// Create a new blog post
export const createBlogPost = async (formData: FormData) => {
  try {
    const response = await api.post('/blog', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }
};

// Update a blog post
export const updateBlogPost = async (id: string, formData: FormData) => {
  try {
    const response = await api.put(`/blog/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating blog post with ID ${id}:`, error);
    throw error;
  }
};

// Delete a blog post
export const deleteBlogPost = async (id: string) => {
  try {
    const response = await api.delete(`/blog/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting blog post with ID ${id}:`, error);
    throw error;
  }
};

// Get blog categories
export const getBlogCategories = async () => {
  try {
    const response = await api.get('/blog/categories');
    return response.data as BlogCategoriesResponse;
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    throw error;
  }
};

// Get blog tags
export const getBlogTags = async () => {
  try {
    const response = await api.get('/blog/tags');
    return response.data as BlogTagsResponse;
  } catch (error) {
    console.error('Error fetching blog tags:', error);
    throw error;
  }
};

// Add a comment to a blog post
export const addBlogComment = async (postId: string, content: string) => {
  try {
    const response = await api.post('/blog/comments', { postId, content });
    return response.data as BlogCommentResponse;
  } catch (error) {
    console.error('Error adding blog comment:', error);
    throw error;
  }
};

// Get full image URL
export const getBlogImageUrl = (imagePath: string | null) => {
  if (!imagePath) return '/images/blog-placeholder.jpg';

  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Remove '/api' from the API URL if it exists
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
  return `${baseUrl}/uploads/blog/${imagePath}`;
};
