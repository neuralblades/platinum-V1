import React from 'react';
import BlogPostDetailClient from './BlogPostDetailClient';

// Server component that passes the slug to the client component
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostDetailPage({ params }: PageProps) {
  // Properly unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const slug = unwrappedParams.slug;
  return <BlogPostDetailClient slug={slug} />;
}