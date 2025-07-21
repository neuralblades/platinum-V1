'use client';

import React, { use } from 'react';
import BlogPostForm from '@/components/admin/BlogPostForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface EditBlogPostClientProps {
  postId: string;
}

const EditBlogPostClient: React.FC<EditBlogPostClientProps> = ({ postId }) => {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  // Redirect if not admin
  React.useEffect(() => {
    if (user && !isAdmin) {
      router.push('/');
    }
  }, [user, isAdmin, router]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Blog Post</h1>
      </div>
      
      <BlogPostForm postId={postId} />
    </div>
  );
};

// Server component that passes the ID to the client component
interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditBlogPostPage({ params }: PageProps) {
  // Properly unwrap params using React.use()
  const unwrappedParams = use(params);
  const postId = unwrappedParams.id;
  
  return <EditBlogPostClient postId={postId} />;
}