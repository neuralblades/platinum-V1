import { Suspense } from 'react';
import OffPlanPageContent from './OffPlanPageContent';

// Loading component for suspense fallback
function OffPlanLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Loading Breadcrumbs */}
      <div className="mb-6">
        <div className="h-4 bg-gray-200 animate-pulse rounded w-80"></div>
      </div>
      
      {/* Loading Title and Description */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 animate-pulse rounded w-96 mb-4"></div>
        <div className="h-5 bg-gray-200 animate-pulse rounded w-full max-w-3xl mb-4"></div>
        <div className="flex space-x-4">
          <div className="h-12 bg-gray-200 animate-pulse rounded w-40"></div>
          <div className="h-12 bg-gray-200 animate-pulse rounded w-40"></div>
          <div className="h-12 bg-gray-200 animate-pulse rounded w-32"></div>
        </div>
      </div>

      {/* Loading Search Filters */}
      <div className="mb-8">
        <div className="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>

      {/* Loading Property Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="h-96 rounded-xl bg-gray-200 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

// Main page component
export default function OffPlanPropertiesPage() {
  return (
    <Suspense fallback={<OffPlanLoading />}>
      <OffPlanPageContent />
    </Suspense>
  );
}