import { Metadata } from 'next';

// Types for better type safety
interface Property {
  id: number;
  title: string;
  description?: string;
  bedrooms: number;
  location: string;
  mainImage?: string;
  price?: number;
  propertyType?: string;
}

interface BlogPost {
  title: string;
  excerpt?: string;
  slug: string;
  featuredImage?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    firstName?: string;
    lastName?: string;
  };
  tags?: string[];
}

// Get base URL safely
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://platinumsquare.vercel.app';
};

// Default metadata for the entire site
export const metadata: Metadata = {
  title: {
    default: "Platinum Square | Luxury Real Estate in Dubai",
    template: "%s | Platinum Square Real Estate"
  },
  description: "Discover exclusive luxury properties in Dubai with Platinum Square Real Estate. Browse our collection of premium properties, off-plan projects, and investment opportunities.",
  keywords: [
    "Dubai real estate", 
    "luxury properties", 
    "off-plan properties", 
    "Dubai property investment", 
    "premium real estate", 
    "Platinum Square",
    "Dubai apartments",
    "Dubai villas",
    "Dubai penthouses",
    "real estate Dubai",
    "property Dubai"
  ],
  authors: [{ name: "Platinum Square Real Estate" }],
  creator: "Platinum Square Real Estate",
  publisher: "Platinum Square Real Estate",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  metadataBase: new URL(getBaseUrl()),
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
        alt: 'Platinum Square Real Estate - Luxury Properties in Dubai',
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
  category: 'real estate',
};

// Generate metadata for property pages
export const generatePropertyMetadata = (property: Property): Metadata => {
  const title = property.title;
  const description = property.description?.substring(0, 160) || 
    `${property.bedrooms} bedroom ${property.propertyType || 'property'} in ${property.location}, Dubai. ${property.price ? `Starting from AED ${property.price.toLocaleString()}` : 'Contact for pricing'}.`;
  
  return {
    title,
    description,
    keywords: [
      property.location,
      `${property.bedrooms} bedroom`,
      property.propertyType || 'property',
      'Dubai real estate',
      'luxury property',
      'Dubai property for sale'
    ],
    alternates: {
      canonical: `/properties/${property.id}`,
    },
    openGraph: {
      title,
      description,
      url: `/properties/${property.id}`,
      images: [
        {
          url: property.mainImage || '/images/og-default.jpg',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [property.mainImage || '/images/og-default.jpg'],
    },
  };
};

// Generate metadata for blog pages
export const generateBlogMetadata = (post: BlogPost): Metadata => {
  const title = post.title;
  const description = post.excerpt || `${post.title.substring(0, 160)}...`;
  const authorName = post.author?.firstName && post.author?.lastName 
    ? `${post.author.firstName} ${post.author.lastName}` 
    : 'Platinum Square Team';

  return {
    title,
    description,
    keywords: [
      'Dubai real estate news',
      'property market Dubai',
      'real estate blog',
      'Dubai property insights',
      ...(post.tags || [])
    ],
    authors: [{ name: authorName }],
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/blog/${post.slug}`,
      images: [
        {
          url: post.featuredImage || '/images/og-default.jpg',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: post.publishedAt || post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [authorName],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [post.featuredImage || '/images/og-default.jpg'],
    },
  };
};

// Helper function for generating dynamic page metadata
export const generatePageMetadata = (
  title: string,
  description: string,
  path: string,
  image?: string
): Metadata => {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      images: [
        {
          url: image || '/images/og-default.jpg',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image || '/images/og-default.jpg'],
    },
  };
};

// Structured data generators (use these in your page components)
export const generatePropertyStructuredData = (property: Property) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: `${getBaseUrl()}/properties/${property.id}`,
    image: property.mainImage,
    ...(property.price && {
      offers: {
        '@type': 'Offer',
        price: property.price,
        priceCurrency: 'AED'
      }
    }),
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.location,
      addressCountry: 'AE'
    }
  };
};

export const generateBlogStructuredData = (post: BlogPost) => {
  const authorName = post.author?.firstName && post.author?.lastName 
    ? `${post.author.firstName} ${post.author.lastName}` 
    : 'Platinum Square Team';

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: `${getBaseUrl()}/blog/${post.slug}`,
    image: post.featuredImage,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: authorName
    },
    publisher: {
      '@type': 'Organization',
      name: 'Platinum Square Real Estate',
      logo: `${getBaseUrl()}/images/logo.png`
    }
  };
};