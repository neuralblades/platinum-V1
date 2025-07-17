"use client";

import { Property } from '@/services/propertyService';
import { generatePropertySchema, generateBreadcrumbSchema } from '@/utils/structuredDataUtils';
import Head from 'next/head';
import Link from 'next/link';

export default function PropertyDetailView({ property }: { property: Property }) {
  // Generate structured data for the property
  const propertyStructuredData = generatePropertySchema(property);
  const breadcrumbStructuredData = generateBreadcrumbSchema([
    { label: 'Home', href: '/' },
    { label: 'Properties', href: '/properties' },
    { label: property.title }
  ]);

  return (
    <>
      <Head>
        <title>{property.title} | Platinum Square Real Estate</title>
        <meta name="description" content={property.description?.substring(0, 160) || `${property.bedrooms} bedroom property in ${property.location}, Dubai`} />
        <meta property="og:title" content={property.title} />
        <meta property="og:description" content={property.description?.substring(0, 160) || `${property.bedrooms} bedroom property in ${property.location}, Dubai`} />
        <meta property="og:image" content={property.images[0]} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={property.title} />
        <meta name="twitter:description" content={property.description?.substring(0, 160) || `${property.bedrooms} bedroom property in ${property.location}, Dubai`} />
        <meta name="twitter:image" content={property.images[0]} />
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(propertyStructuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
        />
      </Head>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
          <p className="text-gray-600 mb-4">{property.description}</p>
          <div className="flex flex-wrap gap-4 mb-4">
            <span>Price: {property.price}</span>
            <span>Location: {property.location}</span>
            <span>Bedrooms: {property.bedrooms}</span>
            <span>Bathrooms: {property.bathrooms}</span>
            <span>Area: {property.area} sqft</span>
          </div>
        </div>
        {/* You can add more styled sections here as needed */}
      </div>
    </>
  );
} 