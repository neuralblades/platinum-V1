'use client';

import api from './api';
import { fetchWithErrorHandling, objectToQueryParams } from './utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Types
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  property_type: string;
  status: string;
  is_offplan?: boolean;
  bedrooms: number;
  bathrooms: number;
  area: number;
  bedroom_range?: string; // New field for offplan properties
  features: string[];
  images: string[];
  main_image: string;
  agent: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string;
  };
  developers?: {
    id: string;
    name: string;
    logo?: string;
    slug: string;
  };
  developer_id?: string;
  featured: boolean;
  year_built?: number;
  payment_plan?: string;
  created_at: string;
  updated_at: string;
  latitude?: number;
  longitude?: number;
}

export interface PropertyFilter {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  isOffplan?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  location?: string;
  keyword?: string;
  yearBuilt?: number;
}

// Get all properties with filtering
export const getProperties = async (filters: PropertyFilter = {}) => {
  const queryParams = objectToQueryParams(filters);
  const response = await fetchWithErrorHandling(
    `/api/properties?${queryParams.toString()}`,
    'Failed to fetch properties'
  );
  
  // Transform API response to match frontend interface
  return {
    success: response.success,
    properties: response.data || [],
    page: response.pagination?.page || 1,
    pages: response.pagination?.pages || 1,
    total: response.pagination?.total || 0
  };
};

// Get featured properties
export const getFeaturedProperties = async () => {
  const response = await fetchWithErrorHandling(
    '/api/properties/featured',
    'Failed to fetch featured properties'
  );
  
  // Return the data array directly for featured properties
  return response.data || [];
};

// Get property by ID
export const getPropertyById = async (id: string) => {
  // Use absolute URL for server-side fetch
  const url =
    typeof window === 'undefined'
      ? `${API_URL}/properties/${id}`
      : `/api/properties/${id}`;
  return fetchWithErrorHandling(
    url,
    `Failed to fetch property with ID ${id}`
  );
};

// Create property (agent only)
export const createProperty = async (propertyData: FormData) => {
  try {
    const response = await api.post('/properties', propertyData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating property:', error);
    throw error;
  }
};

// Update property (agent only)
export const updateProperty = async (id: string, propertyData: FormData) => {
  try {
    const response = await api.put(`/properties/${id}`, propertyData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating property with ID ${id}:`, error);
    throw error;
  }
};

// Delete property (agent only)
export const deleteProperty = async (id: string) => {
  try {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.error(`Error deleting property with ID ${id}:`, error);
    // Return a structured error response instead of throwing
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    return {
      success: false,
      message: err.response?.data?.message || 'Failed to delete property',
      error: err.message
    };
  }
};

// Get properties by agent
export const getAgentProperties = async (agentId: string) => {
  try {
    const response = await api.get(`/properties/agent/${agentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching properties for agent ${agentId}:`, error);
    throw error;
  }
};
