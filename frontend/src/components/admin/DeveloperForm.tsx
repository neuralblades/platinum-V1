'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getDeveloperById, createDeveloper, updateDeveloper } from '@/services/developerService';
import { useToast } from '@/contexts/ToastContext';
import { getFullImageUrl } from '@/utils/imageUtils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

interface DeveloperFormProps {
  developerId?: string;
  isEdit?: boolean;
}

export default function DeveloperForm({ developerId, isEdit = false }: DeveloperFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    established: '',
    headquarters: '',
    featured: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && developerId) {
      fetchDeveloperData();
    }
  }, [isEdit, developerId]);

  const fetchDeveloperData = async () => {
    try {
      setLoading(true);
      const response = await getDeveloperById(developerId!);
      const developer = response.data;

      setFormData({
        name: developer.name || '',
        description: developer.description || '',
        website: developer.website || '',
        established: developer.established ? developer.established.toString() : '',
        headquarters: developer.headquarters || '',
        featured: developer.featured || false,
      });

      if (developer.logo) {
        setLogoPreview(getFullImageUrl(developer.logo));
      }

      if (developer.backgroundImage) {
        setBackgroundImagePreview(getFullImageUrl(developer.backgroundImage));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching developer data:', error);
      showToast('Failed to load developer data', 'error');
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('website', formData.website);
      formDataToSend.append('established', formData.established);
      formDataToSend.append('headquarters', formData.headquarters);
      formDataToSend.append('featured', formData.featured.toString());

      // Add logo if a new one was selected
      const logoInput = document.getElementById('logo') as HTMLInputElement;
      if (logoInput.files && logoInput.files[0]) {
        formDataToSend.append('logo', logoInput.files[0]);
      }

      // Add background image if a new one was selected
      const backgroundImageInput = document.getElementById('backgroundImage') as HTMLInputElement;
      if (backgroundImageInput.files && backgroundImageInput.files[0]) {
        formDataToSend.append('backgroundImage', backgroundImageInput.files[0]);
      }

      if (isEdit) {
        await updateDeveloper(developerId!, formDataToSend);
        showToast('Developer updated successfully', 'success');
      } else {
        await createDeveloper(formDataToSend);
        showToast('Developer created successfully', 'success');
      }

      router.push('/admin/developers');
    } catch (error) {
      console.error('Error saving developer:', error);
      showToast(isEdit ? 'Failed to update developer' : 'Failed to create developer', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Developer Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="text"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="e.g. www.example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="established" className="block text-sm font-medium text-gray-700 mb-1">
                Established Year
              </label>
              <input
                type="number"
                id="established"
                name="established"
                value={formData.established}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="e.g. 1995"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>

            <div>
              <label htmlFor="headquarters" className="block text-sm font-medium text-gray-700 mb-1">
                Headquarters
              </label>
              <input
                type="text"
                id="headquarters"
                name="headquarters"
                value={formData.headquarters}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="e.g. Dubai, UAE"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
              Featured Developer
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Enter developer description..."
            ></textarea>
          </div>

          <div>
            <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
              Logo
            </label>
            <input
              type="file"
              id="logo"
              name="logo"
              onChange={handleLogoChange}
              accept="image/*"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            {logoPreview && (
              <div className="mt-2 relative h-40 w-full">
                <Image
                  src={logoPreview}
                  alt="Logo Preview"
                  fill
                  className="object-contain"
                  sizes="100%"

                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="backgroundImage" className="block text-sm font-medium text-gray-700 mb-1">
              Background Image
            </label>
            <input
              type="file"
              id="backgroundImage"
              name="backgroundImage"
              onChange={handleBackgroundImageChange}
              accept="image/*"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            {backgroundImagePreview && (
              <div className="mt-2 relative h-40 w-full">
                <Image
                  src={backgroundImagePreview}
                  alt="Background Image Preview"
                  fill
                  className="object-cover"
                  sizes="100%"

                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <Button
          type="button"
          onClick={() => router.push('/admin/developers')}
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          gradient={true}
          isLoading={submitting}
          disabled={submitting}
        >
          {isEdit ? 'Update Developer' : 'Create Developer'}
        </Button>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}
    </form>
  );
}
