'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getAllInquiries, updateInquiryStatus, Inquiry } from '@/services/inquiryService';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const response = await getAllInquiries();
      if (response.success) {
        setInquiries(response.inquiries);
        setFilteredInquiries(response.inquiries);
      } else {
        setError('Failed to fetch inquiries');
      }
    } catch (error) {
      setError('An error occurred while fetching inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  useEffect(() => {
    let filtered = [...inquiries];

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(inquiry => inquiry.status === statusFilter);
    }

    // Apply search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(
        inquiry =>
          inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inquiry.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (typeof inquiry.property === 'object' && inquiry.property.title && inquiry.property.title.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredInquiries(filtered);
  }, [searchTerm, statusFilter, inquiries]);

  const handleViewInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setShowModal(true);
  };

  const handleStatusChange = async (inquiryId: string, newStatus: Inquiry['status']) => {
    try {
      const response = await updateInquiryStatus(inquiryId, newStatus);
      if (response.success) {
        // Update inquiry in the list
        const updatedInquiries = inquiries.map(inquiry =>
          inquiry._id === inquiryId ? { ...inquiry, status: newStatus } : inquiry
        );
        setInquiries(updatedInquiries);

        // Also update the selected inquiry if it's the one being changed
        if (selectedInquiry && selectedInquiry._id === inquiryId) {
          setSelectedInquiry({ ...selectedInquiry, status: newStatus });
        }
      } else {
        setError('Failed to update inquiry status');
      }
    } catch (error) {
      setError('An error occurred while updating inquiry status');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="w-1 h-6 bg-gray-700 rounded-full mr-2"></span>
          Inquiries Management
        </h1>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search inquiries..."
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
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
          <div>
            <Button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}
              variant="outline"
              className="w-full flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600 shadow-md"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="p-6 text-center text-gray-500 flex flex-col items-center justify-center h-64">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p>No inquiries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Inquiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInquiries.map((inquiry, idx) => (
                  <tr key={String(inquiry._id ?? inquiry.id ?? idx)} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">{inquiry.name}</div>
                        <div className="text-sm text-gray-500">{inquiry.email}</div>
                        <div className="text-sm text-gray-500">{inquiry.phone || '-'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {typeof inquiry.property === 'object' && inquiry.property.mainImage ? (
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 mr-3 relative">
                            <Image
                              src={`http://localhost:5000${inquiry.property.mainImage}`}
                              alt={typeof inquiry.property === 'object' && inquiry.property.title ? inquiry.property.title : 'Property Image'}
                              fill
                              sizes="(max-width: 768px) 100vw, 40px"
                              className="object-cover rounded-md"
                            />
                          </div>
                          <div className="text-sm text-gray-900">{typeof inquiry.property === 'object' && inquiry.property.title ? inquiry.property.title : '-'}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Property not found</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={inquiry.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        onClick={() => handleViewInquiry(inquiry)}
                        variant="primary"
                        size="sm"
                        className="!py-1 !px-2 inline-flex items-center"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      {showModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <span className="w-1 h-6 bg-gray-700 rounded-full mr-2"></span>
                Inquiry Details
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inquiry Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Inquiry Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <select
                      value={selectedInquiry.status || 'new'}
                      onChange={(e) => handleStatusChange(String(selectedInquiry._id ?? selectedInquiry.id), e.target.value as Inquiry['status'])}
                      className={`mt-1 text-sm border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm transition-all ${
                        selectedInquiry.status === 'new' ? 'bg-gray-100 border-gray-300 text-gray-800' :
                        selectedInquiry.status === 'in-progress' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' :
                        'bg-green-100 border-green-300 text-green-800'
                      }`}
                    >
                      <option value="new">New</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedInquiry.name}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedInquiry.email}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedInquiry.phone || '-'}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedInquiry.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Property Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Property Information</h4>
                {typeof selectedInquiry.property === 'object' && selectedInquiry.property.mainImage ? (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                    <div className="mb-4 relative h-40 w-full">
                      <Image
                        src={`http://localhost:5000${selectedInquiry.property.mainImage}`}
                        alt={typeof selectedInquiry.property === 'object' && selectedInquiry.property.title ? selectedInquiry.property.title : 'Property Image'}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Title</p>
                      <p className="mt-1 text-sm text-gray-900">{typeof selectedInquiry.property === 'object' && selectedInquiry.property.title ? selectedInquiry.property.title : '-'}</p>
                    </div>
                    <div className="mt-4">
                      {typeof selectedInquiry.property._id === 'string' && selectedInquiry.property._id ? (
                        <Link
                          href={`/properties/${selectedInquiry.property._id}`}
                          className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
                          target="_blank"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          View Property
                        </Link>
                      ) : (
                        <div className="text-sm text-gray-500">Property not found</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500">Property not found</p>
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Message</h4>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setShowModal(false)}
                variant="outline"
                className="flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
