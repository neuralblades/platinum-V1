"use client";

import Image from 'next/image';
import Link from 'next/link';
import { getFullImageUrl, handleImageError } from '@/utils/imageUtils';
import { getResponsiveSizes } from '@/utils/imageOptimizationUtils';
import { FaWhatsapp, FaPhone, FaEnvelope } from 'react-icons/fa';
import Button from '@/components/ui/Button';

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bedroomRange?: string; // Optional bedroom range for offplan properties
  bathrooms: number;
  area: number;
  imageUrl: string;
  featured?: boolean;
  isOffplan?: boolean;
  yearBuilt?: number | string; // For offplan handover year
  paymentPlan?: string; // For offplan payment plan
  agent?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string;
  };
}

const PropertyCard = ({
  id,
  title,
  price,
  location,
  bedrooms,
  bedroomRange,
  bathrooms,
  area,
  imageUrl,
  featured = false,
  isOffplan = false,
  yearBuilt,
  paymentPlan,
}: PropertyCardProps) => {

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-2"
    >
      <Link href={isOffplan ? `/properties/offplan/${id}` : `/properties/${id}`}>
        <div className="relative h-64 w-full">
          <Image
            src={getFullImageUrl(imageUrl)}
            alt={title}
            fill
            className="object-cover"
            sizes={getResponsiveSizes('card')}
            quality={80}
            loading={featured ? "eager" : "lazy"}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAJJXF+wHAAAAABJRU5ErkJggg=="
            onError={handleImageError}
          />
          <div className="absolute top-4 left-4 flex flex-col space-y-2">
            {featured && (
              <div
                className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md opacity-90 scale-100 translate-x-0 transition-all duration-300"
              >
                Featured
              </div>
            )}
            {isOffplan && (
              <div
                className="bg-gradient-to-r from-gray-600 to-gray-800 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md opacity-90 scale-100 translate-x-0 transition-all duration-300 delay-100"
              >
                Off Plan
              </div>
            )}
          </div>
        </div>
      </Link>

      <div className="p-5">
        <Link href={isOffplan ? `/properties/offplan/${id}` : `/properties/${id}`}>
          <h3
            className="text-xl font-bold text-gray-800 mb-2 transition-colors duration-200 hover:text-gray-600"
          >
            {title}
          </h3>
        </Link>

        <p
          className="text-gray-600 mb-2 flex items-center transition-transform duration-200 hover:translate-x-1"
        >
          <svg className="h-5 w-5 mr-1 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {location}
        </p>

        <p
          className="text-2xl font-bold text-gray-700 mb-4 opacity-100 translate-y-0 transition-all duration-300 delay-100"
        >
          AED {typeof price === 'number' ? price.toLocaleString() : Number(price).toLocaleString()}
        </p>

        <div
          className="flex justify-between text-gray-600 border-t pt-4 opacity-100 translate-y-0 transition-all duration-300 delay-200"
        >
          <div
            className="flex items-center transition-transform duration-200 hover:translate-x-1"
          >
            <svg className="h-5 w-5 mr-1 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>
              {isOffplan && bedroomRange
                ? `${bedroomRange} Beds`
                : `${bedrooms} ${bedrooms === 1 ? 'Bed' : 'Beds'}`
              }
            </span>
          </div>

          {isOffplan ? (
            <div
              className="flex items-center transition-transform duration-200 hover:translate-x-1"
            >
              <svg className="h-5 w-5 mr-1 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Handover {yearBuilt || 'TBA'}</span>
            </div>
          ) : (
            <div
              className="flex items-center transition-transform duration-200 hover:translate-x-1"
            >
              <svg className="h-5 w-5 mr-1 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {(() => {
                  const bathroomsNum = typeof bathrooms === 'string' ? parseFloat(bathrooms) : bathrooms;
                  const formattedBathrooms = Number.isInteger(bathroomsNum) ?
                    bathroomsNum :
                    bathroomsNum.toFixed(1).replace('.0', '');
                  return `${formattedBathrooms} ${bathroomsNum === 1 ? 'Bath' : 'Baths'}`;
                })()}
              </span>
            </div>
          )}

          {isOffplan ? (
            <div
              className="flex items-center transition-transform duration-200 hover:translate-x-1"
            >
              <svg className="h-5 w-5 mr-1 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{paymentPlan || '60/40'} Plan</span>
            </div>
          ) : null}
        </div>

        {/* Contact Buttons */}
        <div
          className="mt-4 pt-4 border-t border-gray-200 flex justify-between gap-2"
        >
          {/* WhatsApp Button */}
          <div
            className="flex-1"
          >
            <Button
              href={`https://wa.me/971585359315?text=${encodeURIComponent(`I'm interested in this property: ${title} (ID: ${id}). Please provide more information. ${typeof window !== 'undefined' ? window.location.origin : ''}${isOffplan ? `/properties/offplan/${id}` : `/properties/${id}`}`)}`}
              variant="accent"
              size="sm"
              className="w-full"
            >
              <FaWhatsapp className="mr-1" />
              <span className="text-sm">WhatsApp</span>
            </Button>
          </div>

          {/* Call Button */}
          <div
            className="flex-1"
          >
            <Button
              href="tel:+971585359315"
              variant="mj"
              size="sm"
              className="w-full"
            >
              <FaPhone className="mr-1" />
              <span className="text-sm">Call</span>
            </Button>
          </div>

          {/* Email Button */}
          <div
            className="flex-1"
          >
            <Button
              href={`mailto:info@platinumsquare.ae?subject=Inquiry about ${title} (ID: ${id})&body=I'm interested in this property: ${title} (ID: ${id}). Please provide more information. ${typeof window !== 'undefined' ? window.location.origin : ''}${isOffplan ? `/properties/offplan/${id}` : `/properties/${id}`}`}
              variant="accent"
              size="sm"
              className="w-full"
            >
              <FaEnvelope className="mr-1" />
              <span className="text-sm">Email</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;

export type { PropertyCardProps };
