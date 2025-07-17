'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BlogCard from '@/components/blog/BlogCard';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { getBlogPosts, BlogPost, BlogFilter } from '@/services/blogService';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { useQuery } from '@tanstack/react-query';

const BlogPage: React.FC = () => {
  const searchParams = useSearchParams();

  // Get filter params from URL
  const category = searchParams.get('category') || undefined;
  const tag = searchParams.get('tag') || undefined;
  const search = searchParams.get('search') || undefined;
  const page = parseInt(searchParams.get('page') || '1');

  const filters: BlogFilter = {
    page,
    limit: 9,
    category,
    tag,
    search,
    status: 'published',
  };

  const { data = { posts: [], totalPages: 1, currentPage: 1, hasMore: false, count: 0, message: '' }, isLoading, isError } = useQuery({
    queryKey: ['blogPosts', filters],
    queryFn: () => getBlogPosts(filters),
  });

  const posts: BlogPost[] = data?.posts || [];
  const totalPages: number = data?.totalPages || 1;
  const currentPage: number = data?.currentPage || 1;
  const hasMore: boolean = data?.hasMore || false;
  const totalPosts: number = data?.count || 0;

  function hasMessage(obj: unknown): obj is { message: string } {
    return typeof obj === 'object' && obj !== null && 'message' in (obj as Record<string, unknown>) && typeof (obj as Record<string, unknown>).message === 'string';
  }
  const error: string | null = isError ? (hasMessage(data) ? data.message : 'Failed to load blog posts.') : null;

  // Generate pagination links
  const getPaginationLinks = () => {
    const links = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    if (currentPage > 1) {
      links.push(
        <Link
          key="prev"
          href={`/blog?page=${currentPage - 1}${category ? `&category=${encodeURIComponent(category)}` : ''}${tag ? `&tag=${encodeURIComponent(tag)}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          <span className="sr-only">Previous</span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      );
    }
    for (let i = startPage; i <= endPage; i++) {
      links.push(
        <Link
          key={i}
          href={`/blog?page=${i}${category ? `&category=${encodeURIComponent(category)}` : ''}${tag ? `&tag=${encodeURIComponent(tag)}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
          className={`flex h-10 w-10 items-center justify-center rounded-md ${
            i === currentPage
              ? 'bg-gray-600 text-white'
              : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {i}
        </Link>
      );
    }
    if (hasMore) {
      links.push(
        <Link
          key="next"
          href={`/blog?page=${currentPage + 1}${category ? `&category=${encodeURIComponent(category)}` : ''}${tag ? `&tag=${encodeURIComponent(tag)}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          <span className="sr-only">Next</span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      );
    }
    return links;
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="mb-6 opacity-100 translate-y-0 transition-all duration-500">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Blog' },
              ...(category ? [{ label: `Category: ${category}` }] : []),
              ...(tag ? [{ label: `Tag: ${tag}` }] : []),
              ...(search ? [{ label: `Search: ${search}` }] : [])
            ]}
          />
        </div>
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 opacity-100 translate-y-0 transition-all duration-500">
            {category ? `${category} Articles` :
             tag ? `Articles Tagged "${tag}"` :
             search ? `Search Results for "${search}"` :
             'Our Blog'}
          </h1>
          <p className="mt-2 text-lg text-gray-600 opacity-100 translate-y-0 transition-all duration-500">
            {category ? `Browse our latest articles in the ${category} category` :
             tag ? `Browse articles related to ${tag}` :
             search ? `Found ${totalPosts} articles matching your search` :
             'Insights, tips, and news from the real estate world'}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="h-80 rounded-xl bg-gray-200 animate-pulse"
                  />
                ))}
              </div>
            ) : isError ? (
              <div>
                <div className="rounded-lg bg-red-50 p-4 text-red-800">
                  <p>{error}</p>
                </div>
              </div>
            ) : posts.length === 0 ? (
              <div>
                <div className="rounded-lg bg-white p-8 text-center shadow-md">
                  <h3 className="mb-2 text-xl font-bold">
                    No Articles Found
                  </h3>
                  <p className="mb-4 text-gray-600">
                    {search
                      ? `We couldn't find any articles matching "${search}"`
                      : category
                      ? `No articles found in the ${category} category`
                      : tag
                      ? `No articles found with the tag "${tag}"`
                      : 'No articles have been published yet'}
                  </p>
                  <div className="flex justify-center">
                    <Link
                      href="/blog"
                      className="w-full rounded-md bg-gradient-to-r from-gray-600 to-gray-800 px-4 py-2 text-white transition-all hover:from-gray-700 hover:to-gray-90"
                    >
                      View All Articles
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {posts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <div className="flex space-x-2">
                      {getPaginationLinks()}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar currentCategory={category} currentTag={tag} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;