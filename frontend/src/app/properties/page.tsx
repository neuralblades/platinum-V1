"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
  
  // State for property data
  const [propertyData, setPropertyData] = useState<PropertyQueryResponse>({
    success: false,
    properties: [],
    page: 1,
    pages: 1,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Fetch properties function
  const fetchProperties = async (filters: PropertyFilter) => {
    try {
      setIsLoading(true);
      setIsError(false);
      
      const data = await getProperties(filters);
      setPropertyData(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setIsError(true);
      setPropertyData({
        success: false,
        properties: [],
        page: 1,
        pages: 1,
        total: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and when filters change via URL
  useEffect(() => {
    setCurrentFilters(initialFilters);
    fetchProperties(initialFilters);
  }, [initialFilters]);

  const handleFilterChange = (newFilters: PropertyFilter) => {
    setCurrentFilters(newFilters);
  };

  const handleApplyFilters = () => {
    fetchProperties(currentFilters);
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
          results={propertyData.properties}
        />
      </div>

      {/* Property Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-96 rounded-xl bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg inline-block">
            <p>Error loading properties. Please try again.</p>
            <button
              onClick={() => fetchProperties(currentFilters)}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      ) : propertyData.properties.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 border border-gray-200 text-gray-700 px-6 py-8 rounded-lg inline-block">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium mb-2">No Properties Found</h3>
            <p className="text-gray-600">No properties found matching your criteria. Try adjusting your filters.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {propertyData.properties.length} of {propertyData.total} properties
            </p>
          </div>
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
        </>
      )}

      {/* Pagination */}
      {propertyData.pages > 1 && (
        <div className="mt-12 flex justify-center">
          <nav className="flex items-center space-x-2">
            {/* Previous button */}
            {propertyData.page > 1 && (
              <button
                onClick={() => {
                  const newFilters = { ...currentFilters, page: propertyData.page - 1 };
                  setCurrentFilters(newFilters);
                  fetchProperties(newFilters);
                }}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Previous
              </button>
            )}
            
            {/* Page numbers */}
            {Array.from({ length: propertyData.pages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => {
                  const newFilters = { ...currentFilters, page: pageNum };
                  setCurrentFilters(newFilters);
                  fetchProperties(newFilters);
                }}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  pageNum === propertyData.page
                    ? 'bg-gray-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
            
            {/* Next button */}
            {propertyData.page < propertyData.pages && (
              <button
                onClick={() => {
                  const newFilters = { ...currentFilters, page: propertyData.page + 1 };
                  setCurrentFilters(newFilters);
                  fetchProperties(newFilters);
                }}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Next
              </button>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}