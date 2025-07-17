// components/PropertyInquiry.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { submitOffplanInquiry } from '@/services/offplanInquiryService';
import { Property, OffplanFormData } from '../types/property.types';

interface Props {
  property: Property;
  propertyId: string;
}

export default function PropertyInquiry({ property, propertyId }: Props) {
  const [formData, setFormData] = useState<OffplanFormData>({
    name: '',
    email: '',
    phone: '',
    preferredLanguage: 'english',
    message: '',
    interestedInMortgage: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { id, value, type } = target;

    if (type === 'checkbox') {
      const checked = target.checked;
      setFormData(prev => ({
        ...prev,
        [id]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const formattedPhone = formData.phone.startsWith('+')
        ? formData.phone
        : `+971${formData.phone}`;

      const response = await submitOffplanInquiry({
        propertyId,
        propertyTitle: property.title,
        name: formData.name,
        email: formData.email,
        phone: formattedPhone,
        preferredLanguage: formData.preferredLanguage,
        message: formData.message,
        interestedInMortgage: formData.interestedInMortgage
      });

      if (response.success) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          preferredLanguage: 'english',
          message: '',
          interestedInMortgage: false
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full" data-inquiry>
      <div className="relative rounded-xl shadow-xl overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/banner.webp"
            alt="Contact Section Background"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-900 opacity-65"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 relative z-10">
          {/* Left side - Text content */}
          <div className="flex flex-col justify-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              The best deals are our expertise – register now.
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Partner with Dubai's Leading Real Estate Agency Since 2008. Share your details, and our off-plan property expert will call you back within just 55 seconds.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <a 
                href="tel:+971585602665" 
                className="flex items-center px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition duration-300 font-medium"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Request a Call Back Now
              </a>
              
              <a
                href={`https://wa.me/971585602665?text=I'm interested in ${property.title} (ID: ${propertyId})`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 font-medium"
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat with us on WhatsApp
              </a>
            </div>
          </div>

          {/* Right side - Contact Form */}
          <div className="relative bg-white rounded-lg shadow-lg p-6 transform transition-transform duration-300 hover:shadow-xl overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Register Your Interest</h3>
              <p className="text-gray-600 mb-6">
                Fill out the form below and our property consultant will get in touch with you shortly.
              </p>

              {/* Success Message */}
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-green-800 text-sm">Thank you! Your inquiry has been submitted successfully.</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <p className="text-red-800 text-sm">Sorry, there was an error submitting your inquiry. Please try again.</p>
                  </div>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <div className="flex">
                    <div className="flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg shadow-sm">
                      <span className="text-gray-500 text-sm">+971</span>
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      className="w-full px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm"
                      placeholder="Phone number"
                      value={formData.phone}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm"
                    placeholder="Your email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="preferredLanguage" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Language
                  </label>
                  <select
                    id="preferredLanguage"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 appearance-none bg-white shadow-sm"
                    value={formData.preferredLanguage}
                    onChange={handleFormChange}
                  >
                    <option value="english">English</option>
                    <option value="arabic">Arabic</option>
                    <option value="russian">Russian</option>
                    <option value="chinese">Chinese</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm"
                    placeholder="Your message"
                    value={formData.message}
                    onChange={handleFormChange}
                  ></textarea>
                </div>

                <div className="flex items-center bg-gray-100 p-3 rounded-lg">
                  <input
                    type="checkbox"
                    id="interestedInMortgage"
                    className="h-5 w-5 text-gray-700 focus:ring-gray-500 border-gray-300 rounded"
                    checked={formData.interestedInMortgage}
                    onChange={handleFormChange}
                  />
                  <label htmlFor="interestedInMortgage" className="ml-2 block text-sm text-gray-700">
                    I'm interested in mortgage advice
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-medium rounded-lg hover:shadow-lg transition duration-300 shadow-md text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Register your Interest'
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-2">
                  By clicking Submit, you agree to our{' '}
                  <a href="#" className="text-gray-700 hover:underline">Terms & Conditions</a>{' '}
                  and{' '}
                  <a href="#" className="text-gray-700 hover:underline">Privacy Policy</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}