import { MetadataRoute } from 'next';
import { getProperties } from '@/services/propertyService';
import { getBlogPosts } from '@/services/blogService';
import { getDevelopers } from '@/services/developerService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL - replace with your actual domain in production
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://platinumsquare.com';
  
  // Static routes
  const routes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/properties/offplan`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/developers`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/team`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  try {
    // Fetch dynamic content
    const [propertiesResponse, blogResponse, developersResponse] = await Promise.allSettled([
      getProperties({ limit: 1000 }),
      getBlogPosts({ limit: 1000 }),
      getDevelopers(),
    ]);

    // Add properties to sitemap
    if (propertiesResponse.status === 'fulfilled' && propertiesResponse.value?.properties) {
      const properties = propertiesResponse.value.properties;
      
      // Regular properties
      const regularProperties = properties.filter(p => !p.isOffplan);
      regularProperties.forEach(property => {
        routes.push({
          url: `${baseUrl}/properties/${property.id}`,
          lastModified: new Date(property.updatedAt || property.createdAt),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        });
      });
      
      // Offplan properties
      const offplanProperties = properties.filter(p => p.isOffplan);
      offplanProperties.forEach(property => {
        routes.push({
          url: `${baseUrl}/properties/offplan/${property.id}`,
          lastModified: new Date(property.updatedAt || property.createdAt),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        });
      });
    }

    // Add blog posts to sitemap
    if (blogResponse.status === 'fulfilled' && blogResponse.value?.posts) {
      const posts = blogResponse.value.posts;
      posts.forEach(post => {
        routes.push({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: new Date(post.updatedAt || post.createdAt),
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        });
      });
    }

    // Add developers to sitemap
    if (developersResponse.status === 'fulfilled' && developersResponse.value?.developers) {
      const developers = developersResponse.value.developers;
      developers.forEach(developer => {
        routes.push({
          url: `${baseUrl}/developers/${developer.slug}`,
          lastModified: new Date(developer.updatedAt || developer.createdAt),
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        });
      });
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Continue with static routes if dynamic content fails
  }

  return routes;
}
