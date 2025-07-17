"use client";

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Property, PropertyFilter, getProperties } from '@/services/propertyService';
import PropertyCard from '@/components/properties/PropertyCard';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Button from '@/components/ui/Button';
import IntegratedSearchFilters from '@/components/search/IntegratedSearchFilters';

interface PropertyQueryResponse {
  success: boolean;
  properties: Property[];
  page: number;
  pages: number;
  total: number;
}

export default function PropertiesPage() {
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const type = searchParams.get('type') || '';
  const status = searchParams.get('status') || '';
  const location = searchParams.get('location') || '';
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const minArea = searchParams.get('minArea') ? Number(searchParams.get('minArea')) : undefined;
  const maxArea = searchParams.get('maxArea') ? Number(searchParams.get('maxArea')) : undefined;
  const bedrooms = searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined;
  const bathrooms = searchParams.get('bathrooms') ? Number(searchParams.get('bathrooms')) : undefined;
  const yearBuilt = searchParams.get('yearBuilt') ? Number(searchParams.get('yearBuilt')) : undefined;
  const keyword = searchParams.get('keyword') || '';
  const isOffplan = false;

  const initialFilters = useMemo(() => ({
    page,
    type,
    status,
    location,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    bedrooms,
    bathrooms,
    yearBuilt,
    keyword,
    isOffplan,
  }), [page, type, status, location, minPrice, maxPrice, minArea, maxArea, bedrooms, bathrooms, yearBuilt, keyword, isOffplan]);

  // Local state for current filters (allows user to change filters without immediate API call)
  const [currentFilters, setCurrentFilters] = useState<PropertyFilter>(initialFilters);

  // Single TanStack Query for property data
  const { 
    data: propertyData = { success: false, properties: [], page: 1, pages: 1, total: 0 }, 
    isLoading, 
    isError,
    refetch 
  } = useQuery<PropertyQueryResponse>({
    queryKey: ['properties', JSON.stringify(currentFilters)],
    queryFn: () => getProperties(currentFilters),
  });

  const handleFilterChange = (newFilters: PropertyFilter) => {
    setCurrentFilters(newFilters);
  };

  const handleApplyFilters = () => {
    // TanStack Query will automatically refetch when currentFilters changes
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Properties' }
          ]}
        />
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Browse Properties</h1>
        <p className="text-gray-600 mb-4">
          Explore our collection of premium properties in the most desirable locations.
        </p>
        <div className="flex space-x-4">
          <div>
            <Button
              href="/properties"
              variant="accent"
              size="lg"
            >
              Ready Properties
            </Button>
          </div>
          <div>
            <Button
              href="/properties/offplan"
              variant="outline"
              size="lg"
            >
              Off Plan Properties
            </Button>
          </div>
          <div>
            <Button
              href="/properties/map"
              variant="outline"
              size="lg"
            >
              Map View
            </Button>
          </div>
        </div>
      </div>

      {/* Integrated Search and Filters */}
      <div className="mb-8">
        <IntegratedSearchFilters
          filters={currentFilters}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          className="w-full"
          isLoading={isLoading}
          isError={isError}
          results={propertyData}
        />
      </div>

      {/* Property Grid */}
      {isLoading ? (
        <div className="text-center text-gray-600 mb-8">Loading properties...</div>
      ) : isError ? (
        <div className="text-center text-red-600 mb-8">Error loading properties. Please try again.</div>
      ) : propertyData.properties.length === 0 ? (
        <div className="text-center text-gray-600 mb-8">No properties found matching your criteria.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {propertyData.properties.map((property) => (
            <div key={property.id}>
              <PropertyCard
                id={property.id}
                title={property.title}
                price={property.price}
                location={property.location}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                area={property.area}
                imageUrl={property.main_image}
                featured={property.featured}
                agent={property.agent}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {propertyData.pages > 1 && (
        <div className="mt-12 flex justify-center">
          <nav className="flex items-center space-x-2">
            {/* Implement pagination controls as needed */}
          </nav>
        </div>
      )}
    </div>
  );
}