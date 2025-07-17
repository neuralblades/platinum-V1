// components/PropertyDetails.tsx
'use client';

import Image from 'next/image';
import { getFullImageUrl } from '@/utils/imageUtils';
import { Property, Developer } from '../types/property.types';

interface Props {
  property: Property;
  developer: Developer | null;
}

export default function PropertyDetails({ property, developer }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
      <div className="p-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column - Project Description */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
              ABOUT THIS PROJECT
            </h2>
            <div className="w-20 h-1 bg-gray-700 mb-6"></div>

            {/* Project Introduction */}
            <div className="prose max-w-none text-gray-700 mb-8">
              <div className="text-lg">
                <p className="text-xl font-medium text-gray-800 mb-6">
                  Discover refined living at {property.title}, a sophisticated residential development located in {property.location}.
                </p>
                <p className="mb-6">
                  {developer && `Developed by ${developer.name}, this distinguished project offers a collection of meticulously crafted ${property.bedroom_range || property.bedrooms}-bedroom ${property.property_type}s.`}
                </p>

                {/* Property Description */}
                <div className="whitespace-pre-line">
                  {property.description && property.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Property Features */}
            {property.features && property.features.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.features.slice(0, 8).map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-gray-700">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Property Details */}
          <div className="lg:w-80 mt-8 lg:mt-0">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 sticky top-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">Project Details</h3>

              {/* Starting Price */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">STARTING PRICE</h4>
                <p className="text-3xl font-bold text-gray-800">
                  AED {property.price ? (typeof property.price === 'number' ? property.price.toLocaleString() : Number(property.price).toLocaleString()) : '0'}
                </p>
              </div>

              {/* Handover */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">HANDOVER</h4>
                <p className="text-2xl font-bold text-gray-800">{property.year_built || '2025'}</p>
              </div>

              {/* Payment Plan */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">PAYMENT PLAN</h4>
                <p className="text-2xl font-bold text-gray-800">{property.payment_plan || '60/40'}</p>
              </div>

              {/* Property Type */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">PROPERTY TYPE</h4>
                <p className="text-lg font-medium text-gray-800 capitalize">{property.property_type}</p>
              </div>

              {/* Bedrooms */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">BEDROOMS</h4>
                <p className="text-lg font-medium text-gray-800">{property.bedroom_range || property.bedrooms}</p>
              </div>

              {/* Bathrooms */}
              {property.bathrooms && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">BATHROOMS</h4>
                  <p className="text-lg font-medium text-gray-800">{property.bathrooms}</p>
                </div>
              )}

              {/* Developer */}
              {developer && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">DEVELOPER</h4>
                  <div className="flex items-center">
                    {developer.logo ? (
                      <div className="relative h-10 w-16 mr-3 bg-white p-1 rounded border border-gray-200">
                        <Image
                          src={getFullImageUrl(developer.logo)}
                          alt={developer.name}
                          fill
                          className="object-contain"
                          sizes="64px"
                        />
                      </div>
                    ) : null}
                    <p className="text-lg font-medium text-gray-800">{developer.name}</p>
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="space-y-3 mt-8">
                <button
                  onClick={() => {
                    const inquirySection = document.querySelector('[data-inquiry]');
                    if (inquirySection) {
                      inquirySection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full py-3 px-6 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white font-medium rounded-lg transition duration-300 flex items-center justify-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Request Information
                </button>

                <a
                  href={`https://wa.me/971585602665?text=I'm interested in ${property?.title || 'this offplan property'} (ID: ${property.id})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition duration-300 flex items-center justify-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp Inquiry
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}