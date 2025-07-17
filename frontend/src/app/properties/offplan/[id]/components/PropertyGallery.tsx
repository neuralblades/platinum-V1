// components/PropertyGallery.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { getFullImageUrl } from '@/utils/imageUtils';
import { Property } from '../types/property.types';

interface Props {
  property: Property;
}

export default function PropertyGallery({ property }: Props) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const openGallery = (index: number) => {
    setCurrentPhotoIndex(index);
    setIsGalleryOpen(true);
  };

  const nextImage = () => {
    setCurrentPhotoIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentPhotoIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  if (!property.images || property.images.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Property Gallery</h2>
          <div className="bg-gray-100 rounded-xl p-8">
            <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600">No images available for this property</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Property Gallery</h2>
          
          {/* Image Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {property.images.map((image, index) => (
              <div
                key={index}
                className="group relative h-64 cursor-pointer rounded-xl overflow-hidden shadow-md transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                onClick={() => openGallery(index)}
              >
                <Image
                  src={getFullImageUrl(image)}
                  alt={`${property.title} - Image ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  loading={index < 6 ? "eager" : "lazy"} // Load first 6 images immediately
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 w-full">
                    <span className="text-white font-medium flex items-center">
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Image {index + 1}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* View All Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => openGallery(0)}
              className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg hover:shadow-lg transition-all duration-300 inline-flex items-center"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              View Full Gallery ({property.images.length} images)
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      <Transition show={isGalleryOpen}>
        <Dialog
          open={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          className="relative z-50"
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/90" aria-hidden="true" />

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center">
              <div className="w-full max-w-6xl transform overflow-hidden transition-all">
                
                {/* Close button */}
                <button
                  onClick={() => setIsGalleryOpen(false)}
                  className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors duration-300"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Main Image */}
                <div className="relative h-[80vh] w-full">
                  <Image
                    src={getFullImageUrl(property.images[currentPhotoIndex])}
                    alt={`${property.title} - Image ${currentPhotoIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                  />

                  {/* Navigation Buttons */}
                  {property.images.length > 1 && (
                    <>
                      <button
                        onClick={previousImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors duration-300"
                      >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors duration-300"
                      >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>

                {/* Image Counter and Thumbnails */}
                <div className="bg-black/80 text-white p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">{property.title}</h3>
                    <span className="text-sm bg-black/50 px-3 py-1 rounded-full">
                      {currentPhotoIndex + 1} / {property.images.length}
                    </span>
                  </div>

                  {/* Thumbnails */}
                  <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-black/20">
                    {property.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md transition-all duration-200 ${
                          index === currentPhotoIndex 
                            ? 'ring-2 ring-gray-400 scale-105' 
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={getFullImageUrl(image)}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}