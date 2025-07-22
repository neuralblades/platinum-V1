import { MetadataRoute } from 'next';
import { db } from '@/lib/supabase';
import supabase from '@/lib/supabase';

// Server-side functions that mirror your API logic
async function getPropertiesForSitemap() {
  try {
    const params = { limit: 1000, page: 1 };
    const properties = await db.properties.getAll(params);
    
    return {
      properties: properties.map(property => ({
        id: property.id,
        is_offplan: property.is_offplan,
        updatedAt: property.updated_at,
        createdAt: property.created_at
      }))
    };
  } catch (error) {
    console.error('Error fetching properties for sitemap:', error);
    return { properties: [] };
  }
}

async function getBlogPostsForSitemap() {
  try {
    const { data: blogPosts, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, created_at')
      .eq('status', 'published')
      .limit(1000);

    if (error) throw error;

    return {
      posts: blogPosts.map(post => ({
        slug: post.slug,
        updatedAt: post.updated_at,
        createdAt: post.created_at
      }))
    };
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
    return { posts: [] };
  }
}

async function getDevelopersForSitemap() {
  try {
    const { data: developers, error } = await supabase
      .from('developers')
      .select('slug, updated_at, created_at')
      .eq('is_active', true)
      .limit(1000);

    if (error) throw error;

    return {
      developers: developers.map(dev => ({
        slug: dev.slug,
        updatedAt: dev.updated_at,
        createdAt: dev.created_at
      }))
    };
  } catch (error) {
    console.error('Error fetching developers for sitemap:', error);
    return { developers: [] };
  }
}

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
    // Fetch dynamic content using server-side functions
    const [propertiesResponse, blogResponse, developersResponse] = await Promise.allSettled([
      getPropertiesForSitemap(),
      getBlogPostsForSitemap(),
      getDevelopersForSitemap(),
    ]);

    // Add properties to sitemap
    if (propertiesResponse.status === 'fulfilled' && propertiesResponse.value?.properties) {
      const properties = propertiesResponse.value.properties;
      
      // Regular properties
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const regularProperties = properties.filter((property: any) => !property.is_offplan);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      regularProperties.forEach((property: any) => {
        routes.push({
          url: `${baseUrl}/properties/${property.id}`,
          lastModified: new Date(property.updatedAt || property.createdAt),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        });
      });
      
      // Offplan properties
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const offplanProperties = properties.filter((property: any) => property.is_offplan);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      offplanProperties.forEach((property: any) => {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      posts.forEach((post: any) => {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      developers.forEach((developer: any) => {
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