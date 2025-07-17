'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getAllTestimonials, deleteTestimonial, Testimonial } from '@/services/testimonialService';
import { useToast } from '@/contexts/ToastContext';
import { getFullImageUrl } from '@/utils/imageUtils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import Alert from '@/components/ui/Alert';
import StatusBadge from '@/components/ui/StatusBadge';

export default function TestimonialList() {
  const router = useRouter();
  const { showToast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchTestimonials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await getAllTestimonials();
      setTestimonials(response.testimonials);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      showToast('Failed to load testimonials', 'error');
      setLoading(false);
      setError('Failed to load testimonials');
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/testimonials/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    setTestimonialToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!testimonialToDelete) return;

    try {
      await deleteTestimonial(testimonialToDelete);
      setTestimonials(testimonials.filter(t => t.id !== testimonialToDelete));
      showToast('Testimonial deleted successfully', 'success');
      setSuccess('Testimonial deleted successfully');
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      showToast('Failed to delete testimonial', 'error');
      setError('Failed to delete testimonial');
    } finally {
      setShowDeleteModal(false);
      setTestimonialToDelete(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`h-4 w-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Testimonials</h1>
          <Button
            onClick={() => router.push('/admin/testimonials/new')}
            variant="primary"
            gradient={true}
            className="flex items-center"
          >
            <FaPlus className="mr-2" /> Add New Testimonial
          </Button>
        </div>

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {testimonials.length === 0 ? (
          <div className="bg-gray-100 p-6 rounded-lg text-center">
            <p className="text-gray-600 mb-4">No testimonials found.</p>
            <Button onClick={() => router.push('/admin/testimonials/new')} variant="primary" size="sm">
              Add Your First Testimonial
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Image</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Quote</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Rating</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Order</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {testimonials.map((testimonial) => (
                  <tr key={testimonial.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="h-12 w-12 rounded-full overflow-hidden relative">
                        {testimonial.image ? (
                          <Image
                            src={getFullImageUrl(testimonial.image)}
                            alt={testimonial.name}
                            fill
                            className="object-cover"

                          />
                        ) : (
                          <div className="h-full w-full bg-gray-300 flex items-center justify-center text-gray-500">
                            {testimonial.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">{testimonial.name}</td>
                    <td className="py-3 px-4 text-gray-600">{testimonial.role}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {testimonial.quote}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {renderStars(testimonial.rating)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={testimonial.isActive ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="py-3 px-4 text-gray-600">{testimonial.order}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEdit(testimonial.id)}
                          variant="ghost"
                          size="sm"
                          className="!p-1"
                          title="Edit"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          onClick={() => handleDelete(testimonial.id)}
                          variant="ghost"
                          size="sm"
                          className="!p-1"
                          title="Delete"
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Testimonial"
        message="Are you sure you want to delete this testimonial? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
