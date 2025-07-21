'use client';

import api from './api';

// Interfaces
export interface Inquiry {
  _id?: string;
  id?: string | number;
  property: string | {
    _id?: string;
    id?: string | number;
    title: string;
    main_image: string;
  };
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'new' | 'in-progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface InquiryData {
  property: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface GeneralInquiryData {
  name: string;
  phone: string;
  email?: string;
  propertyType?: string;
  bedroomCount?: string;
  propertyInterest?: string;
  message?: string;
}

// Return types
interface InquiryListResponse {
  success: boolean;
  inquiries: Inquiry[];
  total?: number;
  pagination?: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
  message?: string;
}

interface InquiryResponse {
  success: boolean;
  inquiry: Inquiry;
  message?: string;
}

/**
 * Create a new inquiry
 */
export const createInquiry = async (
  inquiryData: InquiryData
): Promise<InquiryResponse> => {
  try {
    const response = await api.post<InquiryResponse>('/inquiries', inquiryData);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating inquiry:', error.message);
      throw new Error(error.message);
    }
    throw new Error('Unknown error creating inquiry');
  }
};

/**
 * Get inquiries for a property (agent only)
 */
export const getPropertyInquiries = async (
  propertyId: string
): Promise<Inquiry[]> => {
  try {
    const response = await api.get<{ success: boolean; data: Inquiry[] }>(
      `/inquiries/property/${propertyId}`
    );
    return response.data.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error fetching inquiries for property ${propertyId}:`, error.message);
      throw new Error(error.message);
    }
    throw new Error('Unknown error fetching property inquiries');
  }
};

/**
 * Get inquiries for an agent (agent only)
 */
export const getAgentInquiries = async (): Promise<Inquiry[]> => {
  try {
    const response = await api.get<{ success: boolean; data: Inquiry[] }>('/inquiries/agent');
    return response.data.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching agent inquiries:', error.message);
      throw new Error(error.message);
    }
    throw new Error('Unknown error fetching agent inquiries');
  }
};

/**
 * Update inquiry status (agent only)
 */
export const updateInquiryStatus = async (
  inquiryId: string,
  status: 'new' | 'in-progress' | 'resolved'
): Promise<InquiryResponse> => {
  try {
    const response = await api.put<InquiryResponse>(`/inquiries/${inquiryId}`, { status });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error updating inquiry ${inquiryId}:`, error.message);
      throw new Error(error.message);
    }
    throw new Error('Unknown error updating inquiry status');
  }
};

/**
 * Get all inquiries (admin only)
 */
export const getAllInquiries = async (
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }
): Promise<InquiryListResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const response = await api.get(`/inquiries?${queryParams.toString()}`);
    return {
      success: response.data.success,
      inquiries: response.data.data || [],
      total: response.data.pagination?.totalItems,
      pagination: response.data.pagination,
      message: response.data.message,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching all inquiries:', error.message);
      return {
        success: false,
        inquiries: [],
        message: error.message,
      };
    }
    return {
      success: false,
      inquiries: [],
      message: 'Failed to fetch inquiries',
    };
  }
};

/**
 * Create a general inquiry (not tied to a specific property)
 */
export const createGeneralInquiry = async (
  inquiryData: GeneralInquiryData
): Promise<Inquiry | { success?: boolean }> => {
  try {
    try {
      const response = await api.post('/inquiries/general', inquiryData);
      return response.data;
    } catch (apiError: unknown) {
      if (apiError instanceof Error) {
        console.warn('API general inquiry fallback due to:', apiError.message);
      }
      const existingInquiries = JSON.parse(localStorage.getItem('generalInquiries') || '[]');
      const newInquiry: Inquiry = {
        ...inquiryData,
        id: `inquiry-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'new',
        message: inquiryData.message || '',
        name: inquiryData.name,
        phone: inquiryData.phone,
        email: inquiryData.email || '',
        property: '',
      };
      existingInquiries.push(newInquiry);
      localStorage.setItem('generalInquiries', JSON.stringify(existingInquiries));
      return newInquiry;
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating general inquiry:', error.message);
      throw new Error(error.message);
    }
    throw new Error('Unknown error creating general inquiry');
  }
};

/**
 * Get all general inquiries from localStorage (admin only)
 */
export const getGeneralInquiries = (): Inquiry[] => {
  try {
    const inquiries = JSON.parse(localStorage.getItem('generalInquiries') || '[]');
    return inquiries;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching general inquiries:', error.message);
    }
    return [];
  }
};
