import { Suspense } from 'react';
import BlogPageContent from './BlogPageContent';

// Loading component for suspense fallback
function BlogLoading() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Loading Breadcrumbs */}
        <div className="mb-6">
          <div className="h-4 bg-gray-200 animate-pulse rounded w-64"></div>
        </div>
        
        {/* Loading Title */}
        <div className="mb-10">
          <div className="h-8 bg-gray-200 animate-pulse rounded w-80 mb-2"></div>
          <div className="h-5 bg-gray-200 animate-pulse rounded w-96"></div>
        </div>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Loading Main Content */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="h-80 rounded-xl bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          </div>
          
          {/* Loading Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
              <div className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component
export default function BlogPage() {
  return (
    <Suspense fallback={<BlogLoading />}>
      <BlogPageContent />
    </Suspense>
  );
}