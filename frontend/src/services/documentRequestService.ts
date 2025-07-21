'use client';

import api from './api';

interface DocumentRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyId: string;
  requestType: 'brochure' | 'floorplan';
  status: 'pending' | 'sent' | 'completed';
  createdAt: string;
  updatedAt: string;
}

interface DocumentRequestData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyId: string;
  propertyTitle: string;
  requestType: 'brochure' | 'floorplan';
}

interface DocumentRequestResponse {
  success: boolean;
  message: string;
  documentRequest?: DocumentRequest;
  error?: string;
}

/**
 * Create a new document request (brochure or floor plan)
 */
export const createDocumentRequest = async (data: DocumentRequestData): Promise<DocumentRequestResponse> => {
  try {
    const response = await api.post('/document-requests', data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating document request:', error.message);
      return {
        success: false,
        message: error.message || 'Failed to create document request',
      };
    }

    return {
      success: false,
      message: 'An unknown error occurred',
    };
  }
};

/**
 * Get all document requests (admin only)
 */
export const getAllDocumentRequests = async (
  token: string,
  filters: {
    requestType?: 'brochure' | 'floorplan';
    status?: 'pending' | 'sent' | 'completed';
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'ASC' | 'DESC';
  } = {}
) => {
  try {
    // Set authorization header
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Make the request with query parameters
    const response = await api.get('/document-requests', { params: filters });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      return {
        success: false,
        message: error.message || 'An error occurred',
      };
    }

    return {
      success: false,
      message: 'An unknown error occurred',
    };
  }
};

/**
 * Update document request status (admin only)
 */
export const updateDocumentRequestStatus = async (
  id: string,
  status: 'pending' | 'sent' | 'completed',
  token: string
) => {
  try {
    // Set authorization header
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Make the request
    const response = await api.put(`/document-requests/${id}`, { status });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      return {
        success: false,
        message: error.message || 'An error occurred',
      };
    }

    return {
      success: false,
      message: 'An unknown error occurred',
    };
  }
};

/**
 * Delete document request (admin only)
 */
export const deleteDocumentRequest = async (id: string, token: string) => {
  try {
    // Set authorization header
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Make the request
    const response = await api.delete(`/document-requests/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      return {
        success: false,
        message: error.message || 'An error occurred',
      };
    }

    return {
      success: false,
      message: 'An unknown error occurred',
    };
  }
};
