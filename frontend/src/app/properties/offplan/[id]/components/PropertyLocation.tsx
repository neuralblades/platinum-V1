'use client';

import dynamic from 'next/dynamic';
import { Property } from '../types/property.types';

// Lazy load the map component since it's heavy
const MapComponent = dynamic(() => import('@/components/maps/MapComponent'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />,
  ssr: false
});

interface Props {
  property: Property;
}

export default function PropertyLocation({ property }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
      <div className="p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Location</h2>
        
        <div className="rounded-xl overflow-hidden mb-6">
          <MapComponent
            address={property.address || ''}
            location={property.location || ''}
            height="400px"
            zoom={14}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Property Address</h3>
            <div className="flex items-start">
              <div className="bg-gray-200 p-2 rounded-full mr-3 mt-1">
                <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-700">{property.address}</p>
                <p className="text-gray-700">{property.city}, {property.state} {property.zip_code}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Neighborhood</h3>
            <div className="flex items-start">
              <div className="bg-gray-200 p-2 rounded-full mr-3 mt-1">
                <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <p className="text-gray-700">{property.location}</p>
                <p className="text-sm text-gray-500 mt-1">A prime location with excellent connectivity and amenities.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}