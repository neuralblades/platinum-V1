// components/PropertyDetailClient.tsx
'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePropertyData } from '../hooks/usePropertyData';
import PropertyHero from './PropertyHero';
import PropertySkeleton from './PropertySkeleton';

// Lazy load heavy components - they'll only load when needed
const PropertyTabs = dynamic(() => import('./PropertyTabs'), {
  loading: () => (
    <div className="container mx-auto px-4 py-12">
      <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />
    </div>
  ),
  ssr: false // Don't render on server to improve initial load
});

const PropertyInquiry = dynamic(() => import('./PropertyInquiry'), {
  loading: () => (
    <div className="container mx-auto px-4">
      <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />
    </div>
  ),
  ssr: false
});

interface Props {
  propertyId: string;
}

export default function PropertyDetailClient({ propertyId }: Props) {
  const { property, developer, loading, error } = usePropertyData(propertyId);

  // Loading state
  if (loading) {
    return <PropertySkeleton />;
  }

  // Error state
  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-8">
            {error || 'The property you are looking for does not exist or has been removed.'}
          </p>
          <div className="inline-block transition-transform duration-200 hover:scale-105 active:scale-95">
            <Link 
              href="/properties/offplan" 
              className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-medium rounded-md hover:shadow-lg transition duration-300"
            >
              Browse All Offplan Properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Hero loads immediately - it's the most important */}
      <PropertyHero property={property} developer={developer} />
      
      {/* Key info cards */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="flex flex-col p-8 hover:bg-gray-50 transition-colors duration-300">
              <h3 className="text-sm uppercase text-gray-500 mb-2 tracking-wider font-medium">STARTING PRICE</h3>
              <p className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                AED {typeof property.price === 'number' ? property.price.toLocaleString() : Number(property.price).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col p-8 hover:bg-gray-50 transition-colors duration-300">
              <h3 className="text-sm uppercase text-gray-500 mb-2 tracking-wider font-medium">HANDOVER</h3>
              <p className="text-4xl font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                {property.year_built || '2025'}
              </p>
            </div>
            <div className="flex flex-col p-8 hover:bg-gray-50 transition-colors duration-300">
              <h3 className="text-sm uppercase text-gray-500 mb-2 tracking-wider font-medium">PAYMENT PLAN</h3>
              <p className="text-4xl font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                {property.payment_plan || '70/30'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* These load lazily when user scrolls down */}
      <PropertyTabs property={property} developer={developer} />
      <PropertyInquiry property={property} propertyId={propertyId} />
    </div>
  );
}