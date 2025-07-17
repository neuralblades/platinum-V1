import { Property } from '@/services/propertyService';
import { BlogPost } from '@/services/blogService';
import { getFullImageUrl } from './imageUtils';

interface Organization {
  name: string;
  url: string;
  logo: string;
  address: string;
  telephone: string;
  email: string;
}

// Base organization data
const organizationData: Organization = {
  name: 'Platinum Square Real Estate',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://platinumsquare.com',
  logo: '/images/logo.png',
  address: 'Dubai, United Arab Emirates',
  telephone: '+971 4 123 4567',
  email: 'info@platinumsquare.com',
};

/**
 * Generate structured data for the organization
 */
export const generateOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: organizationData.name,
    url: organizationData.url,
    logo: `${organizationData.url}${organizationData.logo}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dubai',
      addressRegion: 'Dubai',
      addressCountry: 'AE',
    },
    telephone: organizationData.telephone,
    email: organizationData.email,
    sameAs: [
      'https://www.facebook.com/platinumsquare',
      'https://www.instagram.com/platinumsquare',
      'https://www.linkedin.com/company/platinumsquare',
    ],
  };
};

/**
 * Generate structured data for a property listing
 */
export const generatePropertySchema = (property: Property) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    image: getFullImageUrl(property.mainImage),
    url: `${organizationData.url}/properties/${property.id}`,
    datePosted: property.createdAt,
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.location,
      addressRegion: 'Dubai',
      addressCountry: 'AE',
    },
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'AED',
      availability: 'https://schema.org/InStock',
    },
    numberOfRooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.area,
      unitCode: 'SQM',
    },
    broker: {
      '@type': 'RealEstateAgent',
      name: organizationData.name,
      url: organizationData.url,
    },
  };
};

/**
 * Generate structured data for a blog post
 */
export const generateBlogPostSchema = (post: BlogPost) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage ? getFullImageUrl(post.featuredImage) : `${organizationData.url}/images/blog-placeholder.jpg`,
    url: `${organizationData.url}/blog/${post.slug}`,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author?.firstName && post.author?.lastName 
        ? `${post.author.firstName} ${post.author.lastName}`
        : 'Platinum Square Team',
    },
    publisher: {
      '@type': 'Organization',
      name: organizationData.name,
      logo: {
        '@type': 'ImageObject',
        url: `${organizationData.url}${organizationData.logo}`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${organizationData.url}/blog/${post.slug}`,
    },
  };
};

/**
 * Generate structured data for breadcrumbs
 */
export const generateBreadcrumbSchema = (items: { label: string; href?: string }[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `${organizationData.url}${item.href}` : undefined,
    })),
  };
};

/**
 * Generate structured data for a FAQ page
 */
export const generateFAQSchema = (faqs: { question: string; answer: string }[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};
