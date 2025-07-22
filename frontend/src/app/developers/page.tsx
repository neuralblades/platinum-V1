'use client';

import { useState, useEffect } from 'react';
import { getDevelopers, Developer } from '@/services/developerService';
import DeveloperCard from '@/components/developers/DeveloperCard';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import Breadcrumb from '@/components/ui/Breadcrumb';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface DevelopersResponse {
  developers: Developer[];
}

export default function DevelopersPage() {
  const [data, setData] = useState<DevelopersResponse>({ developers: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        
        const response = await getDevelopers();
        setData(response);
      } catch (error) {
        console.error('Error fetching developers:', error);
        setIsError(true);
        setData({ developers: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDevelopers();
  }, []);

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Developers' }
            ]}
          />
        </div>
        <div className="animate-fade-in-up mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Real Estate Developers
          </h1>
          <p className="text-gray-600 mb-4">
            Explore top real estate developers in Dubai & UAE
          </p>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : isError ? (
          <div className="animate-fade-in-up">
            <ErrorDisplay 
              message="Failed to load developers. Please try again later." 
            />
          </div>
        ) : data.developers.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 border border-gray-200 text-gray-700 px-6 py-8 rounded-lg inline-block">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-medium mb-2">No Developers Found</h3>
              <p className="text-gray-600">No developers are currently available.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {data.developers.length} developer{data.developers.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {data.developers.map((developer: Developer) => (
                <div key={developer.id} className="transition-transform duration-200 hover:-translate-y-2">
                  <DeveloperCard
                    id={developer.id}
                    name={developer.name}
                    logo={developer.logo}
                    backgroundImage={developer.backgroundImage}
                    slug={developer.slug}
                    featured={developer.featured}
                    description={developer.description}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}