'use client';

import React, { useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '@/styles/phone-input.css'; // Custom styles to match our design
import { createDocumentRequest } from '@/services/documentRequestService';
import Modal from '@/components/ui/Modal';

// Define interfaces for better type safety
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
}

interface SubmissionData extends FormData {
  phone: string;
  propertyId?: string;
  propertyTitle?: string;
  requestType: 'brochure' | 'floorplan';
}

interface DocumentRequestResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

interface ContactFormPopupProps {
  isOpen: boolean;
  closeModal: () => void;
  title: string;
  propertyTitle?: string;
  propertyId?: string;
  requestType?: 'brochure' | 'floorplan';
  onSubmit?: (formData: SubmissionData) => Promise<void>;
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

const ContactFormPopup: React.FC<ContactFormPopupProps> = ({
  isOpen,
  closeModal,
  title,
  propertyTitle,
  propertyId,
  requestType = 'brochure',
  onSubmit
}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [phoneValue, setPhoneValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) {
      return 'First name is required';
    }
    if (!formData.lastName.trim()) {
      return 'Last name is required';
    }
    if (!formData.email.trim()) {
      return 'Email is required';
    }
    if (!phoneValue.trim()) {
      return 'Phone number is required';
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      // Include the phone value from PhoneInput in the submission
      const submissionData: SubmissionData = {
        ...formData,
        phone: phoneValue,
        propertyId,
        propertyTitle,
        requestType
      };

      console.log('Submitting document request:', submissionData);

      // If onSubmit prop is provided, use it
      if (onSubmit) {
        await onSubmit(submissionData);
        setSuccess(true);
      } else if (propertyId) {
        // Otherwise use the document request service
        const requestData: DocumentRequestData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: phoneValue,
          propertyId,
          propertyTitle: propertyTitle || '',
          requestType
        };

        const response = await createDocumentRequest(requestData) as DocumentRequestResponse;

        console.log('Document request response:', response);

        if (!response.success) {
          throw new Error(response.message || 'Failed to submit request');
        }

        setSuccess(true);
      } else {
        throw new Error('Property ID is required');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit the form. Please try again.';
      setError(errorMessage);
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: ''
    });
    setPhoneValue('');
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    closeModal();
  };

  const handlePhoneChange = (value: string | undefined) => {
    setPhoneValue(value || '');
  };

  const isFormValid = (): boolean => {
    return !!(
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.email.trim() &&
      phoneValue.trim()
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      {propertyTitle && (
        <div className="mb-5 p-3 bg-gray-50 rounded-md border border-gray-100">
          <p className="text-sm text-gray-700">
            Property: <span className="font-medium">{propertyTitle}</span>
          </p>
        </div>
      )}
      
      {success ? (
        <div className="text-center py-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Request Submitted!</h3>
          <p className="text-gray-600 mb-4">
            Thank you for your request. We will send you the {requestType === 'brochure' ? 'brochure' : 'floor plans'} shortly.
          </p>
          <button
            type="button"
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 transition-colors duration-200"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <div className="phone-input-container">
              <PhoneInput
                international
                countryCallingCodeEditable={false}
                defaultCountry="AE"
                value={phoneValue}
                onChange={handlePhoneChange}
                className="phone-input"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 transition-colors duration-200"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
              disabled={isSubmitting || !isFormValid()}
            >
              {isSubmitting && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ContactFormPopup;