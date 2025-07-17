import { Suspense } from 'react';
import PropertyDetailClient from './components/PropertyDetailClient';
import PropertySkeleton from './components/PropertySkeleton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OffplanPropertyPage({ params }: PageProps) {
  const { id } = await params;
  
  return (
    <Suspense fallback={<PropertySkeleton />}>
      <PropertyDetailClient propertyId={id} />
    </Suspense>
  );
}