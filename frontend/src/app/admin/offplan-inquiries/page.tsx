'use client';

import React, { useEffect, useState } from 'react';
import { getAllOffplanInquiries, updateOffplanInquiryStatus, OffplanInquiry } from '@/services/offplanInquiryService';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getFullImageUrl } from '@/utils/imageUtils';
import StatusBadge from '@/components/ui/StatusBadge';

export default function OffplanInquiriesPage() {
  const [inquiries, setInquiries] = useState<OffplanInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filteredInquiries, setFilteredInquiries] = useState<OffplanInquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<OffplanInquiry | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { user, isAdmin } = useAuth();
  const router = useRouter();

  // Fetch all offplan inquiries
  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const response = await getAllOffplanInquiries();
      if (response.success) {
        setInquiries(response.inquiries);
        setFilteredInquiries(response.inquiries);
      } else {
        setError('Failed to fetch offplan inquiries');
      }
    } catch (error) {
      console.error('Error fetching offplan inquiries:', error);
      setError('An error occurred while fetching offplan inquiries');
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchInquiries();
  };

  // Handle status update
  const handleStatusUpdate = async (id: string, status: 'new' | 'in-progress' | 'resolved') => {
    try {
      // First update the UI optimistically
      setInquiries(prevInquiries =>
        prevInquiries.map(inquiry =>
          inquiry.id === id ? { ...inquiry, status } : inquiry
        )
      );
      setFilteredInquiries(prevInquiries =>
        prevInquiries.map(inquiry =>
          inquiry.id === id ? { ...inquiry, status } : inquiry
        )
      );

      // Then try to update on the server
      const response = await updateOffplanInquiryStatus(id, status);

      if (!response.success) {
        // If server update fails, show error but keep the UI updated
        setError('Failed to update status on server, but changes saved locally');

        // Clear error after 5 seconds
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('An error occurred while updating status, but changes saved locally');

      // Clear error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Filter inquiries based on search term and status filter
  useEffect(() => {
    // First filter by status and search term
    let filtered = [...inquiries];

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(inquiry => inquiry.status === statusFilter);
    }

    // Apply search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        inquiry =>
          inquiry.name.toLowerCase().includes(term) ||
          inquiry.email.toLowerCase().includes(term) ||
          (inquiry.message && inquiry.message.toLowerCase().includes(term)) ||
          (inquiry.propertyTitle && inquiry.propertyTitle.toLowerCase().includes(term))
      );
    }

    // Then group by property to remove duplicates
    const propertyGroups: Record<string, OffplanInquiry> = {};

    filtered.forEach(inquiry => {
      const propertyId = inquiry.propertyId;

      // If this property hasn't been seen yet, or if this inquiry has a property image and the existing one doesn't
      if (!propertyGroups[propertyId] ||
          (inquiry.property?.mainImage && !propertyGroups[propertyId].property?.mainImage)) {
        propertyGroups[propertyId] = inquiry;
      }
    });

    // Convert back to array and sort by date (newest first)
    const uniqueFiltered = Object.values(propertyGroups).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setFilteredInquiries(uniqueFiltered);
  }, [inquiries, searchTerm, statusFilter]);

  // Initial data fetch
  useEffect(() => {
    if (!user || !isAdmin) {
      router.push('/auth/login?redirect=/admin/offplan-inquiries');
      return;
    }

    // Debug authentication
    console.log('Current user:', user);
    console.log('Is admin:', isAdmin);
    console.log('Auth token:', localStorage.getItem('token'));

    fetchInquiries();
  }, [user, isAdmin, router]);

  // View inquiry details
  const viewInquiryDetails = (inquiry: OffplanInquiry) => {
    setSelectedInquiry(inquiry);
    setShowModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="w-1 h-6 bg-gray-500 rounded-full mr-2"></span>
            Offplan Property Inquiries
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                // Debug function to directly check localStorage
                if (typeof window !== 'undefined') {
                  const rawData = localStorage.getItem('offplanInquiries');
                  console.log('Raw localStorage data:', rawData);
                  alert('Check console for localStorage data');
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Debug
            </button>
            <button
              onClick={() => {
                // Clear all offplan inquiries from localStorage
                if (typeof window !== 'undefined' && confirm('Are you sure you want to clear all offplan inquiries?')) {
                  localStorage.removeItem('offplanInquiries');
                  setInquiries([]);
                  setFilteredInquiries([]);
                  alert('All offplan inquiries have been cleared.');
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All
            </button>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, email, property..."
              className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600 shadow-md"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6 flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="p-6 text-center text-gray-500 flex flex-col items-center justify-center h-64">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p>No offplan inquiries found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Inquiry</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Property</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="border-t hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{inquiry.name}</span>
                        <span className="text-gray-500 text-sm">{inquiry.email}</span>
                        <span className="text-gray-500 text-sm">{inquiry.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {inquiry.property?.mainImage ? (
                          <img
                            src={getFullImageUrl(inquiry.property.mainImage)}
                            alt={inquiry.propertyTitle || 'Property'}
                            className="w-10 h-10 rounded-lg object-cover mr-3 shadow-sm border border-gray-100"
                            onError={(e) => e.currentTarget.src = '/images/default-property.jpg'}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 mr-3 flex items-center justify-center border border-gray-200 shadow-sm">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                        )}
                        <div className="max-w-xs truncate font-medium text-gray-700">{inquiry.propertyTitle || inquiry.propertyId}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={inquiry.status} />
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {formatDate(inquiry.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => viewInquiryDetails(inquiry)}
                        className="px-2 py-1 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-xs font-medium flex items-center"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inquiry Details Modal */}
      {showModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <span className="w-1 h-6 bg-gray-500 rounded-full mr-2"></span>
                Inquiry Details
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left side - Inquiry Information */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-800">Inquiry Information</h3>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700">Status</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded text-xs ${
                      selectedInquiry.status === 'new'
                        ? 'bg-gray-100 text-gray-800'
                        : selectedInquiry.status === 'in-progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedInquiry.status}
                    </span>
                    <select
                      className={`px-2 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 shadow-sm transition-all ${
                        selectedInquiry.status === 'new' ? 'bg-gray-100 border-gray-300 text-gray-800' :
                        selectedInquiry.status === 'in-progress' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' :
                        'bg-green-100 border-green-300 text-green-800'
                      }`}
                      value={selectedInquiry.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as 'new' | 'in-progress' | 'resolved';
                        // Update the selected inquiry status immediately for better UX
                        setSelectedInquiry(prev => prev ? {...prev, status: newStatus} : null);
                        // Then update in the database
                        handleStatusUpdate(selectedInquiry.id, newStatus);
                      }}
                    >
                      <option value="new">New</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700">Name</h4>
                  <p className="mt-1">{selectedInquiry.name}</p>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700">Email</h4>
                  <p className="mt-1">{selectedInquiry.email}</p>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700">Phone</h4>
                  <p className="mt-1">{selectedInquiry.phone}</p>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700">Date</h4>
                  <p className="mt-1">{formatDate(selectedInquiry.createdAt)}</p>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700">Preferred Language</h4>
                  <p className="mt-1">{selectedInquiry.preferredLanguage}</p>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700">Interested in Mortgage Advice</h4>
                  <p className="mt-1">{selectedInquiry.interestedInMortgage ? 'Yes' : 'No'}</p>
                </div>

                {selectedInquiry.message && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700">Message</h4>
                    <div className="mt-1 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <p className="whitespace-pre-wrap text-gray-700">{selectedInquiry.message}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right side - Property Information */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-800">Property Information</h3>

                {selectedInquiry.property ? (
                  <>
                    {selectedInquiry.property.mainImage && (
                      <div className="mb-4 overflow-hidden rounded-lg shadow-md border border-gray-100">
                        <img
                          src={getFullImageUrl(selectedInquiry.property.mainImage)}
                          alt={selectedInquiry.property.title || 'Property'}
                          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                          onError={(e) => e.currentTarget.src = '/images/default-property.jpg'}
                        />
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700">Title</h4>
                      <p className="mt-1 font-medium">{selectedInquiry.property.title}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700">Price</h4>
                      <p className="mt-1 text-lg font-bold">
                        ${selectedInquiry.property.price?.toLocaleString() || 'N/A'}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700">Location</h4>
                      <p className="mt-1">{selectedInquiry.property.location || 'N/A'}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700">Property Type</h4>
                      <p className="mt-1">{selectedInquiry.property.propertyType || 'N/A'}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700">Status</h4>
                      <p className="mt-1">{selectedInquiry.property.status || 'N/A'}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700">Bedrooms</h4>
                      <p className="mt-1">{selectedInquiry.property.bedrooms || 'N/A'}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700">Bathrooms</h4>
                      <p className="mt-1">{selectedInquiry.property.bathrooms || 'N/A'}</p>
                    </div>

                    <div className="mt-6">
                      <a
                        href={`/properties/offplan/${selectedInquiry.propertyId}`}
                        target="_blank"
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Property
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                    <p className="text-gray-600">
                      {selectedInquiry.propertyTitle ? (
                        <>
                          <span className="font-medium">{selectedInquiry.propertyTitle}</span>
                          <br />
                          <span className="text-sm">(Property ID: {selectedInquiry.propertyId})</span>
                          <br /><br />
                          <span className="text-sm flex items-center">
                            <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Detailed property information not available.
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-medium">Property ID: {selectedInquiry.propertyId}</span>
                          <br /><br />
                          <span className="text-sm flex items-center">
                            <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Detailed property information not available.
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
