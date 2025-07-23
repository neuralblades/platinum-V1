'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getProperties, PropertyFilter, Property } from '@/services/propertyService';
import PropertyMapView from '../../../components/maps/PropertyMapView';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface PropertyResponse {
  success: boolean;
  properties: Property[];
}

export default function MapPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isOffplan = searchParams.get('isOffplan') === 'true';

  // State management
  const [data, setData] = useState<PropertyResponse>({ success: false, properties: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const handleGoBack = () => {
    if (isOffplan) {
      router.push('/properties/offplan');
    } else {
      router.push('/properties');
    }
  };

  // Define filters at component level with useMemo
  const filters: PropertyFilter = useMemo(() => ({
    page: 1,
    limit: 50, // Show more properties on the map
    isOffplan: isOffplan
  }), [isOffplan]);

  // Fetch properties function with useCallback
  const fetchProperties = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      
      const response = await getProperties(filters);
      setData(response);
    } catch (error) {
      console.error('Error fetching properties for map:', error);
      setIsError(true);
      setData({ success: false, properties: [] });
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Fetch properties when component mounts or when fetchProperties changes
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Handle property selection from map
  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
  };

  // Retry function for error state
  const handleRetry = () => {
    fetchProperties();
  };

  return (
    <div className="w-full h-screen bg-gray-100">
      <div className="w-full h-full relative">
        {/* Back button */}
        <Button
          onClick={handleGoBack}
          className="absolute top-4 left-4 z-10 !p-3 !rounded-full"
          variant="wht"
          size="sm"
          aria-label="Go back"
        >
          <FaArrowLeft className="text-gray-700" />
        </Button>

        {/* Full-width map view */}
        <div className="w-full h-full">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner />
            </div>
          ) : isError ? (
            <div className="flex flex-col justify-center items-center h-full text-red-600 space-y-4">
              <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg">Failed to load properties</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : data.properties.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-gray-600 space-y-4">
              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-lg">No properties found</p>
              <p className="text-sm text-gray-500">
                No {isOffplan ? 'off-plan' : 'ready'} properties found matching your criteria.
              </p>
            </div>
          ) : (
            <PropertyMapView
              properties={data.properties}
              onPropertySelect={handlePropertySelect}
              selectedProperty={selectedProperty}
            />
          )}
        </div>
      </div>
    </div>
  );
}