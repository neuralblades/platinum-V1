'use client';

import React, { useEffect, useState } from 'react';
import { getContactForms } from '@/services/contactService';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';

interface ContactForm {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  status: string;
}

export default function ContactSubmissionsPage() {
  const [forms, setForms] = useState<ContactForm[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check authentication first
    if (!user) {
      router.push('/auth/login?redirect=/admin/contact-submissions');
      return;
    }

    if (!isAdmin) {
      router.push('/');
      return;
    }

    // Fetch data
    const fetchForms = () => {
      try {
        // Directly access localStorage to get the latest data
        if (typeof window !== 'undefined') {
          // First try to get data directly from localStorage
          const storedForms = JSON.parse(localStorage.getItem('contactForms') || '[]');
          console.log('Initial load - forms in localStorage:', storedForms);

          // If we have forms in localStorage, use them
          if (storedForms.length > 0) {
            setForms(storedForms);
          } else {
            // Otherwise, use the service function which will provide test data
            const data = getContactForms();
            console.log('Using service function data:', data);
            setForms(data);
          }
        }
      } catch (error) {
        console.error('Error fetching contact forms:', error);
        // Fallback to the service function
        const data = getContactForms();
        setForms(data);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
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
        const storedForms = JSON.parse(localStorage.getItem('contactForms') || '[]');
        console.log('Directly retrieved from localStorage:', storedForms);
        setForms(storedForms);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      // Fallback to the service function
      const data = getContactForms();
      setForms(data);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="w-1 h-6 bg-gray-700 rounded-full mr-2"></span>
            Contact Form Submissions
          </h1>
          <div className="flex space-x-2">
            <Button
              onClick={() => {
                // Debug function to directly check localStorage
                if (typeof window !== 'undefined') {
                  const rawData = localStorage.getItem('contactForms');
                  console.log('Raw localStorage data:', rawData);
                  alert('Check console for localStorage data');
                }
              }}
              variant="primary"
              className="flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Debug
            </Button>
            <Button
              onClick={() => {
                // Add a test submission directly to localStorage
                if (typeof window !== 'undefined') {
                  const testSubmission = {
                    id: `test-${Date.now()}`,
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    phone: '(555) 123-4567',
                    subject: 'Test Submission',
                    message: 'This is a test submission added directly to localStorage.',
                    createdAt: new Date().toISOString(),
                    status: 'new'
                  };

                  // Get existing forms
                  const existingForms = JSON.parse(localStorage.getItem('contactForms') || '[]');

                  // Add the test submission
                  existingForms.push(testSubmission);

                  // Save back to localStorage
                  localStorage.setItem('contactForms', JSON.stringify(existingForms));

                  // Refresh the display
                  setForms(existingForms);

                  alert('Test submission added. Check the table below.');
                }
              }}
              variant="primary"
              className="flex items-center !bg-green-600 hover:!bg-green-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Test
            </Button>
            <Button
              onClick={() => {
                // Clear all contact forms from localStorage
                if (typeof window !== 'undefined' && confirm('Are you sure you want to clear all contact form submissions?')) {
                  localStorage.removeItem('contactForms');
                  setForms([]);
                  alert('All contact form submissions have been cleared.');
                }
              }}
              variant="primary"
              className="flex items-center !bg-red-600 hover:!bg-red-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All
            </Button>
            <Button
              onClick={handleRefresh}
              variant="primary"
              className="flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700 shadow-md"></div>
          </div>
        ) : forms.length === 0 ? (
          <div className="p-6 text-center text-gray-500 flex flex-col items-center justify-center h-64">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p>No contact form submissions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Phone</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Subject</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Message</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr key={form.id} className="border-t hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-3 px-4 text-gray-700">{formatDate(form.createdAt)}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">{`${form.firstName} ${form.lastName}`}</td>
                    <td className="py-3 px-4 text-gray-700">{form.phone}</td>
                    <td className="py-3 px-4 text-gray-700">{form.email}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">{form.subject}</td>
                    <td className="py-3 px-4">
                      <div className="max-w-xs truncate text-gray-700">{form.message}</div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={form.status} />
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
