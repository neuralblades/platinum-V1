'use client';

import React, { useState } from 'react';
import { getProperties, PropertyFilter, Property } from '@/services/propertyService';
import PropertyMapView from '../../../components/maps/PropertyMapView';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useQuery } from '@tanstack/react-query';

export default function PropertiesMapPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isOffplan = searchParams.get('isOffplan') === 'true';

  const handleGoBack = () => {
    if (isOffplan) {
      router.push('/properties/offplan');
    } else {
      router.push('/properties');
    }
  };

  // Simple filters for API call
  const filters: PropertyFilter = {
    page: 1,
    limit: 50, // Show more properties on the map
    isOffplan: isOffplan
  };

  const { data = { success: false, properties: [] }, isLoading, isError } = useQuery({
    queryKey: ['properties', filters],
    queryFn: () => getProperties(filters),
  });

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Handle property selection from map
  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
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
            <LoadingSpinner />
          ) : isError ? (
            <div className="flex justify-center items-center h-full text-red-600">Failed to load properties</div>
          ) : data.properties.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-600">
              No properties found matching your criteria.
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
