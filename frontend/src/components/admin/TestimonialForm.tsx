'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getTestimonialById, createTestimonial, updateTestimonial } from '@/services/testimonialService';
import { getFullImageUrl } from '@/utils/imageUtils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

interface TestimonialFormProps {
  testimonialId?: string;
  isEdit?: boolean;
}

export default function TestimonialForm({ testimonialId, isEdit = false }: TestimonialFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    quote: '',
    rating: 5,
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    if (isEdit && testimonialId) {
      fetchTestimonialData();
    }
  }, [isEdit, testimonialId]);

  const fetchTestimonialData = async () => {
    try {
      setLoading(true);
      const response = await getTestimonialById(testimonialId!);
      const testimonial = response.testimonial;

      setFormData({
        name: testimonial.name || '',
        role: testimonial.role || '',
        quote: testimonial.quote || '',
        rating: testimonial.rating || 5,
        isActive: testimonial.isActive || true,
        order: testimonial.order || 0,
      });

      if (testimonial.image) {
        setImagePreview(getFullImageUrl(testimonial.image));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching testimonial data:', error);
      setError('Failed to load testimonial data');
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'number') {
      // Fix: Handle empty strings and prevent NaN
      const numValue = value === '' ? 0 : parseInt(value);
      const finalValue = isNaN(numValue) ? 0 : numValue;
      setFormData({ ...formData, [name]: finalValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('quote', formData.quote);
      formDataToSend.append('rating', formData.rating.toString());
      formDataToSend.append('isActive', formData.isActive.toString());
      formDataToSend.append('order', formData.order.toString());

      // Add image if a new one was selected
      const imageInput = document.getElementById('image') as HTMLInputElement;
      if (imageInput.files && imageInput.files[0]) {
        formDataToSend.append('image', imageInput.files[0]);
      }

      if (isEdit) {
        await updateTestimonial(testimonialId!, formDataToSend);
        setSuccess('Testimonial updated successfully!');
        setTimeout(() => {
          router.push('/admin/testimonials');
        }, 2000);
      } else {
        await createTestimonial(formDataToSend);
        setSuccess('Testimonial created successfully!');
        setTimeout(() => {
          router.push('/admin/testimonials');
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving testimonial:', error);
      setError(isEdit ? 'Failed to update testimonial' : 'Failed to create testimonial');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">
                  Client Information
                </h2>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Role/Title *
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Homeowner, Property Investor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Client Photo
                  </label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                  {imagePreview && (
                    <div className="mt-3 relative h-32 w-32 rounded-full overflow-hidden">
                      <Image
                        src={imagePreview}
                        alt="Client Photo Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Testimonial Content */}
              <div>
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">
                  Testimonial Content
                </h2>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Testimonial Quote *
                  </label>
                  <textarea
                    name="quote"
                    value={formData.quote}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="Enter client testimonial..."
                    required
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Rating (1-5)
                  </label>
                  <select
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <option value={1}>1 Star</option>
                    <option value={2}>2 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={5}>5 Stars</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order || ''}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lower numbers will be displayed first.
                  </p>
                </div>

                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Active (visible on website)
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={() => router.push('/admin/testimonials')}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              gradient={true}
              isLoading={submitting}
            >
              {isEdit ? 'Update Testimonial' : 'Create Testimonial'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}