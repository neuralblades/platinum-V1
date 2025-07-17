'use client';

import { useState, useEffect, FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createProperty, updateProperty, getPropertyById } from '@/services/propertyService';
import { getDevelopers } from '@/services/developerService';
import { getFullImageUrl } from '@/utils/imageUtils';
import { clearServerCache } from '@/utils/cacheUtils';
import { useToast } from '@/contexts/ToastContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

interface OffplanPropertyFormProps {
  propertyId?: string;
  isEdit?: boolean;
}

export default function OffplanPropertyForm({ propertyId, isEdit = false }: OffplanPropertyFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [developers, setDevelopers] = useState<any[]>([]);

  // Header image state
  const [headerImage, setHeaderImage] = useState<File | null>(null);
  const [existingHeaderImage, setExistingHeaderImage] = useState<string>('');
  const [headerImagePreviewUrl, setHeaderImagePreviewUrl] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: 'apartment', // Default to apartment for offplan
    status: 'for-sale', // Default to for-sale
    isOffplan: true, // Always true for offplan properties
    developerId: '',
    bedrooms: '1', // Default value, will be used as a fallback
    bedroomRange: '1-3', // New field for bedroom range
    yearBuilt: '',
    paymentPlan: '70/30', // Default payment plan
    features: [] as string[],
    featured: false,
    // Adding empty values for bathrooms and area to prevent validation errors
    bathrooms: '1',
    area: '1000',
  });

  // Feature input state
  const [featureInput, setFeatureInput] = useState('');

  // Fetch developers on component mount
  useEffect(() => {
    // Fetch developers list
    const fetchDevelopers = async () => {
      try {
        const response = await getDevelopers();
        if (response.success && response.developers) {
          setDevelopers(response.developers);
        }
      } catch (error) {
        console.error('Error fetching developers:', error);
      }
    };

    fetchDevelopers();

    if (isEdit && propertyId) {
      const fetchPropertyData = async () => {
        try {
          setLoading(true);
          const response = await getPropertyById(propertyId);
          console.log('OffplanPropertyForm - API Response:', response);
          if (response.success && response.data) {
            const property = response.data;
            console.log('OffplanPropertyForm - Property data:', property);

            // Only load if it's an offplan property
            if (!property.is_offplan) {
              showToast('This is not an offplan property. Redirecting to regular property edit form.', 'warning');
              // Redirect to the regular property edit form
              router.push(`/admin/properties/edit/${propertyId}`);
              return;
            }

            setFormData({
              title: property.title || '',
              description: property.description || '',
              price: property.price?.toString() || '',
              location: property.location || '',
              address: property.address || '',
              city: property.city || '',
              state: property.state || '',
              zipCode: property.zip_code || '',
              propertyType: property.property_type || 'apartment',
              status: property.status || 'for-sale',
              isOffplan: true,
              developerId: property.developers?.id || property.developer_id || '',
              bedrooms: property.bedrooms?.toString() || '1',
              bedroomRange: property.bedroom_range || `${property.bedrooms}-${property.bedrooms + 2}`,
              yearBuilt: property.year_built?.toString() || '',
              paymentPlan: property.payment_plan || '70/30',
              features: property.features || [],
              featured: property.featured || false,
              // Add default values for bathrooms and area
              bathrooms: property.bathrooms?.toString() || '1',
              area: property.area?.toString() || '1000',
            });

            if (property.images && property.images.length > 0) {
              setExistingImages(property.images);
            }

            // Set header image if available
            if (property.header_image) {
              setExistingHeaderImage(property.header_image);
            }
          } else {
            setError('Failed to load property data');
          }
        } catch (error) {
          console.error('Error fetching property:', error);
          setError('An error occurred while loading the property');
        } finally {
          setLoading(false);
        }
      };

      fetchPropertyData();
    }
  }, [isEdit, propertyId, router, showToast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFeatureInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeatureInput(e.target.value);
  };

  const addFeature = () => {
    if (featureInput.trim() !== '') {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()],
      });
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(index, 1);
    setFormData({ ...formData, features: updatedFeatures });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newUploadedImages = [...uploadedImages];
    const newImagePreviewUrls = [...imagePreviewUrls];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newUploadedImages.push(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        newImagePreviewUrls.push(reader.result as string);
        setImagePreviewUrls([...newImagePreviewUrls]);
      };
      reader.readAsDataURL(file);
    }

    setUploadedImages(newUploadedImages);
  };

  const handleHeaderImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0]; // Only take the first file
    setHeaderImage(file);

    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setHeaderImagePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeHeaderImage = () => {
    setHeaderImage(null);
    setHeaderImagePreviewUrl('');
    setExistingHeaderImage('');
  };

  const removeUploadedImage = (index: number) => {
    const newUploadedImages = [...uploadedImages];
    const newImagePreviewUrls = [...imagePreviewUrls];

    newUploadedImages.splice(index, 1);
    newImagePreviewUrls.splice(index, 1);

    setUploadedImages(newUploadedImages);
    setImagePreviewUrls(newImagePreviewUrls);
  };

  const removeExistingImage = (index: number) => {
    const newExistingImages = [...existingImages];
    newExistingImages.splice(index, 1);
    setExistingImages(newExistingImages);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate required fields
      const requiredFields = ['title', 'description', 'price', 'location', 'bedrooms', 'bedroomRange', 'developerId'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      // Validate that at least one image is provided
      if (existingImages.length === 0 && uploadedImages.length === 0) {
        setError('Please upload at least one image');
        setLoading(false);
        return;
      }

      // Create FormData object
      const propertyFormData = new FormData();

      // Add form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'features') {
          // Handle features array
          propertyFormData.append('features', JSON.stringify(value));
        } else {
          propertyFormData.append(key, value.toString());
        }
      });

      // Always set isOffplan to true
      propertyFormData.set('isOffplan', 'true');

      // Add images to FormData
      uploadedImages.forEach(image => {
        propertyFormData.append('images', image);
      });

      // Add existing images if editing
      // This is the key part - we ALWAYS send the existingImages array when editing,
      // even if it's empty, to ensure the backend knows to remove all existing images
      // when none are specified
      if (isEdit) {
        propertyFormData.append('existingImages', JSON.stringify(existingImages));
      }

      // Set main image (first image)
      if (existingImages.length > 0) {
        propertyFormData.append('mainImage', existingImages[0]);
      } else if (uploadedImages.length > 0 && imagePreviewUrls.length > 0) {
        // If no existing images but we have new uploads, the first new image will be the main image
        // The backend will handle this, but we're being explicit here
        propertyFormData.append('mainImage', 'new_upload_0');
      }

      // Add header image if available
      if (headerImage) {
        propertyFormData.append('headerImage', headerImage);
      }

      // Add existing header image if editing
      if (isEdit) {
        // Always send the existingHeaderImage value, even if it's empty
        // This ensures the backend knows to remove it if it's been cleared
        propertyFormData.append('existingHeaderImage', existingHeaderImage || '');
      }

      // Submit the form
      let response;
      if (isEdit && propertyId) {
        response = await updateProperty(propertyId, propertyFormData);
      } else {
        response = await createProperty(propertyFormData);
      }

      if (response.success) {
        setSuccess(isEdit ? 'Property updated successfully!' : 'Property created successfully!');
        showToast(isEdit ? 'Property updated successfully!' : 'Property created successfully!', 'success');

        // Clear the cache for featured properties to ensure the homepage shows the latest data
        await clearServerCache('featuredProperties');

        // If this is a featured property, also clear the homepage cache
        if (formData.featured) {
          await clearServerCache('homepage');
        }

        // Redirect to properties list
        setTimeout(() => {
          router.push('/admin/properties');
        }, 2000);
      } else {
        setError(response.message || 'An error occurred');
      }
    } catch (error) {
      console.error('Error saving property:', error);
      setError('An error occurred while saving the property');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return <LoadingSpinner />;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      <h2 className="text-xl font-bold mb-6">Offplan Property Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Property Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price (AED) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location/Neighborhood *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State/Province *
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                Zip/Postal Code *
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
            </div>
            <div>
              <label htmlFor="yearBuilt" className="block text-sm font-medium text-gray-700 mb-1">
                Expected Completion Year *
              </label>
              <input
                type="number"
                id="yearBuilt"
                name="yearBuilt"
                value={formData.yearBuilt}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                min={new Date().getFullYear()}
                required
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div>
            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
              Property Type *
            </label>
            <select
              id="propertyType"
              name="propertyType"
              value={formData.propertyType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
            >
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
              <option value="house">House</option>
              <option value="commercial">Commercial</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
            >
              <option value="for-sale">For Sale</option>
              <option value="for-rent">For Rent</option>
            </select>
          </div>

          <div>
            <label htmlFor="developerId" className="block text-sm font-medium text-gray-700 mb-1">
              Developer *
            </label>
            <select
              id="developerId"
              name="developerId"
              value={formData.developerId}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
            >
              <option value="">Select a Developer</option>
              {developers.map((developer) => (
                <option key={developer.id} value={developer.id}>
                  {developer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="paymentPlan" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Plan *
            </label>
            <select
              id="paymentPlan"
              name="paymentPlan"
              value={formData.paymentPlan}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
            >
              <option value="70/30">70/30 - Standard Plan</option>
              <option value="60/40">60/40 - Balanced Plan</option>
              <option value="50/50">50/50 - Equal Split Plan</option>
              <option value="80/20">80/20 - Front-loaded Plan</option>
              <option value="40/60">40/60 - Completion-focused Plan</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              The payment plan format represents the percentage paid during construction vs. at completion.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="bedroomRange" className="block text-sm font-medium text-gray-700 mb-1">
                Bedroom Range (e.g., "1-3" or "Studio-2") *
              </label>
              <input
                type="text"
                id="bedroomRange"
                name="bedroomRange"
                value={formData.bedroomRange}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
                placeholder="e.g., 1-3, Studio-2, 2-4"
              />
              <p className="text-xs text-gray-500 mt-1">
                Specify the range of bedrooms available in this development (e.g., "1-3", "Studio-2")
              </p>
            </div>
            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Default Bedrooms (for filtering) *
              </label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                min="0"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This value is used for filtering properties. Use the minimum number of bedrooms.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
            <div className="flex">
              <input
                type="text"
                value={featureInput}
                onChange={handleFeatureInputChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="Add a feature"
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-4 py-2 bg-gray-600 text-white rounded-r-md hover:bg-gray-700 transition duration-300"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full flex items-center"
                >
                  <span>{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="ml-2 text-gray-600 hover:text-gray-800"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded mr-2"
              />
              Featured Property
            </label>
          </div>
        </div>
      </div>

      {/* Header Image Section */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Header Image</h3>
        <p className="text-sm text-gray-600 mb-4">
          This image will be used as the large header background on the property detail page.
          For best results, use a high-resolution landscape image (recommended size: 1920x1080 pixels).
        </p>

        <div className="mb-4">
          <label htmlFor="headerImage" className="block text-sm font-medium text-gray-700 mb-1">
            Upload Header Image
          </label>
          <input
            type="file"
            id="headerImage"
            name="headerImage"
            onChange={handleHeaderImageChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            accept="image/*"
          />
        </div>

        {/* Header Image Preview */}
        {(headerImagePreviewUrl || existingHeaderImage) && (
          <div className="relative mb-6">
            <div className="relative h-48 w-full rounded-md overflow-hidden">
              <Image
                src={headerImagePreviewUrl || getFullImageUrl(existingHeaderImage)}
                alt="Header Image"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"

              />
            </div>
            <button
              type="button"
              onClick={removeHeaderImage}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition duration-300"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Property Images Section */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Property Gallery Images</h3>

        <div className="mb-4">
          <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
            Upload Images *
          </label>
          <input
            type="file"
            id="images"
            name="images"
            onChange={handleImageChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            accept="image/*"
            multiple
          />
          <p className="text-sm text-gray-500 mt-1">
            You can upload multiple images. The first image will be used as the main image.
          </p>
        </div>

        {/* Image Previews */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {/* Existing Images */}
          {existingImages.map((image, index) => (
            <div key={`existing-${index}`} className="relative">
              <div className="relative h-40 w-full rounded-md overflow-hidden">
                <Image
                  src={getFullImageUrl(image)}
                  alt={`Property Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"

                />
              </div>
              <button
                type="button"
                onClick={() => removeExistingImage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition duration-300"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-gray-600 text-white text-xs px-2 py-1 rounded">
                  Main
                </div>
              )}
            </div>
          ))}

          {/* New Uploaded Images */}
          {imagePreviewUrls.map((url, index) => (
            <div key={`new-${index}`} className="relative">
              <div className="relative h-40 w-full rounded-md overflow-hidden">
                <Image
                  src={url}
                  alt={`New Property Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"

                />
              </div>
              <button
                type="button"
                onClick={() => removeUploadedImage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition duration-300"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {existingImages.length === 0 && index === 0 && (
                <div className="absolute top-2 left-2 bg-gray-600 text-white text-xs px-2 py-1 rounded">
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end space-x-3">
        <Button
          type="button"
          onClick={() => router.push('/admin/properties')}
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          gradient={true}
          isLoading={loading}
          disabled={loading}
        >
          {isEdit ? 'Update Property' : 'Create Property'}
        </Button>
      </div>
    </form>
  );
}
