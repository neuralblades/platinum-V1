'use client';

import api from './api';

// Types
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  image?: string;
  quote: string;
  rating: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Get all active testimonials (public)
export const getTestimonials = async () => {
  try {
    const response = await api.get('/testimonials');
    // Transform API response to match frontend interface
    return {
      success: response.data.success,
      testimonials: response.data.data || [],
      count: response.data.count || 0
    };
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    // Return empty structure on error
    return {
      success: false,
      testimonials: [],
      count: 0
    };
  }
};

// Get all testimonials (admin)
export const getAllTestimonials = async () => {
  try {
    const response = await api.get('/testimonials');
    return response.data;
  } catch (error) {
    console.error('Error fetching all testimonials:', error);
    throw error;
  }
};

// Get testimonial by ID
export const getTestimonialById = async (id: string) => {
  try {
    const response = await api.get(`/testimonials/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching testimonial ${id}:`, error);
    throw error;
  }
};

// Create a new testimonial (admin only)
export const createTestimonial = async (formData: FormData) => {
  try {
    const response = await api.post('/testimonials', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating testimonial:', error);
    throw error;
  }
};

// Update a testimonial (admin only)
export const updateTestimonial = async (id: string, formData: FormData) => {
  try {
    const response = await api.put(`/testimonials/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating testimonial ${id}:`, error);
    throw error;
  }
};

// Delete a testimonial (admin only)
export const deleteTestimonial = async (id: string) => {
  try {
    const response = await api.delete(`/testimonials/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting testimonial ${id}:`, error);
    throw error;
  }
};
