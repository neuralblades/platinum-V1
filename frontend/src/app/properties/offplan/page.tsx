"use client";

import Button from '@/components/ui/Button';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PropertyCard from '@/components/properties/PropertyCard';
import { Property, PropertyFilter, getProperties } from '@/services/propertyService';
import Breadcrumb from '@/components/ui/Breadcrumb';
import IntegratedSearchFilters from '@/components/search/IntegratedSearchFilters';

interface PropertyQueryResponse {
  success: boolean;
  properties: Property[];
  page: number;
  pages: number;
  total: number;
}

export default function OffPlanPropertiesPage() {
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const type = searchParams.get('type') || '';
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const bedrooms = searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined;
  const location = searchParams.get('location') || '';
  const keyword = searchParams.get('keyword') || '';
  const isOffplan = true;

  const initialFilters = useMemo(() => ({
    isOffplan,
    page,
    type,
    minPrice,
    maxPrice,
    bedrooms,
    location,
    keyword,
  }), [isOffplan, page, type, minPrice, maxPrice, bedrooms, location, keyword]);

  // Local state for current filters
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
      console.error('Error fetching off-plan properties:', error);
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

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const updatedFilters = { ...currentFilters, page: newPage };
    setCurrentFilters(updatedFilters);
    fetchProperties(updatedFilters);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Properties', href: '/properties' },
            { label: 'Off Plan' }
          ]}
        />
      </div>
      
      <div className="animate-fade-in-up mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 opacity-100 translate-y-0 transition-all duration-500">
          Off Plan Properties
        </h1>
        <p className="text-gray-600 mb-4 opacity-100 translate-y-0 transition-all duration-500">
          Discover our exclusive collection of off-plan properties in Dubai. Invest in the future with these upcoming developments offering modern designs and premium amenities.
        </p>
        <div className="flex space-x-4 opacity-100 translate-y-0 transition-all duration-500">
          <div className="inline-block transition-transform duration-200 hover:scale-105 active:scale-95">
            <Button
              href="/properties"
              variant="outline"
              size="lg"
            >
              Ready Properties
            </Button>
          </div>
          <div className="inline-block transition-transform duration-200 hover:scale-105 active:scale-95">
            <Button
              href="/properties/offplan"
              variant="accent"
              size="lg"
            >
              Off Plan Properties
            </Button>
          </div>
          <div className="inline-block transition-transform duration-200 hover:scale-105 active:scale-95">
            <Button
              href="/properties/map?isOffplan=true"
              variant="outline"
              size="lg"
            >
              Map View
            </Button>
          </div>
        </div>
      </div>

      {/* Integrated Search and Filters */}
      <div className="animate-fade-in-up mb-8">
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
            <p>Error loading off-plan properties. Please try again.</p>
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
          <div className="bg-gray-50 border border-gray-200 text-gray-700 px-6 py-8 rounded-lg inline-block opacity-100 translate-y-0 transition-all duration-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium mb-2">No Off-Plan Properties Found</h3>
            <p className="text-gray-600">No off-plan properties found matching your criteria. Try adjusting your filters.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {propertyData.properties.length} of {propertyData.total} off-plan properties
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {propertyData.properties.map((property) => (
              <div key={property.id} className="transition-transform duration-200 hover:-translate-y-1">
                <PropertyCard
                  id={property.id}
                  title={property.title}
                  price={property.price}
                  location={property.location}
                  bedrooms={property.bedrooms}
                  bedroomRange={property.bedroom_range}
                  bathrooms={property.bathrooms}
                  area={property.area}
                  imageUrl={property.main_image}
                  featured={property.featured}
                  isOffplan={true}
                  yearBuilt={property.year_built}
                  paymentPlan={property.payment_plan}
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
          <nav className="flex items-center">
            <div className="inline-block transition-transform duration-200 hover:scale-105 active:scale-95">
              <Button
                onClick={() => handlePageChange(propertyData.page - 1)}
                disabled={propertyData.page === 1}
                variant="outline"
                size="sm"
                className="mr-2"
              >
                Previous
              </Button>
            </div>
            {Array.from({ length: propertyData.pages }, (_, i) => i + 1).map((page) => (
              <div
                key={page}
                className="inline-block transition-transform duration-200 hover:scale-110 active:scale-95 mx-1"
              >
                <Button
                  onClick={() => handlePageChange(page)}
                  variant={propertyData.page === page ? "primary" : "outline"}
                  size="sm"
                >
                  {page}
                </Button>
              </div>
            ))}
            <div className="inline-block transition-transform duration-200 hover:scale-105 active:scale-95">
              <Button
                onClick={() => handlePageChange(propertyData.page + 1)}
                disabled={propertyData.page === propertyData.pages}
                variant="outline"
                size="sm"
                className="ml-2"
              >
                Next
              </Button>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}