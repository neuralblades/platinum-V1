'use client';

import React, { useState, useEffect, Usable } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { getBlogPostBySlug, getBlogImageUrl, addBlogComment, BlogPost } from '@/services/blogService';
import Breadcrumb from '@/components/ui/Breadcrumb';

interface BlogPostDetailClientProps {
  slug: string;
}

const BlogPostDetailClient: React.FC<BlogPostDetailClientProps> = ({ slug }) => {
  const { isAuthenticated } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentSuccess, setCommentSuccess] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        try {
          const response = await getBlogPostBySlug(slug);
          if (response && response.post) {
            setPost(response.post);
            setError(null);
          } else {
            setPost(null);
            setError('Blog post not found');
          }
        } catch (err) {
          console.error(`Error fetching blog post with slug ${slug}:`, err);
          setPost(null);
          setError('Failed to load blog post. The blog feature might not be fully set up yet.');
        }
      } catch (err) {
        console.error('Error in blog post detail component:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setCommentError('You must be logged in to comment');
      return;
    }

    if (!commentContent.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }

    try {
      setCommentSubmitting(true);
      setCommentError(null);

      await addBlogComment(post!.id, commentContent);

      setCommentContent('');
      setCommentSuccess(true);

      // Reset success message after 5 seconds
      setTimeout(() => {
        setCommentSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Error submitting comment:', err);
      setCommentError('Failed to submit comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          <div className="h-8 w-3/4 rounded bg-gray-200" />
          <div className="h-64 rounded-lg bg-gray-200" />
          <div className="space-y-4">
            <div className="h-4 rounded bg-gray-200" />
            <div className="h-4 rounded bg-gray-200" />
            <div className="h-4 w-5/6 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-fade-in-up">
          <div className="rounded-lg bg-gray-100 p-6 text-center text-gray-800">
            <h2 className="mb-2 text-xl font-bold">
              Article Not Found
            </h2>
            <p>
              The blog post you&apos;re looking for is not available.
            </p>
            <div className="mt-4 inline-block rounded-md bg-gradient-to-r from-gray-600 to-gray-800 px-4 py-2 text-white transition-all hover:from-gray-700 hover:to-gray-900">
              <Link
                href="/blog"
              >
                Back to Blog
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Blog', href: '/blog' },
              { label: post.category, href: `/blog?category=${encodeURIComponent(post.category)}` },
              { label: post.title }
            ]}
          />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-xl bg-white shadow-md">
              {/* Featured Image */}
              <div className="relative h-96 w-full">
                <Image
                  src={getBlogImageUrl(post.featuredImage)}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
                />
              </div>

              {/* Article Content */}
              <div className="p-8">
                {/* Category and Date */}
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <Link
                      href={`/blog?category=${encodeURIComponent(post.category)}`}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 hover:bg-gray-200"
                    >
                      {post.category}
                    </Link>
                  </div>
                  <time className="text-sm text-gray-500">
                    {formatDate(post.publishedAt || post.createdAt)}
                  </time>
                </div>

                {/* Title */}
                <h1 className="mb-6 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
                  {post.title}
                </h1>

                {/* Content */}
                <div
                  className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap"
                  style={{
                    display: 'block',
                    lineHeight: '1.8',
                  }}
                >
                  {post.content}
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-8 border-t border-gray-100 pt-6">
                    <h3 className="mb-3 text-lg font-bold">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <div key={tag}>
                          <Link
                            href={`/blog?tag=${encodeURIComponent(tag)}`}
                            className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
                          >
                            {tag}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Share Button */}
                <div className="mt-8 border-t border-gray-100 pt-6">
                  <h3 className="mb-3 text-lg font-bold">
                    Share This Article
                  </h3>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: post.title,
                          url: window.location.href,
                        }).catch(err => console.error('Error sharing:', err));
                      } else {
                        // Fallback for browsers that don't support navigator.share
                        const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`;
                        window.open(shareUrl, '_blank');
                      }
                    }}
                    className="flex items-center rounded-md bg-gradient-to-r from-gray-600 to-gray-800 px-4 py-2 text-white transition-all hover:from-gray-700 hover:to-gray-900"
                  >
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                    </svg>
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-8 rounded-xl bg-white p-8 shadow-md">
              <h2 className="mb-6 text-2xl font-bold">
                Comments
              </h2>

              {/* Comment Form */}
              {isAuthenticated ? (
                <form
                  onSubmit={handleCommentSubmit}
                  className="mb-8"
                >
                  <div className="mb-4">
                    <label
                      htmlFor="comment"
                      className="mb-2 block font-medium text-gray-700"
                    >
                      Leave a Comment
                    </label>
                    <textarea
                      id="comment"
                      rows={4}
                      className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      placeholder="Share your thoughts..."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  {commentError && (
                    <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
                      {commentError}
                    </div>
                  )}

                  {commentSuccess && (
                    <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
                      Your comment has been submitted and is pending approval.
                    </div>
                  )}

                  <button
                    type="submit"
                    className="rounded-md bg-gradient-to-r from-gray-600 to-gray-800 px-4 py-2 text-white transition-all hover:from-gray-700 hover:to-gray-900 disabled:opacity-70"
                    disabled={commentSubmitting}
                  >
                    {commentSubmitting ? 'Submitting...' : 'Submit Comment'}
                  </button>
                </form>
              ) : (
                <div className="mb-8 rounded-md bg-gray-50 p-4 text-gray-800">
                  <p>
                    Please{' '}
                    <span className="font-medium text-gray-600 underline">
                      <Link href="/login">
                        log in
                      </Link>
                    </span>{' '}
                    to leave a comment.
                  </p>
                </div>
              )}

              {/* Comments List */}
              {post.comments && post.comments.length > 0 ? (
                <div className="space-y-6">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="rounded-lg bg-gray-50 p-4">
                      <div className="mb-2 flex items-center">
                        <div className="relative mr-3 h-8 w-8 overflow-hidden rounded-full">
                          <Image
                            src={comment.user?.avatar || '/images/default-avatar.png'}
                            alt={comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Unknown User'}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(comment.createdAt)}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

// Server component that passes the slug to the client component
export default function BlogPostDetailPage({ params }: { params: Usable<{ slug: string }> }) {
  // Properly unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const slug = unwrappedParams.slug;
  return <BlogPostDetailClient slug={slug} />;
}
