'use client';

import React from 'react';
import TestimonialForm from '@/components/admin/TestimonialForm';

interface PageParams {
  id: string;
}

interface EditTestimonialPageProps {
  params: Promise<PageParams>;
}

export default function EditTestimonialPage({ params }: EditTestimonialPageProps) {
  // Unwrap params using React.use() as recommended by Next.js 15
  const unwrappedParams = React.use(params);

  return <TestimonialForm testimonialId={unwrappedParams.id} isEdit={true} />;
}