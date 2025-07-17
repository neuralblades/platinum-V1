'use client';

import { useEffect } from 'react';
import Head from 'next/head';

interface MetaTagsProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  ogLocale?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
  structuredData?: Record<string, any>;
}

export default function MetaTags({
  title,
  description,
  canonical,
  ogImage = '/images/og-default.jpg',
  ogType = 'website',
  ogLocale = 'en_US',
  twitterCard = 'summary_large_image',
  noIndex = false,
  structuredData,
}: MetaTagsProps) {
  const siteTitle = `${title} | Platinum Square Real Estate`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://platinumsquare.com';
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : undefined;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;

  // Dynamically update the document title
  useEffect(() => {
    document.title = siteTitle;
  }, [siteTitle]);

  return (
    <Head>
      {/* Basic Meta Tags */}
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {canonical && <link rel="canonical" href={fullCanonical} />}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:url" content={fullCanonical || siteUrl} />
      <meta property="og:site_name" content="Platinum Square Real Estate" />
      <meta property="og:locale" content={ogLocale} />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </Head>
  );
}
