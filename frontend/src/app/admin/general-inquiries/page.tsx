'use client';

import React, { useEffect, useState } from 'react';
import { getGeneralInquiries } from '@/services/inquiryService';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/ui/StatusBadge';

interface GeneralInquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  propertyType?: string;
  bedroomCount?: string;
  propertyInterest?: string;
  message?: string;
  createdAt: string;
  status: string;
}

export default function GeneralInquiriesPage() {
  const [inquiries, setInquiries] = useState<GeneralInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check authentication first
    if (!user) {
      router.push('/auth/login?redirect=/admin/general-inquiries');
      return;
    }

    if (!isAdmin) {
      router.push('/');
      return;
    }

    const fetchInquiries = async () => {
      try {
        const data = getGeneralInquiries();
        setInquiries(data);
      } catch (error) {
        console.error('Error fetching general inquiries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [user, isAdmin, router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Function to manually refresh the data
  const handleRefresh = () => {
    setLoading(true);

    // Directly access localStorage to get the latest data
    try {
      if (typeof window !== 'undefined') {
        const storedInquiries = JSON.parse(localStorage.getItem('generalInquiries') || '[]');
        console.log('Directly retrieved from localStorage:', storedInquiries);
        setInquiries(storedInquiries);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      // Fallback to the service function
      const data = getGeneralInquiries();
      setInquiries(data);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="w-1 h-6 bg-gray-500 rounded-full mr-2"></span>
            Chatbot Inquiries
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                // Debug function to directly check localStorage
                if (typeof window !== 'undefined') {
                  const rawData = localStorage.getItem('generalInquiries');
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
                // Add a test submission directly to localStorage
                if (typeof window !== 'undefined') {
                  const testInquiry = {
                    id: `chatbot-${Date.now()}`,
                    name: 'Test User',
                    phone: '(555) 123-4567',
                    email: 'test@example.com',
                    propertyType: 'Apartment',
                    bedroomCount: '2',
                    propertyInterest: 'Buy',
                    message: 'This is a test chatbot inquiry added directly to localStorage.',
                    createdAt: new Date().toISOString(),
                    status: 'new'
                  };

                  // Get existing inquiries
                  const existingInquiries = JSON.parse(localStorage.getItem('generalInquiries') || '[]');

                  // Add the test inquiry
                  existingInquiries.push(testInquiry);

                  // Save back to localStorage
                  localStorage.setItem('generalInquiries', JSON.stringify(existingInquiries));

                  // Refresh the display
                  setInquiries(existingInquiries);

                  alert('Test inquiry added. Check the table below.');
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Test
            </button>
            <button
              onClick={() => {
                // Clear all inquiries from localStorage
                if (typeof window !== 'undefined' && confirm('Are you sure you want to clear all chatbot inquiries?')) {
                  localStorage.removeItem('generalInquiries');
                  setInquiries([]);
                  alert('All chatbot inquiries have been cleared.');
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center"
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

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600 shadow-md"></div>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-6 text-center text-gray-500 flex flex-col items-center justify-center h-64">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p>No chatbot inquiries found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Phone</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Interest</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Property Type</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Bedrooms</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Message</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="border-t hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-3 px-4 text-gray-700">{formatDate(inquiry.createdAt)}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">{inquiry.name}</td>
                    <td className="py-3 px-4 text-gray-700">{inquiry.phone}</td>
                    <td className="py-3 px-4 text-gray-700">{inquiry.propertyInterest || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-700">{inquiry.propertyType || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-700">{inquiry.bedroomCount || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-700">
                      <div className="max-w-xs truncate">{inquiry.message || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={inquiry.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
