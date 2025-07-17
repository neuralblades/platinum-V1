'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost, getBlogImageUrl } from '@/services/blogService';
import { getResponsiveSizes } from '@/utils/imageOptimizationUtils';

interface BlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'featured' | 'compact';
}

const BlogCard: React.FC<BlogCardProps> = ({ post, variant = 'default' }) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Truncate excerpt for compact variant
  const truncateExcerpt = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (variant === 'featured') {
    return (
      <div className="group relative h-80 overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
        <div className="relative h-full w-full overflow-hidden">
          <Image
            src={getBlogImageUrl(post.featuredImage)}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={getResponsiveSizes('hero')}
            quality={85}
            priority
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAJJXF+wHAAAAABJRU5ErkJggg=="
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="mb-3 flex items-center space-x-2">
            <span className="rounded-full bg-gray-600 shadow-lg px-3 py-1 text-xs font-medium">{post.category}</span>
            <span className="text-sm opacity-80">{formatDate(post.publishedAt || post.createdAt)}</span>
          </div>

          <Link href={`/blog/${post.slug}`} className="group-hover:text-gray-300">
            <h3 className="mb-3 text-lg font-bold leading-tight transition-colors line-clamp-2">{post.title}</h3>
          </Link>

          <p className="text-sm opacity-90 line-clamp-2">{truncateExcerpt(post.excerpt, 80)}</p>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-start space-x-4">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
          <Image
            src={getBlogImageUrl(post.featuredImage)}
            alt={post.title}
            fill
            className="object-cover"
            sizes="64px"
            quality={80}
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAJJXF+wHAAAAABJRU5ErkJggg=="
          />
        </div>

        <div className="flex-grow">
          <Link href={`/blog/${post.slug}`} className="hover:text-gray-600">
            <h4 className="mb-1 font-medium leading-tight">{post.title}</h4>
          </Link>
          <p className="text-xs text-gray-500">{formatDate(post.publishedAt || post.createdAt)}</p>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="group h-full overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={getBlogImageUrl(post.featuredImage)}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes={getResponsiveSizes('card')}
          quality={80}
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAJJXF+wHAAAAABJRU5ErkJggg=="
        />
      </div>

      <div className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-800">{post.category}</span>
          <span className="text-xs text-gray-500">{formatDate(post.publishedAt || post.createdAt)}</span>
        </div>

        <Link href={`/blog/${post.slug}`} className="hover:text-gray-600">
          <h3 className="mb-2 text-xl font-bold leading-tight transition-colors">{post.title}</h3>
        </Link>

        <p className="mb-4 text-gray-600">{truncateExcerpt(post.excerpt, 150)}</p>
      </div>
    </div>
  );
};

export default BlogCard;