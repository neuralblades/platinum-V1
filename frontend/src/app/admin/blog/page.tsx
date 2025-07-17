'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getBlogPosts, deleteBlogPost, BlogPost, getBlogImageUrl } from '@/services/blogService';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';

const AdminBlogPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Redirect if not admin
    if (user && !isAdmin) {
      router.push('/');
      return;
    }

    const fetchPosts = async () => {
      try {
        setLoading(true);
        try {
          const response = await getBlogPosts({ limit: 100 });
          setPosts(response.posts || []);
          setError(null);
        } catch (err) {
          console.error('Error fetching blog posts:', err);
          setPosts([]);
          setError('Failed to load blog posts. The blog feature might not be fully set up yet.');
        }
      } catch (err) {
        console.error('Error in admin blog page component:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user, isAdmin, router]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle delete confirmation
  const confirmDelete = (id: string) => {
    setDeleteConfirmation(id);
  };

  // Handle delete cancellation
  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  // Handle delete post
  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      await deleteBlogPost(id);
      setPosts(posts.filter(post => post.id !== id));
      setDeleteConfirmation(null);
    } catch (err) {
      console.error(`Error deleting blog post with ID ${id}:`, err);
      setError('Failed to delete blog post');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="w-1 h-6 bg-gray-500 rounded-full mr-2"></span>
            Blog Posts
          </h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600 shadow-md"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="w-1 h-6 bg-gray-700 rounded-full mr-2"></span>
          Blog Posts
        </h1>
        <Button
          href="/admin/blog/add"
          variant="primary"
          gradient={true}
          className="flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Post
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start">
          <svg className="w-5 h-5 mr-2 mt-0.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Post
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Author
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Views
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No blog posts found
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          <Image
                            src={getBlogImageUrl(post.featuredImage)}
                            alt={post.title}
                            fill
                            className="object-cover rounded-md"
                            sizes="40px"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            <Link href={`/blog/${post.slug}`} target="_blank" className="hover:text-gray-600">
                              {post.title}
                            </Link>
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {post.excerpt.substring(0, 60)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {post.author ? `${post.author.firstName} ${post.author.lastName}` : 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 shadow-sm">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(post.publishedAt || post.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.viewCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {deleteConfirmation === post.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            onClick={() => handleDelete(post.id)}
                            variant="primary"
                            size="sm"
                            className="!py-1 !px-2"
                            isLoading={deleting}
                            disabled={deleting}
                          >
                            Confirm
                          </Button>
                          <Button
                            onClick={cancelDelete}
                            variant="outline"
                            size="sm"
                            className="!py-1 !px-2"
                            disabled={deleting}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            href={`/admin/blog/edit/${post.id}`}
                            variant="primary"
                            size="sm"
                            className="!py-1 !px-2 inline-flex items-center"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Button>
                          <Button
                            onClick={() => confirmDelete(post.id)}
                            variant="primary"
                            size="sm"
                            className="!py-1 !px-2 inline-flex items-center !bg-red-500 hover:!bg-red-600"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBlogPage;
