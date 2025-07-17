'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getFullImageUrl } from '@/utils/imageUtils';

interface DeveloperCardProps {
  id?: string; // Made optional since we're not using it
  name: string;
  logo?: string;
  backgroundImage?: string;
  slug: string;
  featured?: boolean;
  description?: string; // Added description property
}

const DeveloperCard = ({
  // id is not used but kept in props for consistency
  name,
  logo,
  backgroundImage,
  slug,
  featured = false,
  description,
}: DeveloperCardProps) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden border border-gray-100`}
    >
      <Link href={`/developers/${slug}`} className="block h-full">
        <div className="relative h-52 w-full bg-gray-50">
          {/* Background Image */}
          {backgroundImage && (
            <Image
              src={getFullImageUrl(backgroundImage)}
              alt={`${name} background`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={featured}
            />
          )}

          {/* Logo on top */}
          {logo ? (
            <div className="relative z-10 h-full w-full flex items-center justify-center">
              <div
                className="bg-white/80 p-4 rounded-lg shadow-sm"
              >
                <div style={{ width: '150px', height: '80px', position: 'relative' }}>
                  <Image
                    src={getFullImageUrl(logo)}
                    alt={name}
                    fill
                    className="object-contain"
                    sizes="150px"
                    priority={featured}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <span
                className="text-3xl font-bold text-gray-400"
              >
                {name.charAt(0)}
              </span>
            </div>
          )}

          {featured && (
            <div
              className="absolute top-4 left-4 z-20 bg-gradient-to-r from-gray-700 to-gray-900 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md"
            >
              Featured
            </div>
          )}
        </div>
        <div className="p-6">
          <h3
            className="text-xl font-semibold text-gray-800 mb-2"
          >
            {name}
          </h3>
          {description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>
          )}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <span className="text-gray-700 font-medium">View Projects</span>
            <div
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default DeveloperCard;
