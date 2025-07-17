'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Image from 'next/image';
import { getDeveloperPropertiesBySlug } from '@/services/developerService';
import PropertyCard from '@/components/properties/PropertyCard';
import Pagination from '@/components/ui/Pagination';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { getFullImageUrl } from '@/utils/imageUtils';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function DeveloperDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [developer, setDeveloper] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchDeveloperData = async () => {
      try {
        setLoading(true);
        const response = await getDeveloperPropertiesBySlug(resolvedParams.slug, currentPage);
        setDeveloper(response.developer);
        setProperties(response.properties);
        setTotalPages(response.pages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching developer data:', err);
        setError('Failed to load developer information. Please try again later.');
        setLoading(false);
      }
    };

    fetchDeveloperData();
  }, [resolvedParams.slug, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (loading) return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div
            className="rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700"
          />
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <ErrorDisplay message={error} />
      </div>
    </div>
  );

  if (!developer) return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <ErrorDisplay message="Developer not found" />
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Developers', href: '/developers' },
              { label: developer.name }
            ]}
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-10 border border-gray-100">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {developer.logo && (
              <div
                className="relative w-56 h-56 flex-shrink-0 bg-gray-50 p-4 rounded-lg border border-gray-100"
              >
                <Image
                  src={getFullImageUrl(developer.logo)}
                  alt={developer.name}
                  fill
                  className="object-contain p-2"
                  sizes="224px"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {developer.name}
              </h1>
              {developer.description && (
                <p className="text-gray-600 mb-6 text-lg">
                  {developer.description}
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100">
                {developer.established && (
                  <div className="flex items-center">
                    <div
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3"
                    >
                      <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-sm text-gray-500">Established</span>
                      <span className="font-medium text-gray-800">{developer.established}</span>
                    </div>
                  </div>
                )}
                {developer.headquarters && (
                  <div className="flex items-center">
                    <div
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3"
                    >
                      <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-sm text-gray-500">Headquarters</span>
                      <span className="font-medium text-gray-800">{developer.headquarters}</span>
                    </div>
                  </div>
                )}
                {developer.website && (
                  <div className="flex items-center">
                    <div
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3"
                    >
                      <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-sm text-gray-500">Website</span>
                      <a
                        href={developer.website.startsWith('http') ? developer.website : `https://${developer.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-gray-800 hover:text-gray-600"
                      >
                        {developer.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Properties by {developer.name}
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-gray-700 to-gray-900 mb-6" />

        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-100">
            <div className="py-8">
              <svg
                className="h-16 w-16 text-gray-400 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-gray-600 text-lg">
                No properties found for this developer.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property: any) => (
                <div key={property.id}>
                  <PropertyCard
                    id={property.id}
                    title={property.title}
                    price={property.price}
                    location={property.location}
                    bedrooms={property.bedrooms}
                    bathrooms={property.bathrooms}
                    area={property.area}
                    imageUrl={property.mainImage}
                    featured={property.featured}
                    isOffplan={property.isOffplan}
                    agent={property.agent}
                  />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
