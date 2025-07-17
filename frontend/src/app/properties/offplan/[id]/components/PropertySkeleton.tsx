// components/PropertySkeleton.tsx
export default function PropertySkeleton() {
  return (
    <div className="bg-gray-50">
      {/* Hero Skeleton */}
      <div className="relative h-[90vh] w-full bg-gray-200 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-300/40 to-gray-400/80" />
        <div className="absolute bottom-24 left-0 right-0">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl">
              {/* Tags Skeleton */}
              <div className="flex gap-3 mb-6">
                <div className="h-8 w-20 bg-gray-400 rounded-full" />
                <div className="h-8 w-16 bg-gray-400 rounded-full" />
                <div className="h-8 w-24 bg-gray-400 rounded-full" />
              </div>
              
              {/* Title Skeleton */}
              <div className="mb-4">
                <div className="h-16 bg-gray-400 rounded-lg mb-3 w-3/4" />
                <div className="h-12 bg-gray-400 rounded-lg w-1/2" />
              </div>
              
              {/* Location Skeleton */}
              <div className="flex items-center mb-6">
                <div className="h-6 w-6 bg-gray-400 rounded mr-2" />
                <div className="h-6 bg-gray-400 rounded w-48" />
              </div>
              
              {/* Developer Skeleton */}
              <div className="mb-10 flex items-center">
                <div className="h-16 w-24 bg-gray-400 rounded-lg mr-4" />
                <div>
                  <div className="h-4 w-20 bg-gray-400 rounded mb-2" />
                  <div className="h-6 w-32 bg-gray-400 rounded" />
                </div>
              </div>
              
              {/* Buttons Skeleton */}
              <div className="flex flex-wrap gap-4">
                <div className="h-12 w-32 bg-gray-400 rounded-lg" />
                <div className="h-12 w-40 bg-gray-400 rounded-lg" />
                <div className="h-12 w-36 bg-gray-400 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Info Cards Skeleton */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-8">
                <div className="h-4 w-24 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="flex border-b">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="py-4 px-6">
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}