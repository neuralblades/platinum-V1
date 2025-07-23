import { Suspense } from 'react';
import MapPageContent from './MapPageContent';

// Loading component for suspense fallback
function MapLoading() {
  return (
    <div className="w-full h-screen bg-gray-100">
      <div className="w-full h-full relative">
        {/* Loading Back button */}
        <div className="absolute top-4 left-4 z-10 w-12 h-12 bg-gray-200 animate-pulse rounded-full"></div>

        {/* Loading Map */}
        <div className="w-full h-full flex justify-center items-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component
export default function PropertiesMapPage() {
  return (
    <Suspense fallback={<MapLoading />}>
      <MapPageContent />
    </Suspense>
  );
}