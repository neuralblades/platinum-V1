'use client';

import React from 'react';
import TestimonialForm from '@/components/admin/TestimonialForm';

interface PageParams {
  id: string;
}

export default function EditTestimonialPage({ params }: { params: PageParams }) {
  // Unwrap params using React.use() as recommended by Next.js
  const unwrappedParams = React.use(params as any) as PageParams;

  return <TestimonialForm testimonialId={unwrappedParams.id} isEdit={true} />;
}
