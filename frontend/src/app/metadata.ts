import { Metadata } from 'next';

// Default metadata for the entire site
export const metadata: Metadata = {
  title: {
    default: "Platinum Square | Luxury Real Estate in Dubai",
    template: "%s | Platinum Square Real Estate"
  },
  description: "Discover exclusive luxury properties in Dubai with Platinum Square Real Estate. Browse our collection of premium properties, off-plan projects, and investment opportunities.",
  keywords: ["Dubai real estate", "luxury properties", "off-plan properties", "Dubai property investment", "premium real estate", "Platinum Square"],
  authors: [{ name: "Platinum Square Real Estate" }],
  creator: "Platinum Square Real Estate",
  publisher: "Platinum Square Real Estate",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://platinumsquare.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Platinum Square | Luxury Real Estate in Dubai",
    description: "Discover exclusive luxury properties in Dubai with Platinum Square Real Estate. Browse our collection of premium properties, off-plan projects, and investment opportunities.",
    url: '/',
    siteName: 'Platinum Square Real Estate',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Platinum Square Real Estate',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Platinum Square | Luxury Real Estate in Dubai",
    description: "Discover exclusive luxury properties in Dubai with Platinum Square Real Estate. Browse our collection of premium properties, off-plan projects, and investment opportunities.",
    images: ['/images/og-default.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  verification: {
    // Add verification codes when available
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
  },
  category: 'real estate',
};

// Generate metadata for property pages
export const generatePropertyMetadata = (property: any) => {
  return {
    title: property.title,
    description: property.description?.substring(0, 160) || `${property.bedrooms} bedroom property in ${property.location}, Dubai`,
    alternates: {
      canonical: `/properties/${property.id}`,
    },
    openGraph: {
      title: property.title,
      description: property.description?.substring(0, 160) || `${property.bedrooms} bedroom property in ${property.location}, Dubai`,
      url: `/properties/${property.id}`,
      images: [
        {
          url: property.mainImage || '/images/og-default.jpg',
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
  };
};

// Generate metadata for blog pages
export const generateBlogMetadata = (post: any) => {
  return {
    title: post.title,
    description: post.excerpt || post.title,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      url: `/blog/${post.slug}`,
      images: [
        {
          url: post.featuredImage || '/images/og-default.jpg',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: post.publishedAt || post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.author?.firstName && post.author?.lastName ? `${post.author.firstName} ${post.author.lastName}` : 'Platinum Square Team'],
      tags: post.tags,
    },
  };
};
