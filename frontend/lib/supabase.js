import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default supabase;

// Database helper functions for common operations
export const db = {
  // Developers
  developers: {
    async getAll() {
      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    async getById(id) {
      const { data, error } = await supabase
        .from('developers')
        .select(`
          *,
          properties (
            id,
            title,
            price,
            location,
            main_image,
            status
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    async create(developerData) {
      const { data, error } = await supabase
        .from('developers')
        .insert(developerData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async update(id, updateData) {
      const { data, error } = await supabase
        .from('developers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase
        .from('developers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    }
  },

  // Properties
  properties: {
    async getAll(filters = {}) {
      let query = supabase
        .from('properties')
        .select('*');

      // Apply filters
      if (filters.type) query = query.eq('property_type', filters.type);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.isOffplan !== null && filters.isOffplan !== undefined) {
        query = query.eq('is_offplan', filters.isOffplan === 'true');
      }
      if (filters.featured !== null && filters.featured !== undefined) {
        query = query.eq('featured', filters.featured === 'true');
      }
      if (filters.developerId) query = query.eq('developer_id', parseInt(filters.developerId));

      // Price range
      if (filters.minPrice) query = query.gte('price', parseFloat(filters.minPrice));
      if (filters.maxPrice) query = query.lte('price', parseFloat(filters.maxPrice));

      // Bedrooms/Bathrooms
      if (filters.bedrooms) query = query.gte('bedrooms', parseInt(filters.bedrooms));
      if (filters.bathrooms) query = query.gte('bathrooms', parseFloat(filters.bathrooms));

      // Area range
      if (filters.minArea) query = query.gte('area', parseFloat(filters.minArea));
      if (filters.maxArea) query = query.lte('area', parseFloat(filters.maxArea));

      // Location search
      if (filters.location) query = query.ilike('location', `%${filters.location}%`);

      // Year built
      if (filters.yearBuilt) query = query.eq('year_built', parseInt(filters.yearBuilt));

      // Text search across multiple fields
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%,address.ilike.%${filters.search}%,city.ilike.%${filters.search}%`);
      }

      // Sorting
      const allowedSortFields = ['created_at', 'price', 'area', 'bedrooms', 'bathrooms', 'year_built'];
      const sortField = allowedSortFields.includes(filters.sortBy) ? filters.sortBy : 'created_at';
      const ascending = filters.sortOrder?.toLowerCase() === 'asc';
      query = query.order(sortField, { ascending });

      // Pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
        if (filters.page && filters.page > 1) {
          const offset = (filters.page - 1) * filters.limit;
          query = query.range(offset, offset + filters.limit - 1);
        }
      }

      const { data: properties, error } = await query;
      if (error) throw error;
      
      // Get related data separately
      if (properties && properties.length > 0) {
        const developerIds = [...new Set(properties.map(p => p.developer_id).filter(Boolean))];
        const agentIds = [...new Set(properties.map(p => p.agent_id).filter(Boolean))];
        
        const [developers, agents] = await Promise.all([
          developerIds.length > 0 ? supabase
            .from('developers')
            .select('id, name, logo, slug')
            .in('id', developerIds)
            .then(({ data }) => data || []) : [],
          agentIds.length > 0 ? supabase
            .from('users')
            .select('id, name, email, phone')
            .in('id', agentIds)
            .then(({ data }) => data || []) : []
        ]);
        
        const developerMap = new Map(developers.map(d => [d.id, d]));
        const agentMap = new Map(agents.map(a => [a.id, a]));
        
        return properties.map(property => ({
          ...property,
          developer: property.developer_id ? developerMap.get(property.developer_id) : null,
          agent: property.agent_id ? agentMap.get(property.agent_id) : null
        }));
      }
      
      return properties || [];
    },

    async getCount(filters = {}) {
      let query = supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // Apply same filters as getAll
      if (filters.type) query = query.eq('property_type', filters.type);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.isOffplan !== null && filters.isOffplan !== undefined) {
        query = query.eq('is_offplan', filters.isOffplan === 'true');
      }
      if (filters.featured !== null && filters.featured !== undefined) {
        query = query.eq('featured', filters.featured === 'true');
      }
      if (filters.developerId) query = query.eq('developer_id', parseInt(filters.developerId));

      if (filters.minPrice) query = query.gte('price', parseFloat(filters.minPrice));
      if (filters.maxPrice) query = query.lte('price', parseFloat(filters.maxPrice));

      if (filters.bedrooms) query = query.gte('bedrooms', parseInt(filters.bedrooms));
      if (filters.bathrooms) query = query.gte('bathrooms', parseFloat(filters.bathrooms));

      if (filters.minArea) query = query.gte('area', parseFloat(filters.minArea));
      if (filters.maxArea) query = query.lte('area', parseFloat(filters.maxArea));

      if (filters.location) query = query.ilike('location', `%${filters.location}%`);
      if (filters.yearBuilt) query = query.eq('year_built', parseInt(filters.yearBuilt));

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%,address.ilike.%${filters.search}%,city.ilike.%${filters.search}%`);
      }

      const { count, error } = await query;
      if (error) throw error;
      return count;
    },

    async getById(id) {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          developers!developer_id(*),
          users!agent_id(name, email, phone)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    async create(propertyData) {
      const { data, error } = await supabase
        .from('properties')
        .insert(propertyData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async update(id, updateData) {
      const { data, error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    },

    async getFeatured() {
      const { data: properties, error } = await supabase
        .from('properties')
        .select('*')
        .eq('featured', true)
        .limit(6);
      
      if (error) throw error;
      
      // Get developers separately if we have properties with developer_id
      if (properties && properties.length > 0) {
        const developerIds = [...new Set(properties.map(p => p.developer_id).filter(Boolean))];
        if (developerIds.length > 0) {
          const { data: developers } = await supabase
            .from('developers')
            .select('id, name, logo')
            .in('id', developerIds);
          
          // Map developers to properties
          const developerMap = new Map(developers?.map(d => [d.id, d]) || []);
          return properties.map(property => ({
            ...property,
            developer: property.developer_id ? developerMap.get(property.developer_id) : null
          }));
        }
      }
      
      return properties || [];
    },

    async getSimilar(propertyId, propertyType, price) {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id, title, price, location, bedrooms, bathrooms, area, main_image, property_type, status,
          developers!developer_id(id, name, logo, slug)
        `)
        .eq('property_type', propertyType)
        .gte('price', price * 0.8)
        .lte('price', price * 1.2)
        .neq('id', propertyId)
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data;
    },

    async getInquiryCount(propertyId) {
      const { count, error } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('property_id', propertyId);
      
      if (error) throw error;
      return count;
    }
  },

  // Users
  users: {
    async getAll() {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    async getById(id) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    async getByEmail(email) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    },

    async create(userData) {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async update(id, updateData) {
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    }
  },

  // Blog Posts
  blogs: {
    async getAll() {
      const { data: blogs, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      
      // Get authors separately
      if (blogs && blogs.length > 0) {
        const authorIds = [...new Set(blogs.map(b => b.author_id).filter(Boolean))];
        if (authorIds.length > 0) {
          const { data: authors } = await supabase
            .from('users')
            .select('id, name, email')
            .in('id', authorIds);
          
          const authorMap = new Map(authors?.map(a => [a.id, a]) || []);
          return blogs.map(blog => ({
            ...blog,
            author: blog.author_id ? authorMap.get(blog.author_id) : null
          }));
        }
      }
      
      return blogs || [];
    },

    async getById(id) {
      const { data: blog, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Get author separately
      if (blog && blog.author_id) {
        const { data: author } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('id', blog.author_id)
          .single();
        
        return {
          ...blog,
          author: author || null
        };
      }
      
      return blog;
    },

    async getFeatured() {
      const { data: blogs, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('featured', true)
        .eq('status', 'published')
        .limit(3);
      
      if (error) throw error;
      
      // Get authors separately
      if (blogs && blogs.length > 0) {
        const authorIds = [...new Set(blogs.map(b => b.author_id).filter(Boolean))];
        if (authorIds.length > 0) {
          const { data: authors } = await supabase
            .from('users')
            .select('id, name, email')
            .in('id', authorIds);
          
          const authorMap = new Map(authors?.map(a => [a.id, a]) || []);
          return blogs.map(blog => ({
            ...blog,
            author: blog.author_id ? authorMap.get(blog.author_id) : null
          }));
        }
      }
      
      return blogs || [];
    }
  },

  // Testimonials
  testimonials: {
    async getAll() {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    async create(testimonialData) {
      const { data, error } = await supabase
        .from('testimonials')
        .insert(testimonialData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async update(id, updateData) {
      const { data, error } = await supabase
        .from('testimonials')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Inquiries
  inquiries: {
    async getAll() {
      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          *,
          property:properties(title, location),
          user:users(name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    async create(inquiryData) {
      const { data, error } = await supabase
        .from('inquiries')
        .insert(inquiryData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Team Members
  team: {
    async getAll() {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    async create(teamData) {
      const { data, error } = await supabase
        .from('team_members')
        .insert(teamData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Document Requests
  documentRequests: {
    async getAll() {
      const { data, error } = await supabase
        .from('document_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    async getById(id) {
      const { data, error } = await supabase
        .from('document_requests')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    async create(requestData) {
      const { data, error } = await supabase
        .from('document_requests')
        .insert(requestData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async update(id, updateData) {
      const { data, error } = await supabase
        .from('document_requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase
        .from('document_requests')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    }
  },

  // Messages
  messages: {
    async getAll() {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    async getById(id) {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    async create(messageData) {
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async update(id, updateData) {
      const { data, error } = await supabase
        .from('messages')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    }
  },

  // Offplan Inquiries
  offplanInquiries: {
    async getAll() {
      const { data, error } = await supabase
        .from('offplan_inquiries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    async getById(id) {
      const { data, error } = await supabase
        .from('offplan_inquiries')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    async create(inquiryData) {
      const { data, error } = await supabase
        .from('offplan_inquiries')
        .insert(inquiryData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async update(id, updateData) {
      const { data, error } = await supabase
        .from('offplan_inquiries')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase
        .from('offplan_inquiries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    }
  },
};