'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllDocumentRequests, updateDocumentRequestStatus, deleteDocumentRequest } from '@/services/documentRequestService';
import { formatDate } from '@/utils/dateUtils';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';

interface DocumentRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyId: string;
  propertyTitle: string;
  requestType: 'brochure' | 'floorplan';
  status: 'pending' | 'sent' | 'completed';
  createdAt: string;
  property?: {
    id: string;
    title: string;
    location: string;
    price: number;
  };
}

export default function DocumentRequestsPage() {
  const { user, token, isAdmin, loading: authLoading } = useAuth();
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    requestType: '',
    status: '',
  });



  // Update document request status
  const handleStatusUpdate = async (id: string, status: 'pending' | 'sent' | 'completed') => {
    // Get token from localStorage if not available from context
    const localToken = token || localStorage.getItem('token');

    if (!localToken) return;

    try {
      const response = await updateDocumentRequestStatus(id, status, localToken);
      if (response.success) {
        // Update the local state
        setDocumentRequests(prev =>
          prev.map(req => (req.id === id ? { ...req, status } : req))
        );
      } else {
        setError(response.message);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to update status');
    }
  };

  // Delete document request
  const handleDelete = async (id: string) => {
    // Get token from localStorage if not available from context
    const localToken = token || localStorage.getItem('token');

    if (!localToken) return;

    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        const response = await deleteDocumentRequest(id, localToken);
        if (response.success) {
          // Remove from local state
          setDocumentRequests(prev => prev.filter(req => req.id !== id));
        } else {
          setError(response.message);
        }
      } catch (err: unknown) {
        const error = err as { message?: string };
        setError(error.message || 'Failed to delete request');
      }
    }
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Effect to fetch data on mount and when dependencies change
  useEffect(() => {
    // Define the fetch function inside useEffect to avoid dependency issues
    const fetchData = async () => {
      // Get token from localStorage if not available from context
      const localToken = token || localStorage.getItem('token');

      if (!localToken) {
        console.log('No token available, cannot fetch document requests');
        return;
      }

      setLoading(true);
      try {
        console.log('Fetching document requests with token:', localToken);
        const response = await getAllDocumentRequests(localToken, {
          requestType: filters.requestType as 'brochure' | 'floorplan' | '' || undefined,
          status: filters.status as 'pending' | 'sent' | 'completed' | '' || undefined,
          page: currentPage,
          limit: 10,
          sort: 'createdAt',
          order: 'DESC',
        });

        console.log('Document requests response:', response);

        if (response.success) {
          console.log('Document requests data:', response.data);
          setDocumentRequests(response.data || []);
          setTotalPages(response.pages || 1);
        } else {
          console.error('Error in response:', response.message);
          setError(response.message);
        }
      } catch (err: unknown) {
        const error = err as { message?: string };
        console.error('Error fetching document requests:', error);
        setError(error.message || 'Failed to fetch document requests');
      } finally {
        setLoading(false);
      }
    };

    // Call the fetch function
    fetchData();
  }, [token, currentPage, filters]);

  // Show loading state
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600 shadow-md"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <h1 className="text-2xl font-bold text-gray-600 mb-4 flex items-center">
            <span className="w-1 h-6 bg-gray-500 rounded-full mr-2"></span>
            Authentication Required
          </h1>
          <p className="text-gray-700 mb-4">Please log in to access this page.</p>
          <a
            href="/auth/login?redirect=/admin/document-requests"
            className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 inline-flex items-center font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Log In
          </a>
        </div>
      </div>
    );
  }

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <h1 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
            <span className="w-1 h-6 bg-red-500 rounded-full mr-2"></span>
            Access Denied
          </h1>
          <p className="text-gray-700 mb-4">You do not have permission to view this page.</p>
          <Link
            href="/"
            className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 inline-flex items-center font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="w-1 h-6 bg-gray-500 rounded-full mr-2"></span>
            Document Requests
          </h1>

          {/* Filters */}
          <div className="flex space-x-4">
            <div>
              <label htmlFor="requestType" className="block text-sm font-medium text-gray-700 mb-1">
                Request Type
              </label>
              <select
                id="requestType"
                name="requestType"
                value={filters.requestType}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
              >
                <option value="">All Types</option>
                <option value="brochure">Brochure</option>
                <option value="floorplan">Floor Plan</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6 flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600 shadow-md"></div>
          </div>
        ) : documentRequests.length === 0 ? (
          <div className="p-6 text-center text-gray-500 flex flex-col items-center justify-center h-64">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No document requests found.</p>
          </div>
        ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 shadow-sm border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documentRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800">
                        {request.firstName} {request.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{request.email}</div>
                      <div className="text-sm text-gray-500">{request.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/properties/${request.property?.id || request.propertyId}`}
                        className="text-sm text-gray-600 hover:text-gray-800 hover:underline flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {request.propertyTitle || request.property?.title || 'Unknown Property'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${
                        request.requestType === 'brochure'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {request.requestType === 'brochure' ? 'Brochure' : 'Floor Plan'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(request.id)}
                        className="text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg text-xs font-medium transition-colors duration-200 inline-flex items-center"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200'
                  }`}
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <div className="mx-4 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                  <span className="font-medium text-gray-700">Page {currentPage}</span>
                  <span className="text-gray-500"> of {totalPages}</span>
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200'
                  }`}
                >
                  Next
                  <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}
