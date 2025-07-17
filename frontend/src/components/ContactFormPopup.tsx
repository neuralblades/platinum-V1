'use client';

import React, { useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '@/styles/phone-input.css'; // Custom styles to match our design
import { createDocumentRequest } from '@/services/documentRequestService';
import Modal from '@/components/ui/Modal';

interface ContactFormPopupProps {
  isOpen: boolean;
  closeModal: () => void;
  title: string;
  propertyTitle?: string;
  propertyId?: string;
  requestType?: 'brochure' | 'floorplan';
  onSubmit?: (formData: any) => void;
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
  const [formData, setFormData] = useState({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Include the phone value from PhoneInput in the submission
      const submissionData = {
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
        const response = await createDocumentRequest({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: phoneValue,
          propertyId,
          propertyTitle: propertyTitle || '',
          requestType
        });

        console.log('Document request response:', response);

        if (!response.success) {
          throw new Error(response.message);
        }

        setSuccess(true);
      } else {
        throw new Error('Property ID is required');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit the form. Please try again.');
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      {propertyTitle && (
        <div className="mb-5 p-3 bg-gray-50 rounded-md border border-gray-100">
          <p className="text-sm text-gray-700">Property: <span className="font-medium">{propertyTitle}</span></p>
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
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
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
                onChange={(value) => value && setPhoneValue(value)}
                className="phone-input"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 disabled:bg-gray-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ContactFormPopup;
