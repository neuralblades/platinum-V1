'use client';

import { useQuery } from '@tanstack/react-query';
import { getDevelopers, Developer } from '@/services/developerService';
import DeveloperCard from '@/components/developers/DeveloperCard';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import Breadcrumb from '@/components/ui/Breadcrumb';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DevelopersPage() {
  const { data = { developers: [] }, isLoading, isError } = useQuery({
    queryKey: ['developers'],
    queryFn: getDevelopers,
  });

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
            <ErrorDisplay message="Failed to load developers. Please try again later." />
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
