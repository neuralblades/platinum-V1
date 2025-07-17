"use client";

import React, { useState } from "react";
import PropertyCard from "./PropertyCard";
import { Property } from "@/services/propertyService";
import dynamic from 'next/dynamic';
import Chatbot from "@/components/chatbot/Chatbot";
import Image from "next/image";
import Modal from '@/components/ui/Modal';

interface PropertyDetailClientProps {
  property: Property;
  similarProperties: Property[];
}

const PropertyDetailClient: React.FC<PropertyDetailClientProps> = ({ property, similarProperties }) => {
  // Photo gallery modal state
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: 'I\'m interested in this property and would like to schedule a viewing.'
  });
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formSuccess, setFormSuccess] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  // Handle form submission (dummy, replace with actual API call if needed)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);
    setTimeout(() => {
      setFormSuccess(true);
      setFormSubmitting(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: 'I\'m interested in this property and would like to schedule a viewing.'
      });
    }, 1000);
  };

  return (
    <div>
      {/* Property Gallery */}
      <div className="relative w-full h-96 mb-8">
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          className="object-cover rounded-lg"
        />
        <button
          className="absolute bottom-4 right-4 bg-white/80 px-4 py-2 rounded shadow"
          onClick={() => setIsGalleryOpen(true)}
        >
          View Gallery
        </button>
      </div>

      {/* Gallery Modal */}
      <Modal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)}>
        <div className="relative w-full max-w-4xl bg-white rounded-lg p-4">
          <button
            className="absolute top-2 right-2 text-gray-700"
            onClick={() => setIsGalleryOpen(false)}
          >
            Close
          </button>
          <div className="flex items-center justify-center">
            <button
              onClick={() => setCurrentPhotoIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1))}
              className="mr-4"
            >
              Prev
            </button>
            <Image
              src={property.images[currentPhotoIndex]}
              alt={`Gallery ${currentPhotoIndex + 1}`}
              width={600}
              height={400}
              className="object-contain rounded"
            />
            <button
              onClick={() => setCurrentPhotoIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1))}
              className="ml-4"
            >
              Next
            </button>
          </div>
          <div className="flex justify-center mt-4 space-x-2">
            {property.images.map((img, idx) => (
              <button
                key={img}
                className={`w-16 h-10 rounded ${idx === currentPhotoIndex ? 'ring-2 ring-gray-500' : ''}`}
                onClick={() => setCurrentPhotoIndex(idx)}
              >
                <Image src={img} alt={`Thumb ${idx + 1}`} width={64} height={40} className="object-cover rounded" />
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Property Details */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
        <p className="text-gray-600 mb-4">{property.description}</p>
        <div className="flex flex-wrap gap-4 mb-4">
          <span>Price: {property.price}</span>
          <span>Location: {property.location}</span>
          <span>Bedrooms: {property.bedrooms}</span>
          <span>Bathrooms: {property.bathrooms}</span>
          <span>Area: {property.area} sqft</span>
        </div>
      </div>

      {/* Inquiry Form */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Contact Agent</h2>
        {formSuccess ? (
          <div className="text-green-600 mb-4">Your inquiry has been sent!</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              id="name"
              type="text"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
            <input
              id="email"
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
            <input
              id="phone"
              type="tel"
              placeholder="Your Phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
            <textarea
              id="message"
              rows={3}
              placeholder="Message"
              value={formData.message}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
            <button
              type="submit"
              disabled={formSubmitting}
              className="bg-gray-600 text-white px-4 py-2 rounded"
            >
              {formSubmitting ? 'Sending...' : 'Send Inquiry'}
            </button>
            {formError && <div className="text-red-600">{formError}</div>}
          </form>
        )}
      </div>

      {/* Similar Properties */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
          Similar Properties You May Like
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {similarProperties.map((property) => (
            <PropertyCard
              key={property.id}
              id={property.id}
              title={property.title}
              price={property.price}
              location={property.location}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              area={property.area}
              imageUrl={property.mainImage || ''}
              featured={property.featured}
              agent={property.agent}
            />
          ))}
        </div>
      </div>

      {/* Property-specific chatbot */}
      <Chatbot currentProperty={property} />
    </div>
  );
};

export default PropertyDetailClient; 