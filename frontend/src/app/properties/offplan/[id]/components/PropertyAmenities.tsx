'use client';

import { Property } from '../types/property.types';

interface Props {
  property: Property;
}

export default function PropertyAmenities({ property }: Props) {
  if (!property.features || property.features.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Amenities & Features</h2>
          <div className="bg-gray-100 rounded-xl p-8">
            <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <p className="text-gray-600">Amenities information will be available soon</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
      <div className="p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Amenities & Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {property.features.map((feature, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center">
                <div className="bg-gray-200 p-3 rounded-full mr-3">
                  <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-medium text-gray-800">{feature}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}