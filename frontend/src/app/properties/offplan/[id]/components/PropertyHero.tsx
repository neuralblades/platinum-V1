// components/PropertyHero.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { getFullImageUrl } from '@/utils/imageUtils';
import { Property, Developer } from '../types/property.types';

interface Props {
  property: Property;
  developer: Developer | null;
}

export default function PropertyHero({ property, developer }: Props) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleViewGallery = () => {
    // Scroll to gallery tab or open modal
    const tabsSection = document.querySelector('[data-tabs]');
    if (tabsSection) {
      tabsSection.scrollIntoView({ behavior: 'smooth' });
      // You can trigger gallery tab activation here
    }
  };

  const handleRegisterInterest = () => {
    // Scroll to inquiry form
    const inquirySection = document.querySelector('[data-inquiry]');
    if (inquirySection) {
      inquirySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative h-[90vh] w-full">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={
            property.header_image 
              ? getFullImageUrl(property.header_image)
              : property.images && property.images.length > 0 
                ? getFullImageUrl(property.images[0]) 
                : '/images/default-property.jpg'
          }
          alt={property.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
          onLoad={() => setImageLoaded(true)}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyDnyDzUlVPUNxFMnpUgWl/aQHs2OvG9zMY3XtRQDw5FEp2xFo2lqfSkYH"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black/90" />
      </div>

      {/* Breadcrumbs */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        <div className="container mx-auto">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Off Plan', href: '/properties/offplan' },
                { label: property.title }
              ]}
              darkMode={true}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end">
        <div className="container mx-auto px-4 pb-24 relative z-10 text-white">
          <div className="max-w-5xl">
            {/* Property Tags */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="px-4 py-1.5 bg-gradient-to-r from-gray-700 to-gray-800 text-white text-sm font-medium rounded-full uppercase tracking-wider shadow-lg hover:scale-105 hover:-translate-y-0.5 transition-transform">
                {property.status === 'for-sale' ? 'For Sale' : 'For Rent'}
              </span>
              <span className="px-4 py-1.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm font-medium rounded-full uppercase tracking-wider shadow-lg hover:scale-105 hover:-translate-y-0.5 transition-transform">
                Offplan
              </span>
              <span className="px-4 py-1.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm font-medium rounded-full uppercase tracking-wider shadow-lg hover:scale-105 hover:-translate-y-0.5 transition-transform">
                {property.property_type}
              </span>
            </div>

            {/* Property Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {property.title}
            </h1>

            {/* Location */}
            <div className="flex items-center text-white/90 mb-6">
              <svg className="h-6 w-6 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-xl">{property.location}</p>
            </div>

            {/* Developer Info */}
            {developer && (
              <div className="mb-10 flex items-center">
                {developer.logo ? (
                  <div className="relative h-16 w-24 mr-4 overflow-hidden bg-white p-2 rounded-lg border border-gray-400 shadow-lg hover:scale-105 hover:shadow-xl transition-transform">
                    <Image
                      src={getFullImageUrl(developer.logo)}
                      alt={developer.name}
                      fill
                      className="object-contain bg-white"
                      sizes="96px"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-24 mr-4 rounded-lg bg-gray-700 flex items-center justify-center text-white font-bold text-xl shadow-lg hover:scale-105 hover:shadow-xl transition-transform">
                    {developer.name.charAt(0)}
                  </div>
                )}
                <div>
                  <span className="text-gray-300 text-sm">Developed by</span>
                  <h3 className="text-2xl font-semibold">{developer.name}</h3>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleViewGallery}
                className="px-8 py-4 bg-white text-gray-800 font-medium rounded-lg shadow-lg flex items-center hover:scale-105 hover:shadow-xl active:scale-95 transition-transform"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                View Gallery
              </button>
              
              <button
                onClick={handleRegisterInterest}
                className="px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-medium rounded-lg shadow-lg flex items-center hover:scale-105 hover:shadow-xl active:scale-95 transition-transform"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Register Interest
              </button>
              
              <a
                href={`https://wa.me/971585602665?text=I'm interested in ${property.title} (ID: ${property.id})`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 border border-white/50 bg-white/10 backdrop-blur-sm text-white font-medium rounded-lg shadow-lg flex items-center hover:scale-105 hover:shadow-xl active:scale-95 transition-transform"
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
  );
}